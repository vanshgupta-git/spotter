"""
Open-Meteo weather forecast adapter.

Fetches real hourly forecast data (wind speed, rain, snowfall) in batch,
normalizes units (mph, in/hr), associates forecasts with checkpoint arrival times (ETAs),
and caches results to stay well within free-tier quotas.
"""

import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import requests

logger = logging.getLogger(__name__)

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
HEADERS = {"User-Agent": "WeatherTruckRouter/1.0 (contact: support@spotter-routing.local)"}

# Simple in-memory cache keyed by (round(lat, 2), round(lon, 2))
_WEATHER_CACHE: Dict[Tuple[float, float], Dict[str, Any]] = {}


def round_coord(lat: float, lon: float) -> Tuple[float, float]:
    """Rounds coordinates to ~1km grid to optimize cache hits and batch efficiency."""
    return round(lat, 2), round(lon, 2)


def fetch_batch_forecasts(coords: List[Tuple[float, float]], forecast_days: int = 3) -> Dict[Tuple[float, float], Dict[str, Any]]:
    """
    Fetches hourly weather forecasts for a list of (lat, lon) coordinates in batches.
    
    Returns:
        Mapping of (lat, lon) -> hourly forecast dictionary.
    """
    results: Dict[Tuple[float, float], Dict[str, Any]] = {}
    needed = []

    for lat, lon in coords:
        key = round_coord(lat, lon)
        if key in _WEATHER_CACHE:
            results[key] = _WEATHER_CACHE[key]
        elif key not in needed:
            needed.append(key)

    if not needed:
        return results

    # Batch in chunks of 25 points to be friendly to public API
    chunk_size = 25
    for i in range(0, len(needed), chunk_size):
        chunk = needed[i:i + chunk_size]
        lats_str = ",".join(str(lat) for lat, lon in chunk)
        lons_str = ",".join(str(lon) for lat, lon in chunk)

        params = {
            "latitude": lats_str,
            "longitude": lons_str,
            "hourly": "wind_speed_10m,precipitation,rain,snowfall,temperature_2m",
            "wind_speed_unit": "mph",
            "precipitation_unit": "inch",
            "forecast_days": forecast_days,
            "timezone": "UTC",
        }

        try:
            resp = requests.get(OPEN_METEO_FORECAST_URL, params=params, headers=HEADERS, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                data_list = data if isinstance(data, list) else [data]
                for (lat, lon), point_data in zip(chunk, data_list):
                    _WEATHER_CACHE[(lat, lon)] = point_data
                    results[(lat, lon)] = point_data
            else:
                logger.warning(f"Open-Meteo returned status {resp.status_code} for batch: {resp.text[:200]}")
        except Exception as e:
            logger.error(f"Open-Meteo weather fetch error: {e}")

    return results


def find_closest_hour_index(target_iso: str, time_series: List[str]) -> int:
    """
    Finds the index in time_series closest to target_iso.
    Format in Open-Meteo: '2026-10-11T14:00'
    """
    if not time_series:
        return -1

    # Extract target YYYY-MM-DDTHH:00
    target_hour_prefix = target_iso[:13] + ":00"
    for idx, t in enumerate(time_series):
        if t.startswith(target_hour_prefix) or t == target_hour_prefix:
            return idx

    # If exact prefix not found, compare datetime diffs
    try:
        # Strip timezone offset if present for comparison
        clean_target = target_iso.replace("Z", "").split("+")[0]
        dt_target = datetime.fromisoformat(clean_target)
        best_idx = 0
        min_diff = float("inf")
        for idx, t in enumerate(time_series):
            dt_t = datetime.fromisoformat(t)
            diff = abs((dt_t - dt_target).total_seconds())
            if diff < min_diff:
                min_diff = diff
                best_idx = idx
        return best_idx
    except Exception:
        return 0


def extract_weather_at_eta(point_forecast: Optional[Dict[str, Any]], eta_iso: str) -> Dict[str, Any]:
    """
    Extracts normalized wind, rain, and snow conditions for a given ETA from the point forecast.
    """
    if not point_forecast or "hourly" not in point_forecast:
        return {
            "wind_mph": None,
            "rain_in_hr": None,
            "snow_in_hr": None,
            "temperature_f": None,
            "matched_time": None,
            "is_available": False,
        }

    hourly = point_forecast["hourly"]
    times = hourly.get("time", [])
    idx = find_closest_hour_index(eta_iso, times)
    if idx < 0 or idx >= len(times):
        return {
            "wind_mph": None,
            "rain_in_hr": None,
            "snow_in_hr": None,
            "temperature_f": None,
            "matched_time": None,
            "is_available": False,
        }

    wind = hourly.get("wind_speed_10m", [None])[idx]
    rain = hourly.get("rain", [None])[idx]
    snow = hourly.get("snowfall", [None])[idx]
    temp = hourly.get("temperature_2m", [None])[idx]

    # Convert Celsius to Fahrenheit if temperature is requested
    temp_f = round(temp * 9.0 / 5.0 + 32.0, 1) if temp is not None else None

    return {
        "wind_mph": round(float(wind), 1) if wind is not None else None,
        "rain_in_hr": round(float(rain), 2) if rain is not None else 0.0,
        "snow_in_hr": round(float(snow), 2) if snow is not None else 0.0,
        "temperature_f": temp_f,
        "matched_time": times[idx],
        "is_available": True,
    }


def extract_hourly_timeline(point_forecast: Optional[Dict[str, Any]], max_hours: int = 49) -> List[Dict[str, Any]]:
    """
    Extracts a 0-48h hourly timeline for a coordinate, enabling instantaneous forecast slider scrubbing.
    """
    if not point_forecast or "hourly" not in point_forecast:
        return []

    hourly = point_forecast["hourly"]
    times = hourly.get("time", [])
    winds = hourly.get("wind_speed_10m", [])
    rains = hourly.get("rain", [])
    snows = hourly.get("snowfall", [])

    timeline = []
    count = min(len(times), max_hours)
    for i in range(count):
        w = winds[i] if i < len(winds) else None
        r = rains[i] if i < len(rains) else 0.0
        s = snows[i] if i < len(snows) else 0.0
        timeline.append({
            "hour_offset": i,
            "time": times[i],
            "wind_mph": round(float(w), 1) if w is not None else None,
            "rain_in_hr": round(float(r), 2) if r is not None else 0.0,
            "snow_in_hr": round(float(s), 2) if s is not None else 0.0,
        })
    return timeline
