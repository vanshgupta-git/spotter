import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgesY = interpolate(frame, [30, 45], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white px-16 relative overflow-hidden font-sans">
      {/* Background ambient gradient */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[140px] -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[800px] h-[800px] rounded-full bg-sky-500/10 blur-[140px] -bottom-40 -right-40 pointer-events-none" />

      {/* Brand Icon */}
      <div
        style={{
          transform: `scale(${titleProgress})`,
        }}
        className="w-28 h-28 rounded-2xl bg-emerald-600/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-8 shadow-2xl shadow-emerald-500/20"
      >
        <svg
          className="w-16 h-16"
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
          <path d="M2 3c3 0 4 2 7 2s4-2 7-2 4 2 6 2" className="stroke-emerald-400" />
        </svg>
      </div>

      {/* Main Title */}
      <div
        style={{
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 30}px)`,
        }}
        className="text-center"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-semibold tracking-widest text-emerald-400 uppercase mb-4">
          Full Stack Technical Assessment • Spotter
        </div>
        <h1 className="text-6xl font-black tracking-tight text-white mb-4 leading-tight">
          Weather-Aware Truck Routing
        </h1>
        <p
          style={{ opacity: subtitleOpacity }}
          className="text-2xl text-slate-300 max-w-3xl mx-auto font-light"
        >
          Dynamic 3-Corridor Optimization Balancing Travel Times, Real-Time Severe Weather Hazards & Commercial Load Weights
        </p>
      </div>

      {/* Technology & Zero Cost Badges */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${badgesY}px)`,
        }}
        className="flex items-center gap-4 mt-12"
      >
        <div className="px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm font-semibold flex items-center space-x-2 text-emerald-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Strict ₹0 Zero-Cost Free Tiers</span>
        </div>
        <div className="px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm font-semibold text-slate-300">
          React 19 + TypeScript + Vite + Tailwind CSS
        </div>
        <div className="px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm font-semibold text-slate-300">
          Django 5 + REST Framework + OSRM + Open-Meteo
        </div>
      </div>
    </div>
  );
};
