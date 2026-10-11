import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface ForecastSliderProps {
  hourOffset: number;
  onChangeHourOffset: (hour: number) => void;
  baseDepartureTime?: string;
  isTimelineMode: boolean;
  onToggleTimelineMode: (isTimeline: boolean) => void;
}

export const ForecastSlider: React.FC<ForecastSliderProps> = ({
  hourOffset,
  onChangeHourOffset,
  baseDepartureTime,
  isTimelineMode,
  onToggleTimelineMode,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-advance play animation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        onChangeHourOffset((hourOffset + 1) % 49);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isPlaying, hourOffset, onChangeHourOffset]);

  // Compute forecasted date/time based on departure time
  const getForecastDateLabel = () => {
    if (!baseDepartureTime) return `T + ${hourOffset} Hours`;
    const base = new Date(baseDepartureTime);
    const offsetDate = new Date(base.getTime() + hourOffset * 3600000);
    return offsetDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Corridor Weather Forecast Timeline (0–48 Hours)
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onToggleTimelineMode(false)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              !isTimelineMode
                ? 'bg-emerald-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Evaluate each checkpoint at the truck's estimated arrival time"
          >
            Checkpoint ETA Mode
          </button>
          <button
            type="button"
            onClick={() => onToggleTimelineMode(true)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              isTimelineMode
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Scan whole corridor weather at specific forecast hour offset"
          >
            Corridor Heatmap (T+{hourOffset}h)
          </button>
        </div>
      </div>

      {/* Interactive Range Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-emerald-400 font-semibold">T+0h (Departure)</span>
          <div className="bg-slate-950 px-3 py-1 rounded-full border border-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span className="font-mono text-white font-bold text-xs">
              T+{hourOffset} Hours: {getForecastDateLabel()}
            </span>
          </div>
          <span className="font-mono text-slate-400">T+48h</span>
        </div>

        <input
          type="range"
          min="0"
          max="48"
          step="1"
          value={hourOffset}
          onChange={(e) => onChangeHourOffset(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />

        {/* Playback Controls & Quick Offsets */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>Play Timeline</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onChangeHourOffset(0);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Reset to Departure (T+0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick hour jumps */}
          <div className="flex items-center space-x-1">
            {[0, 6, 12, 24, 48].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onChangeHourOffset(h)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  hourOffset === h
                    ? 'bg-sky-600/30 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                +{h}h
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
