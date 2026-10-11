import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RouteOption, CorridorPoint } from '../types';
import { Wind, CloudRain, Snowflake, AlertTriangle, Clock, MapPin } from 'lucide-react';

interface MapViewProps {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  forecastHourOffset: number;
  isTimelineMode: boolean;
  corridorHeatmap: CorridorPoint[];
}

const ROUTE_COLORS = [
  '#3b82f6', // Route 1: Bright Blue
  '#10b981', // Route 2: Emerald Green
  '#a855f7', // Route 3: Vivid Purple
];

// Helper to pan/zoom map to fit all route bounds
const FitBounds: React.FC<{ routes: RouteOption[] }> = ({ routes }) => {
  const map = useMap();

  useEffect(() => {
    if (!routes || routes.length === 0) return;
    const allCoords: [number, number][] = [];
    routes.forEach((r) => {
      r.coordinates.forEach(([lon, lat]) => {
        allCoords.push([lat, lon]);
      });
    });

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [routes, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  forecastHourOffset,
  isTimelineMode,
  corridorHeatmap,
}) => {
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="relative w-full h-[600px] lg:h-[720px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        className="w-full h-full z-10"
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap Carto Dark Tile Layer for professional dark dashboard theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <FitBounds routes={routes} />

        {/* 1. CORRIDOR WEATHER HEATMAP LAYER (Active when timeline slider or corridor points exist) */}
        {corridorHeatmap && corridorHeatmap.map((point, idx) => {
          const hourly = point.hourly || [];
          const currentH = hourly.find((h) => h.hour_offset === forecastHourOffset) || hourly[0];
          if (!currentH) return null;

          // Intensity and radius based on risk score (1..5)
          const score = currentH.risk_score || 1;
          const radius = score > 3 ? 32 : (score > 2 ? 24 : 16);
          const opacity = isTimelineMode ? 0.35 : 0.18;

          return (
            <CircleMarker
              key={`heatmap-${idx}-${forecastHourOffset}`}
              center={[point.latitude, point.longitude]}
              radius={radius}
              pathOptions={{
                color: currentH.color,
                fillColor: currentH.color,
                fillOpacity: opacity,
                stroke: false,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <div className="text-xs font-sans text-slate-800">
                  <span className="font-bold">Corridor Weather (T+{forecastHourOffset}h):</span>
                  <div>Risk: {currentH.risk_level} ({currentH.summary})</div>
                  <div>Wind: {currentH.wind_mph ?? 0} mph | Rain: {currentH.rain_in_hr ?? 0} in/hr</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* 2. THREE ALTERNATIVE ROUTE POLYLINES */}
        {routes.map((route, idx) => {
          const isSelected = route.id === selectedRouteId;
          const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
          // Leaflet expects [lat, lon]
          const latLngs: [number, number][] = route.coordinates.map(([lon, lat]) => [lat, lon]);

          return (
            <React.Fragment key={route.id}>
              {/* Outer glow line for active route */}
              {isSelected && (
                <Polyline
                  positions={latLngs}
                  pathOptions={{
                    color: color,
                    weight: 10,
                    opacity: 0.35,
                    lineCap: 'round',
                  }}
                />
              )}
              {/* Main road polyline */}
              <Polyline
                positions={latLngs}
                eventHandlers={{
                  click: () => onSelectRoute(route.id),
                }}
                pathOptions={{
                  color: color,
                  weight: isSelected ? 5.5 : 3.5,
                  opacity: isSelected ? 0.95 : 0.45,
                  dashArray: isSelected ? undefined : '4, 4',
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-semibold text-slate-900">
                    {route.name} ({route.distance_miles.toFixed(1)} mi, {route.duration_hours.toFixed(1)}h)
                  </div>
                </Tooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* 3. CHECKPOINTS ALONG THE ACTIVE ROUTE */}
        {activeRoute && activeRoute.checkpoints.map((cp) => {
          // If in timeline mode, extract checkpoint weather at slider offset, otherwise at ETA
          const hourlyRisks = cp.hourly_risks || [];
          const activeHourly = isTimelineMode
            ? hourlyRisks.find((h) => h.hour_offset === forecastHourOffset)
            : null;

          const riskLevel = activeHourly ? activeHourly.risk_level : cp.risk_data.overall_risk;
          const markerColor = activeHourly ? activeHourly.color : cp.risk_data.color;
          const windMph = activeHourly ? activeHourly.wind_mph : cp.weather.wind_mph;
          const rainInHr = activeHourly ? activeHourly.rain_in_hr : cp.weather.rain_in_hr;
          const snowInHr = activeHourly ? activeHourly.snow_in_hr : cp.weather.snow_in_hr;

          const isOrigin = cp.is_origin;
          const isDest = cp.is_destination;
          const radius = (isOrigin || isDest) ? 8 : 5.5;

          return (
            <CircleMarker
              key={`cp-${cp.index}-${forecastHourOffset}-${isTimelineMode}`}
              center={[cp.latitude, cp.longitude]}
              radius={radius}
              pathOptions={{
                color: '#ffffff',
                fillColor: markerColor,
                fillOpacity: 1.0,
                weight: (isOrigin || isDest) ? 2.5 : 1.5,
              }}
            >
              <Popup>
                <div className="p-1 text-slate-100 text-xs space-y-2 min-w-[210px]">
                  {/* Header */}
                  <div className="border-b border-slate-700 pb-1.5 flex items-center justify-between">
                    <span className="font-bold text-white flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      {cp.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-300">
                      Mile {cp.distance_miles.toFixed(1)}
                    </span>
                  </div>

                  {/* Arrival ETA */}
                  <div className="flex items-center text-slate-300">
                    <Clock className="w-3 h-3 mr-1 text-sky-400 shrink-0" />
                    <span>ETA: <strong className="text-white">{cp.eta_display}</strong></span>
                  </div>

                  {/* Weather Risk Classification */}
                  <div
                    className="px-2 py-1 rounded text-xs font-bold text-white flex items-center justify-between"
                    style={{ backgroundColor: markerColor }}
                  >
                    <span>Risk: {riskLevel}</span>
                    {riskLevel === 'No Travel' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>

                  {/* Weather Observation Details */}
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center">
                        <Wind className="w-3 h-3 mr-1 text-sky-400" /> Wind:
                      </span>
                      <span className="font-mono text-white font-semibold">
                        {windMph !== null ? `${windMph.toFixed(1)} mph` : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center">
                        <CloudRain className="w-3 h-3 mr-1 text-blue-400" /> Rain:
                      </span>
                      <span className="font-mono text-white font-semibold">
                        {rainInHr !== null ? `${rainInHr.toFixed(2)} in/hr` : '0.00'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center">
                        <Snowflake className="w-3 h-3 mr-1 text-teal-300" /> Snow:
                      </span>
                      <span className="font-mono text-white font-semibold">
                        {snowInHr !== null ? `${snowInHr.toFixed(2)} in/hr` : '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Segment Mileage */}
                  {cp.segment_miles !== undefined && (
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      Represents {cp.segment_miles.toFixed(1)} corridor miles.
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur border border-slate-800 p-3 rounded-lg shadow-xl text-xs text-slate-200 pointer-events-auto max-w-[240px]">
        <div className="font-semibold text-white mb-1.5 flex items-center justify-between">
          <span>Route & Risk Legend</span>
        </div>

        {/* Routes */}
        <div className="space-y-1 mb-2 border-b border-slate-800 pb-2">
          {routes.map((r, i) => (
            <div
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className="flex items-center space-x-2 cursor-pointer hover:text-white"
            >
              <span
                className="w-3 h-1.5 rounded-full"
                style={{ backgroundColor: ROUTE_COLORS[i % ROUTE_COLORS.length] }}
              ></span>
              <span className={`truncate text-[11px] ${r.id === selectedRouteId ? 'font-bold text-white' : 'text-slate-400'}`}>
                {r.name} {r.is_recommended ? '★' : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Severity scale */}
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
            <span>Low</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
            <span>High</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
            <span>Severe</span>
          </div>
          <div className="flex items-center space-x-1.5 col-span-2 text-red-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d] border border-red-500"></span>
            <span>No Travel Hazard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
