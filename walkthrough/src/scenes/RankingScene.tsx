import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const RankingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const priorities = [
    { rank: '1', title: 'Fewest Severe Miles', detail: 'Primary safety criterion. Dominates all other metrics.', color: 'text-red-400 border-red-500/40 bg-red-950/40' },
    { rank: '2', title: 'Fewest High Miles', detail: 'Secondary hazard avoidance when Severe miles tie.', color: 'text-orange-400 border-orange-500/40 bg-orange-950/40' },
    { rank: '3', title: 'Lowest Average Risk', detail: 'Distance-weighted exposure score across all route segments (1.0 to 5.0).', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
    { rank: '4', title: 'Shortest Travel Time', detail: 'Final deterministic tie-breaker among equally safe corridors.', color: 'text-sky-400 border-sky-500/40 bg-sky-950/40' },
  ];

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-center px-24 py-16 text-white font-sans relative overflow-hidden">
      <div className="mb-8">
        <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
          Phase 3: Decision Intelligence & Ranking
        </span>
        <h2 className="text-5xl font-black tracking-tight text-white mt-1">
          Strict Lexicographical Route Recommendation
        </h2>
        <p className="text-lg text-slate-400 mt-1">
          No weighted scores that could allow travel time to compromise driver safety
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-center">
        {/* Priority Hierarchy Cards */}
        <div className="col-span-7 space-y-3.5">
          {priorities.map((p, idx) => {
            const spr = spring({ frame: frame - idx * 6, fps, config: { damping: 14 } });
            return (
              <div
                key={idx}
                style={{
                  opacity: spr,
                  transform: `translateX(${(1 - spr) * -25}px)`,
                }}
                className={`p-4 rounded-xl border flex items-center space-x-4 ${p.color}`}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center font-black text-lg font-mono shrink-0">
                  #{p.rank}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{p.title}</h4>
                  <p className="text-xs text-slate-300">{p.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Voronoi Segment Math & No-Travel Policy Callout */}
        <div className="col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
              Voronoi 1D Segment Partitioning
            </h4>
            <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 mb-3 border border-slate-800">
              ∑ (Segment Miles) = Total Highway Miles
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Each checkpoint controls the section of highway halfway between itself and its neighbors. No single checkpoint represents the whole route arbitrarily.
            </p>
          </div>

          <div className="bg-red-950/60 border border-red-700/80 rounded-2xl p-5 shadow-2xl text-xs text-red-200">
            <div className="font-bold text-white mb-1 uppercase tracking-wider flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 animate-ping" />
              Mandatory No-Travel Policy
            </div>
            <p className="leading-relaxed">
              Any route encountering No-Travel segments is disqualified from safe recommendation. If all corridors are hazardous, dispatchers receive an urgent advisory to postpone departure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
