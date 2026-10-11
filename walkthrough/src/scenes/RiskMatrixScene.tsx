import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const RiskMatrixScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleAnim = spring({ frame, fps, config: { damping: 14 } });

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-center px-24 py-16 text-white font-sans relative overflow-hidden">
      <div className="mb-8">
        <span className="text-xs font-mono font-semibold tracking-wider text-amber-400 uppercase">
          Phase 2: Exact Meteorological Safety Engine
        </span>
        <h2 className="text-5xl font-black tracking-tight text-white mt-1">
          Exact Weather Thresholds & Load Overrides
        </h2>
        <p className="text-lg text-slate-400 mt-1">
          Independent evaluation of hazards with critical vehicle weight shear physics
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Table of exact thresholds */}
        <div className="col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            Authoritative Environmental Matrix
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-emerald-400">Low</th>
                <th className="py-3 px-4 text-amber-400">Moderate</th>
                <th className="py-3 px-4 text-orange-400">High</th>
                <th className="py-3 px-4 text-red-400">Severe</th>
                <th className="py-3 px-4 text-red-300 font-bold">No Travel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
              <tr className="hover:bg-slate-850">
                <td className="py-3.5 px-4 font-sans font-bold text-white">Wind (mph)</td>
                <td className="py-3.5 px-4">&lt; 25</td>
                <td className="py-3.5 px-4">25–34</td>
                <td className="py-3.5 px-4">35–44</td>
                <td className="py-3.5 px-4">45–54</td>
                <td className="py-3.5 px-4 font-bold text-red-400">&ge; 55</td>
              </tr>
              <tr className="hover:bg-slate-850">
                <td className="py-3.5 px-4 font-sans font-bold text-white">Rain (in/hr)</td>
                <td className="py-3.5 px-4">&lt; 0.10</td>
                <td className="py-3.5 px-4">0.10–0.25</td>
                <td className="py-3.5 px-4">0.25–0.50</td>
                <td className="py-3.5 px-4">0.50–1.00</td>
                <td className="py-3.5 px-4 font-bold text-red-400">&gt; 1.00</td>
              </tr>
              <tr className="hover:bg-slate-850">
                <td className="py-3.5 px-4 font-sans font-bold text-white">Snow (in/hr)</td>
                <td className="py-3.5 px-4">&lt; 0.5</td>
                <td className="py-3.5 px-4">0.5–1.0</td>
                <td className="py-3.5 px-4">1.0–2.0</td>
                <td className="py-3.5 px-4">2.0–3.0</td>
                <td className="py-3.5 px-4 font-bold text-red-400">&gt; 3.0</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-3">
            <span>Overall checkpoint rating = max(Wind, Rain, Snow)</span>
            <span className="text-emerald-400 font-semibold">Strict boundary tests: 100% Passed</span>
          </div>
        </div>

        {/* Dynamic Load-Dependent Overrides Callout */}
        <div className="col-span-5 space-y-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block mb-2">
              Trailer Rollover Protection
            </span>
            <h3 className="text-xl font-black text-white mb-3">
              Dynamic Load-Dependent Wind Overrides
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-1 mr-2 shrink-0" />
                <span>
                  <strong className="text-white">&ge; 55 mph wind:</strong> Automatic <strong className="text-red-400">No Travel</strong> for any truck load weight.
                </span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-1 mr-2 shrink-0" />
                <span>
                  <strong className="text-white">45–54 mph wind + Load &gt; 30,000 lb:</strong> Escalates to <strong className="text-red-400">No Travel</strong> (lateral shear rollover risk).
                </span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 mr-2 shrink-0" />
                <span>
                  <strong className="text-white">35–44 mph wind + Load &gt; 40,000 lb:</strong> Escalates directly to <strong className="text-amber-400">Severe</strong>.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
            <span className="font-bold text-slate-200">Zero Guesswork: </span>
            Independent hazard evaluation ensures severe winds never bypass safety limits when carrying high loads.
          </div>
        </div>
      </div>
    </div>
  );
};
