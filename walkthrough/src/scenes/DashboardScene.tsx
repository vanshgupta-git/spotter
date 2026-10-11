import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scrub slider across 0 to 48 hours smoothly
  const sliderVal = Math.min(48, Math.floor(interpolate(frame, [0, 108], [0, 48])));

  return (
    <div className="w-full h-full bg-slate-100 flex flex-col justify-between px-16 py-8 text-slate-900 font-sans relative overflow-hidden">
      {/* Top Header Mockup matching real Light Enterprise UI */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg p-0.5 bg-gradient-to-tr from-emerald-500 to-sky-500 shadow-sm flex items-center justify-center">
            <Img
              src={staticFile('spotter-logo.jpg')}
              alt="Spotter Brand"
              className="w-full h-full rounded-md object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">SPOTTER</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200 tracking-wide">
                FLEET DISPATCH
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Weather-Aware Commercial Corridor Routing</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Live OSRM Routing
          </span>
          <span className="px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-semibold">
            Open-Meteo Hourly Forecasts
          </span>
          <span className="px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-semibold">
            3 Distinct Corridors
          </span>
        </div>
      </div>

      {/* Main 2-column showcase */}
      <div className="grid grid-cols-12 gap-5 my-3 items-stretch flex-1">
        {/* Left Column: Dispatch Parameters & Route Comparison Cards */}
        <div className="col-span-5 flex flex-col justify-between space-y-2.5">
          {/* Trip Dispatch Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Corridor:</span>
              <span className="text-slate-900 font-bold font-mono">Chicago, IL → New York, NY</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Cargo Load:</span>
              <span className="text-amber-700 font-bold font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                38,000 lbs (High-Wind Active)
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Sampling Interval:</span>
              <span className="text-emerald-700 font-bold font-mono">Every 25 Miles</span>
            </div>
          </div>

          {/* Route Option 1 (Recommended) */}
          <div className="bg-white border-2 border-emerald-500 rounded-xl p-3.5 shadow-md relative">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-xs" />
                Route Option 1 (I-80 E Direct)
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                RECOMMENDED
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 my-2 text-[10px] font-mono text-center">
              <div className="bg-slate-50 border border-slate-200 py-1 rounded text-slate-800 font-semibold">789.5 mi</div>
              <div className="bg-slate-50 border border-slate-200 py-1 rounded text-slate-800 font-semibold">14.8 hrs</div>
              <div className="bg-emerald-50 border border-emerald-200 py-1 rounded text-emerald-700 font-bold">0.0 Sev mi</div>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">
              Safest corridor: 0 Severe miles, 0 High miles, average risk score 1.06.
            </p>
          </div>

          {/* Route Option 2 & 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs shadow-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700 text-[11px] flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                Route Option 2 (I-76 E Turn)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">824.6 mi • 15.5 hrs</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs shadow-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700 text-[11px] flex items-center">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                Alternate Corridor 3
              </span>
              <span className="text-[10px] text-slate-500 font-mono">906.6 mi • 19.1 hrs</span>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Map & 0-48h Slider */}
        <div className="col-span-7 flex flex-col justify-between space-y-2.5">
          {/* Slider visual matching real ForecastSlider */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sky-700">0–48h Forecast Timeline</span>
                <span className="text-[10px] bg-sky-50 text-sky-700 font-medium px-2 py-0.5 rounded border border-sky-200">
                  Corridor Weather
                </span>
              </div>
              <span className="font-mono text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                Departure + {sliderVal} Hours
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-emerald-500 to-sky-500 h-full rounded-full transition-all"
                style={{ width: `${(sliderVal / 48) * 100}%` }}
              />
            </div>
          </div>

          {/* Map Visual Mockup */}
          <div className="flex-1 bg-slate-900 border border-slate-300 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between shadow-md min-h-[260px]">
            {/* Simulated Route Arcs */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 280">
              <path d="M 50 200 Q 270 70 530 110" fill="none" stroke="#10b981" strokeWidth="6" strokeOpacity="0.95" />
              <path d="M 50 200 Q 290 150 530 110" fill="none" stroke="#3b82f6" strokeWidth="4" strokeOpacity="0.6" strokeDasharray="6 6" />
              <path d="M 50 200 Q 230 260 530 110" fill="none" stroke="#a855f7" strokeWidth="4" strokeOpacity="0.6" strokeDasharray="6 6" />

              {/* Weather hazard radial patches */}
              <circle cx="330" cy="100" r="42" fill="#f59e0b" fillOpacity="0.25" />
              <circle cx="270" cy="90" r="32" fill="#10b981" fillOpacity="0.25" />

              {/* Checkpoint pins */}
              <circle cx="50" cy="200" r="7" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <circle cx="160" cy="140" r="5.5" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <circle cx="270" cy="95" r="5.5" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
              <circle cx="400" cy="95" r="5.5" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <circle cx="530" cy="110" r="7" fill="#10b981" stroke="#fff" strokeWidth="2" />
            </svg>

            <div className="relative z-10 flex justify-between items-start text-[11px]">
              <span className="bg-white/95 px-2.5 py-1 rounded-md border border-slate-200 text-slate-800 font-bold shadow">
                Chicago (Origin)
              </span>
              <span className="bg-white/95 px-2.5 py-1 rounded-md border border-slate-200 text-slate-800 font-bold shadow">
                New York (Destination)
              </span>
            </div>

            <div className="relative z-10 self-end bg-white/95 border border-slate-200 p-2.5 rounded-lg text-[10px] space-y-0.5 shadow-lg max-w-[210px]">
              <div className="font-bold text-slate-900">Checkpoint 11 (Mile 275)</div>
              <div className="text-slate-600 font-mono">ETA: Departure + 5.1 hrs</div>
              <div className="text-emerald-700 font-semibold font-mono">Wind 14 mph | Rain 0.00 | Low</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 shadow-xs">
        <span>Interactive Leaflet Map • 0–48h Dynamic Weather Scrubber • Exact Assessment Safety Logic</span>
        <span className="font-bold text-emerald-600">Enterprise Ready ✓</span>
      </div>
    </div>
  );
};
