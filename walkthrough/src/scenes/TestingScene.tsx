import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const TestingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleAnim = spring({ frame, fps, config: { damping: 14 } });

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-center px-24 py-16 text-white font-sans relative overflow-hidden">
      <div className="mb-10 text-center">
        <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
          Phase 5: Automated QA & Verification
        </span>
        <h2 className="text-5xl font-black tracking-tight text-white mt-1">
          Full Test Suite & Production Deliverables
        </h2>
        <p className="text-lg text-slate-400 mt-1 max-w-2xl mx-auto">
          Deterministic fixture-based testing ensuring bulletproof reliability across all edge cases
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        {/* Backend Tests */}
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Pytest Suite</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                64 / 64 PASSED
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Backend Risk & Routing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Exhaustively covers every wind, rain, and snow boundary condition, load rules, Voronoi segment math, and lexicographical priority assertions.
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
            ✓ 64 passed in 11.40s
          </div>
        </div>

        {/* Frontend Tests */}
        <div className="bg-slate-900 border border-sky-500/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Vitest Suite</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                7 / 7 PASSED
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Frontend Components</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Validates trip dispatch form validation, corridor preset switches, route comparison cards, and 0–48h forecast timeline scrubber.
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-sky-400">
            ✓ 3 files passed, 7 tests passed
          </div>
        </div>

        {/* Production Build & GitHub */}
        <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Vite Production</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                VERIFIED
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Published to GitHub</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              github.com/vanshgupta-git/spotter
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-purple-400">
            ✓ Production ready on main branch
          </div>
        </div>
      </div>
    </div>
  );
};
