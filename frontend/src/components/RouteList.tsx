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
          className={`p-4 rounded-xl border text-xs leading-relaxed shadow-lg flex items-start space-x-3 ${
            recommendationStatus === 'ALL_ROUTES_HAZARDOUS'
              ? 'bg-red-950/80 border-red-700 text-red-200'
              : 'bg-emerald-950/70 border-emerald-700/80 text-emerald-100'
          }`}
        >
          {recommendationStatus === 'ALL_ROUTES_HAZARDOUS' ? (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1">
              {recommendationStatus === 'ALL_ROUTES_HAZARDOUS'
                ? 'Weather Advisory: Hazardous Corridor'
                : 'Optimal Route Recommendation Engine'}
            </span>
            <p>{overallAdvice}</p>
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
                  ? `bg-slate-850 ${theme.border} ring-2 ring-${theme.border.replace('border-', '')}/40 shadow-xl`
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${theme.dot}`}></span>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {route.name}
                  </h3>
                </div>

                {/* Badge */}
                {route.is_recommended ? (
                  <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <Award className="w-3.5 h-3.5" />
                    <span>RECOMMENDED</span>
                  </span>
                ) : has_no_travel ? (
                  <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-950 border border-red-700 text-red-300 text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>NO TRAVEL HAZARD</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                    ALTERNATIVE #{route.rank}
                  </span>
                )}
              </div>

              {/* Trip distance and duration */}
              <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Distance</span>
                  <span className="font-mono text-white text-sm font-semibold">
                    {route.distance_miles.toFixed(1)} miles
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Travel Duration</span>
                  <span className="font-mono text-white text-sm font-semibold flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    {route.duration_hours.toFixed(1)} hrs
                  </span>
                </div>
              </div>

              {/* Weather Risk Metric Breakdown */}
              <div className="space-y-1.5 pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center">
                    <Flame className="w-3.5 h-3.5 mr-1 text-red-400" />
                    Severe Risk Miles:
                  </span>
                  <span className={`font-mono font-bold ${severe_miles > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {severe_miles.toFixed(1)} mi
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center">
                    <Wind className="w-3.5 h-3.5 mr-1 text-orange-400" />
                    High Risk Miles:
                  </span>
                  <span className={`font-mono font-bold ${high_miles > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
                    {high_miles.toFixed(1)} mi
                  </span>
                </div>

                {has_no_travel && (
                  <div className="flex items-center justify-between text-xs text-red-400 font-semibold bg-red-950/40 px-2 py-1 rounded border border-red-900">
                    <span className="flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-400" />
                      No Travel Miles:
                    </span>
                    <span className="font-mono">{no_travel_miles.toFixed(1)} mi</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Weighted Average Risk (1.0-5.0):</span>
                  <span className="font-mono font-bold text-sky-400">
                    {average_risk.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Transparent Rationale / Explanation */}
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-normal">
                <span className="font-semibold text-slate-300">Decision Rationale: </span>
                {route.recommendation_explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
