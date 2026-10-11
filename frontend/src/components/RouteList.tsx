import React from 'react';
import type { RouteOption } from '../types';
import { Award, AlertTriangle, ShieldCheck, Clock, Wind, Flame } from 'lucide-react';

interface RouteListProps {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  overallAdvice?: string;
  recommendationStatus?: string;
}

const ROUTE_THEMES = [
  {
    border: 'border-blue-500',
    bgBadge: 'bg-blue-600',
    colorHex: '#3b82f6',
    dot: 'bg-blue-500',
    label: 'Option 1 (Blue)',
  },
  {
    border: 'border-emerald-500',
    bgBadge: 'bg-emerald-600',
    colorHex: '#10b981',
    dot: 'bg-emerald-500',
    label: 'Option 2 (Emerald)',
  },
  {
    border: 'border-purple-500',
    bgBadge: 'bg-purple-600',
    colorHex: '#8b5cf6',
    dot: 'bg-purple-500',
    label: 'Option 3 (Purple)',
  },
];

export const RouteList: React.FC<RouteListProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  overallAdvice,
  recommendationStatus,
}) => {
  return (
    <div className="space-y-4">
      {/* Dispatch Advice Banner */}
      {overallAdvice && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed shadow-xs flex items-start space-x-3 ${
            recommendationStatus === 'ALL_ROUTES_HAZARDOUS'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          {recommendationStatus === 'ALL_ROUTES_HAZARDOUS' ? (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1">
              {recommendationStatus === 'ALL_ROUTES_HAZARDOUS'
                ? 'Weather Advisory: Hazardous Corridor'
                : 'Optimal Route Recommendation'}
            </span>
            <p className="font-medium">{overallAdvice}</p>
          </div>
        </div>
      )}

      {/* Route Cards */}
      <div className="space-y-3">
        {routes.map((route, idx) => {
          const theme = ROUTE_THEMES[idx % ROUTE_THEMES.length];
          const isSelected = selectedRouteId === route.id;
          const { severe_miles, high_miles, no_travel_miles, average_risk, has_no_travel } = route.risk_summary;

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white border-2 border-blue-600 ring-4 ring-blue-500/10 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${theme.dot}`}></span>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {route.name}
                  </h3>
                </div>

                {/* Badge */}
                {route.is_recommended ? (
                  <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>RECOMMENDED</span>
                  </span>
                ) : has_no_travel ? (
                  <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-300 text-red-800 text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>NO TRAVEL HAZARD</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
                    ALTERNATIVE #{route.rank}
                  </span>
                )}
              </div>

              {/* Trip distance and duration */}
              <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px] font-medium">Highway Distance</span>
                  <span className="font-mono text-slate-900 text-sm font-bold">
                    {route.distance_miles.toFixed(1)} miles
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px] font-medium">Estimated Drive Time</span>
                  <span className="font-mono text-slate-900 text-sm font-bold flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {route.duration_hours.toFixed(1)} hrs
                  </span>
                </div>
              </div>

              {/* Weather Risk Metric Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center font-medium">
                    <Flame className="w-3.5 h-3.5 mr-1 text-red-500" />
                    Severe Risk Miles:
                  </span>
                  <span className={`font-mono font-bold ${severe_miles > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                    {severe_miles.toFixed(1)} mi
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center font-medium">
                    <Wind className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    High Risk Miles:
                  </span>
                  <span className={`font-mono font-bold ${high_miles > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {high_miles.toFixed(1)} mi
                  </span>
                </div>

                {has_no_travel && (
                  <div className="flex items-center justify-between text-xs text-red-700 font-semibold bg-red-50 px-2 py-1 rounded border border-red-200">
                    <span className="flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600" />
                      No Travel Miles:
                    </span>
                    <span className="font-mono">{no_travel_miles.toFixed(1)} mi</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600 font-medium">Weighted Average Risk (1.0–5.0):</span>
                  <span className="font-mono font-bold text-blue-700">
                    {average_risk.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Transparent Rationale / Explanation */}
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-normal">
                <span className="font-semibold text-slate-700">Decision Rationale: </span>
                {route.recommendation_explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
