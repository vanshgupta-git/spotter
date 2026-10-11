import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Calendar, Weight, Play, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { searchGeocode } from '../api';
import type { PlanTripParams } from '../api';
import type { GeocodeResult } from '../types';

interface TripFormProps {
  onSubmit: (params: PlanTripParams) => void;
  isLoading: boolean;
}

const PRESET_TRIPS = [
  {
    name: 'Chicago → New York',
    origin: 'Chicago, IL',
    destination: 'New York, NY',
    weight: 35000,
    interval: 25,
  },
  {
    name: 'Dallas → Atlanta',
    origin: 'Dallas, TX',
    destination: 'Atlanta, GA',
    weight: 42000,
    interval: 25,
  },
  {
    name: 'Seattle → Salt Lake City',
    origin: 'Seattle, WA',
    destination: 'Salt Lake City, UT',
    weight: 48000,
    interval: 50,
  },
  {
    name: 'Heavy Load Test (45k lb)',
    origin: 'Denver, CO',
    destination: 'Omaha, NE',
    weight: 45000,
    interval: 25,
  },
];

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [origin, setOrigin] = useState('Chicago, IL');
  const [destination, setDestination] = useState('New York, NY');
  
  // Format default departure time to current or upcoming hour in ISO local format YYYY-MM-DDTHH:MM
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [departureTime, setDepartureTime] = useState(getDefaultDateTime());
  const [loadWeight, setLoadWeight] = useState(38000);
  const [intervalMiles, setIntervalMiles] = useState<number>(25);

  // Autocomplete state
  const [originSuggestions, setOriginSuggestions] = useState<GeocodeResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<GeocodeResult[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (origin.length < 3) {
      setOriginSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchGeocode(origin);
        setOriginSuggestions(results);
      } catch (e) {
        console.error(e);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [origin]);

  useEffect(() => {
    if (destination.length < 3) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchGeocode(destination);
        setDestSuggestions(results);
      } catch (e) {
        console.error(e);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!origin.trim()) {
      setValidationError('Please enter a trip origin.');
      return;
    }
    if (!destination.trim()) {
      setValidationError('Please enter a trip destination.');
      return;
    }
    if (loadWeight < 0 || isNaN(loadWeight)) {
      setValidationError('Load weight must be a non-negative number.');
      return;
    }

    // Convert local datetime to full ISO timestamp
    const depDate = new Date(departureTime);
    if (isNaN(depDate.getTime())) {
      setValidationError('Please select a valid departure date and time.');
      return;
    }

    onSubmit({
      origin: origin.trim(),
      destination: destination.trim(),
      departure_time: depDate.toISOString(),
      load_weight: Number(loadWeight),
      interval_miles: Number(intervalMiles),
    });
  };

  const applyPreset = (preset: typeof PRESET_TRIPS[0]) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setLoadWeight(preset.weight);
    setIntervalMiles(preset.interval);
    setValidationError(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center">
          <Navigation className="w-4 h-4 mr-2 text-blue-600" />
          Dispatch Trip Parameters
        </h2>
        <span className="text-xs text-slate-400 font-medium">Corridor Setup</span>
      </div>

      {/* Preset Corridor Shortcuts */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
          Quick Test Corridors:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TRIPS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors font-medium shadow-2xs"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {validationError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-red-500 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin Field */}
        <div className="relative">
          <label htmlFor="origin-input" className="block text-xs font-semibold text-slate-700 mb-1">
            Origin Location
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-emerald-600" />
            <input
              id="origin-input"
              type="text"
              value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
              placeholder="e.g. Chicago, IL or 41.8781, -87.6298"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              required
            />
          </div>
          {/* Autocomplete Dropdown */}
          {showOriginDropdown && originSuggestions.length > 0 && (
            <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {originSuggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setOrigin(s.display_name);
                    setShowOriginDropdown(false);
                  }}
                  className="px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none"
                >
                  <span className="font-semibold text-slate-900">{s.name}</span>
                  <span className="text-slate-500 ml-1.5">{s.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Destination Field */}
        <div className="relative">
          <label htmlFor="dest-input" className="block text-xs font-semibold text-slate-700 mb-1">
            Destination Location
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-blue-600" />
            <input
              id="dest-input"
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
              placeholder="e.g. New York, NY or 40.7128, -74.0060"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              required
            />
          </div>
          {/* Autocomplete Dropdown */}
          {showDestDropdown && destSuggestions.length > 0 && (
            <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {destSuggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setDestination(s.display_name);
                    setShowDestDropdown(false);
                  }}
                  className="px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none"
                >
                  <span className="font-semibold text-slate-900">{s.name}</span>
                  <span className="text-slate-500 ml-1.5">{s.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Departure Date and Time */}
        <div>
          <label htmlFor="dep-time-input" className="block text-xs font-semibold text-slate-700 mb-1">
            Departure Date & Time
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              id="dep-time-input"
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors font-mono"
              required
            />
          </div>
        </div>

        {/* Load Weight */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Truck Load Weight (lbs)
            </label>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              {Number(loadWeight).toLocaleString()} lbs
            </span>
          </div>
          <div className="relative">
            <Weight className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="number"
              min="0"
              max="150000"
              step="500"
              value={loadWeight}
              onChange={(e) => setLoadWeight(Number(e.target.value))}
              placeholder="e.g. 40000"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors font-mono"
              required
            />
          </div>
          {/* Load Threshold Reference Guide */}
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
            <span className={loadWeight > 40000 ? "text-amber-600 font-semibold" : ""}>
              &gt;40k lb (Severe Wind Rule)
            </span>
            <span className={loadWeight > 30000 ? "text-red-600 font-semibold" : ""}>
              &gt;30k lb (No-Travel Wind Rule)
            </span>
          </div>
        </div>

        {/* Checkpoint Sampling Interval */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Checkpoint Sampling Interval
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 25, 50].map((miles) => (
              <button
                key={miles}
                type="button"
                onClick={() => setIntervalMiles(miles)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                  intervalMiles === miles
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {miles} Miles
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Samples weather every {intervalMiles} miles along road geometry.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Corridors & Road Weather...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Evaluate 3 Weather Routes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
