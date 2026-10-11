import React from 'react';
import { CloudSun, Info } from 'lucide-react';

interface HeaderProps {
  onToggleInfo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleInfo }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand and Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {/* Original Truck + Weather Isobar SVG Artwork */}
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
              <path d="M14 9h4l3 3v5c0 .6-.4 1-1 1h-2" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
              {/* Dynamic wind wave stream */}
              <path d="M2 3c3 0 4 2 7 2s4-2 7-2 4 2 6 2" className="text-emerald-400 stroke-emerald-400" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">SPOTTER</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                DISPATCH OPS
              </span>
            </div>
            <p className="text-xs text-slate-400">Weather-Aware Commercial Truck Routing</p>
          </div>
        </div>

        {/* Operational Status & Info */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 text-xs text-slate-400 border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-950/60">
            <span className="flex items-center text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
              Live Routing Engine
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center text-slate-300">
              <CloudSun className="w-3.5 h-3.5 mr-1 text-sky-400" />
              Open-Meteo Forecasts
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              OSRM Highway Network
            </span>
          </div>

          {onToggleInfo && (
            <button
              onClick={onToggleInfo}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-xs flex items-center space-x-1"
              title="View Risk Rules & Methodology"
            >
              <Info className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Rules & Methodology</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
