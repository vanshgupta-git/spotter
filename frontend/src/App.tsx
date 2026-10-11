import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TripForm } from './components/TripForm';
import { RouteList } from './components/RouteList';
import { ForecastSlider } from './components/ForecastSlider';
import { MapView } from './components/MapView';
import { RiskLegendModal } from './components/RiskLegendModal';
import { planTrip } from './api';
import type { PlanTripParams } from './api';
import type { TripPlanResponse } from './types';
import { AlertCircle, RefreshCw, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const [tripData, setTripData] = useState<TripPlanResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [forecastHour, setForecastHour] = useState<number>(0);
  const [isTimelineMode, setIsTimelineMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);

  // Initial load: trigger default trip (Chicago -> New York) on first mount
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);

    const initialParams: PlanTripParams = {
      origin: 'Chicago, IL',
      destination: 'New York, NY',
      departure_time: now.toISOString(),
      load_weight: 38000,
      interval_miles: 25,
    };

    handlePlanTrip(initialParams);
  }, []);

  const handlePlanTrip = async (params: PlanTripParams) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await planTrip(params);
      setTripData(data);
      if (data.routes && data.routes.length > 0) {
        // Default to recommended route or first route
        const recId = data.recommendation.recommended_route_id || data.routes[0].id;
        setSelectedRouteId(recId);
      }
      setForecastHour(0);
    } catch (err: any) {
      console.error('Plan trip error:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to connect to routing backend.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      <Header onToggleInfo={() => setIsRulesModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                const now = new Date();
                handlePlanTrip({
                  origin: 'Chicago, IL',
                  destination: 'New York, NY',
                  departure_time: now.toISOString(),
                  load_weight: 38000,
                  interval_miles: 25,
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form & Alternative Route Comparison Cards */}
          <div className="lg:col-span-5 space-y-6">
            <TripForm onSubmit={handlePlanTrip} isLoading={isLoading} />

            {tripData && tripData.routes && (
              <RouteList
                routes={tripData.routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                overallAdvice={tripData.recommendation?.overall_advice}
                recommendationStatus={tripData.recommendation?.status}
              />
            )}
          </div>

          {/* Right Column: Interactive Map & 0-48h Forecast Timeline */}
          <div className="lg:col-span-7 space-y-4">
            {/* 0-48h Forecast Timeline Slider */}
            <ForecastSlider
              hourOffset={forecastHour}
              onChangeHourOffset={setForecastHour}
              baseDepartureTime={tripData?.trip_input.departure_time}
              isTimelineMode={isTimelineMode}
              onToggleTimelineMode={setIsTimelineMode}
            />

            {/* Leaflet Map with Routes & Weather Heatmap */}
            {tripData && tripData.routes && tripData.routes.length > 0 ? (
              <MapView
                routes={tripData.routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                forecastHourOffset={forecastHour}
                isTimelineMode={isTimelineMode}
                corridorHeatmap={tripData.corridor_heatmap || []}
              />
            ) : (
              <div className="w-full h-[600px] rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-500 p-6 text-center shadow-xs">
                <Compass className="w-12 h-12 text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-800">Awaiting Trip Parameters</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Enter an origin and destination or pick a preset corridor to generate 3 alternative routes with weather risk sampling.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Rules & Methodology Modal */}
      <RiskLegendModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>Spotter Commercial Truck Fleet Dispatch • Built with React, Vite, Tailwind CSS, Leaflet & Django • 100% Free Tiers</p>
      </footer>
    </div>
  );
};

export default App;
