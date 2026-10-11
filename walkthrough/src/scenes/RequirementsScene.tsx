import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const RequirementsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 14 } });

  const cards = [
    {
      step: '01',
      title: '3 Genuine Alternative Routes',
      desc: 'Never duplicates or renders synthetic lines. Employs OSRM highway graphs with lateral corridor exploration to deliver 3 legal, distinct drivable routes.',
      tag: 'Routing Provider: OSRM',
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    },
    {
      step: '02',
      title: 'Road-Geometry Checkpoint Sampling',
      desc: 'Samples weather strictly along cumulative highway mileage (10, 25, or 50 miles) rather than straight-line geometric chords, matching true odometer miles.',
      tag: 'Cumulative Haversine Math',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
    {
      step: '03',
      title: 'Time-Aware Arrival Estimation (ETAs)',
      desc: 'Each checkpoint computes arrival timestamp based on departure time and segment driving speed, fetching forecasted conditions matching truck arrival.',
      tag: 'Dynamic Open-Meteo Matching',
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    },
  ];

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-center px-24 py-16 text-white font-sans relative overflow-hidden">
      <div className="mb-10">
        <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
          Phase 1: Routing & Spatial Foundation
        </span>
        <h2 className="text-5xl font-black tracking-tight text-white mt-2">
          Precision Routing & Dynamic Time Sampling
        </h2>
        <p className="text-xl text-slate-400 mt-2">
          Meeting every requirement of the Spotter Full-Stack Specification
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {cards.map((c, i) => {
          const delay = i * 8;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15 },
          });

          return (
            <div
              key={i}
              style={{
                opacity: cardSpring,
                transform: `translateY(${(1 - cardSpring) * 35}px)`,
              }}
              className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-2xl relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-slate-600 font-mono">
                    {c.step}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${c.color}`}>
                    {c.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  {c.title}
                </h3>
                <p className="text-base text-slate-300 leading-relaxed">
                  {c.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Verified with Unit Tests</span>
                <span className="text-emerald-400 font-bold">100% Compliant ✓</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
