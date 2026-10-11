import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sliderVal = Math.min(48, Math.floor(interpolate(frame, [0, 450], [0, 48])));

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-between px-20 py-12 text-white font-sans relative overflow-hidden">
      {/* Top Header Mockup */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono font-semibold tracking-wider text-sky-400 uppercase">
            Phase 4: Operations Dashboard & Interactive Map
          </span>
          <h2 className="text-4xl font-black tracking-tight text-white mt-1">
            Transportation Operations Interface
          </h2>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold">
            Live OSRM Routing
          </span>
          <span className="px-3 py-1 rounded-full bg-sky-950 border border-sky-500/50 text-sky-300 font-bold">
            Open-Meteo Hourly Forecasts
          </span>
        </div>
      </div>

      {/* Main 2-column showcase */}
      <div className="grid grid-cols-12 gap-6 my-auto items-stretch">
        {/* Left Column: Form & Route Cards */}
        <div className="col-span-5 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Trip Corridor:</span>
              <span className="text-white font-bold font-mono">Chicago, IL → New York, NY</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Truck Load Weight:</span>
              <span className="text-amber-400 font-bold font-mono">38,000 lbs (High-Wind Active)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sampling Frequency:</span>
              <span className="text-emerald-400 font-bold font-mono">Every 25 Miles</span>
            </div>
          </div>

          {/* Route Option 1 (Recommended) */}
          <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-xl p-4 shadow-xl relative">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-sm flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
                Route Option 1 (I-80 E Direct)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                RECOMMENDED
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 my-2 text-[11px] font-mono text-center">
              <div className="bg-slate-950 p-1.5 rounded">789.5 mi</div>
              <div className="bg-slate-950 p-1.5 rounded">14.8 hrs</div>
              <div className="bg-slate-950 p-1.5 rounded text-emerald-400">0.0 Sev mi</div>
            </div>
            <p className="text-[11px] text-slate-300">
              Safest corridor: Lowest Severe miles, lowest High miles, average risk 1.06.
            </p>
          </div>

          {/* Route Option 2 & 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs opacity-75">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2" />
                Route Option 2 (I-76 E Turn)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">824.6 mi • 15.5 hrs</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs opacity-75">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2" />
                Alternate Corridor 3
              </span>
              <span className="text-[10px] text-slate-400 font-mono">906.6 mi • 19.1 hrs</span>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Map & 0-48h Slider */}
        <div className="col-span-7 flex flex-col justify-between space-y-3">
          {/* Slider visual */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-sky-400">0–48h Forecast Timeline</span>
              <span className="font-mono text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Offset: T + {sliderVal} Hours
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-sky-400 h-full rounded-full transition-all"
                style={{ width: `${(sliderVal / 48) * 100}%` }}
              />
            </div>
          </div>

          {/* Interactive Map Visual Mockup */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[300px]">
            <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black opacity-80" />

            {/* Simulated Route Arcs */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 300">
              <path d="M 60 220 Q 280 80 540 120" fill="none" stroke="#10b981" strokeWidth="6" strokeOpacity="0.95" />
              <path d="M 60 220 Q 300 160 540 120" fill="none" stroke="#3b82f6" strokeWidth="4" strokeOpacity="0.5" strokeDasharray="6 6" />
              <path d="M 60 220 Q 240 280 540 120" fill="none" stroke="#a855f7" strokeWidth="4" strokeOpacity="0.5" strokeDasharray="6 6" />

              {/* Heatmap front overlay */}
              <circle cx="340" cy="110" r="45" fill="#f59e0b" fillOpacity="0.25" />
              <circle cx="280" cy="100" r="35" fill="#10b981" fillOpacity="0.25" />

              {/* Checkpoints */}
              <circle cx="60" cy="220" r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <circle cx="170" cy="155" r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <circle cx="280" cy="105" r="6" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
              <circle cx="410" cy="105" r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <circle cx="540" cy="120" r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
            </svg>

            <div className="relative z-10 flex justify-between items-start text-xs">
              <span className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-300">
                Chicago (Origin)
              </span>
              <span className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-300">
                New York (Destination)
              </span>
            </div>

            <div className="relative z-10 self-end bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg text-[11px] space-y-1">
              <div className="font-bold text-white">Checkpoint Popups</div>
              <div className="text-slate-300">Mile 250 • ETA Oct 11, 04:30 PM</div>
              <div className="text-emerald-400 font-mono">Wind: 14 mph | Rain: 0.00 | Low Risk</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-900">
        Interactive Leaflet Map • Weather Corridor Heatmap • Dynamic ETAs
      </div>
    </div>
  );
};
