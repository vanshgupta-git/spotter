import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';

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

  const badgesY = interpolate(frame, [28, 44], [35, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white px-16 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute w-[850px] h-[850px] rounded-full bg-emerald-500/15 blur-[150px] -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[850px] h-[850px] rounded-full bg-sky-500/15 blur-[150px] -bottom-40 -right-40 pointer-events-none" />

      {/* Official AI-Generated Spotter Brand Logo */}
      <div
        style={{
          transform: `scale(${titleProgress})`,
        }}
        className="relative mb-7"
      >
        <div className="w-28 h-28 rounded-2xl p-1 bg-gradient-to-tr from-emerald-400 via-sky-400 to-emerald-300 shadow-2xl shadow-emerald-500/30 flex items-center justify-center">
          <Img
            src={staticFile('spotter-logo.jpg')}
            alt="Spotter Brand"
            className="w-full h-full rounded-xl object-cover"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
          Live v1.0
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div
        style={{
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 25}px)`,
        }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-semibold tracking-widest text-emerald-400 uppercase mb-4 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Full Stack Technical Assessment • Spotter
        </div>
        <h1 className="text-6xl font-black tracking-tight text-white mb-4 leading-tight">
          Weather-Aware Truck Routing
        </h1>
        <p
          style={{ opacity: subtitleOpacity }}
          className="text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-snug"
        >
          Dynamic 3-Corridor Optimization Balancing Real-Time Highway Hazards, Commercial Load Weights & Travel Times
        </p>
      </div>

      {/* Tech Stack & Cloud Deployment Badges */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${badgesY}px)`,
        }}
        className="flex items-center gap-3.5 mt-10"
      >
        <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-2 text-emerald-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Strict $0 Zero-Cost Architecture</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-sky-500/30 text-xs font-semibold text-sky-300 shadow-lg flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Live Deploy: Vercel SPA + Render Cloud API</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 shadow-lg">
          React 19 + Django 5 + OSRM + Open-Meteo
        </div>
      </div>
    </div>
  );
};
