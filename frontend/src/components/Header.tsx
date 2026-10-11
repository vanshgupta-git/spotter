import React from 'react';
import { CloudSun, Info } from 'lucide-react';

interface HeaderProps {
  onToggleInfo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleInfo }) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand and Logo */}
        <div className="flex items-center space-x-3.5">
          <img
            src="/spotter-logo.jpg"
            alt="Spotter Logo"
            className="h-10 w-10 object-contain rounded-lg border border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">SPOTTER</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200 tracking-wide">
                FLEET DISPATCH
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Weather-Aware Commercial Corridor Routing</p>
          </div>
        </div>

        {/* Operational Status & Info */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
            <span className="flex items-center text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
              Live Routing Engine
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center text-slate-600 font-medium">
              <CloudSun className="w-3.5 h-3.5 mr-1 text-sky-600" />
              Open-Meteo Weather
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">
              OSRM Corridors
            </span>
          </div>

          {onToggleInfo && (
            <button
              onClick={onToggleInfo}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 text-xs font-medium flex items-center space-x-1.5 shadow-2xs"
              title="View Risk Rules & Methodology"
            >
              <Info className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Risk Rules & Matrix</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
