"""
Route checkpoint sampling and arrival-time estimation service.

Uses cumulative road geometry distance (not straight-line lat/lon interpolation)
to generate checkpoints at exact user-selected intervals (10, 25, 50 miles)
and computes time-aware arrival estimates (ETAs).
"""

import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple

EARTH_RADIUS_MILES = 3958.8


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two coordinates in miles.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return EARTH_RADIUS_MILES * c


def build_cumulative_distances(coordinates: List[List[float]]) -> List[float]:
    """
    Builds cumulative mileage array along the sequential road geometry coordinates.
    coordinates format: [[lon, lat], ...]
    """
    n = len(coordinates)
    if n == 0:
        return []
    cumulative = [0.0] * n
    for i in range(1, n):
        lon1, lat1 = coordinates[i - 1][0], coordinates[i - 1][1]
        lon2, lat2 = coordinates[i][0], coordinates[i][1]
        seg_dist = haversine_miles(lat1, lon1, lat2, lon2)
        cumulative[i] = cumulative[i - 1] + seg_dist
    return cumulative


def interpolate_coordinate_at_distance(
    target_dist: float,
    coordinates: List[List[float]],
    cumulative_distances: List[float],
) -> Tuple[float, float]:
    """
    Interpolates [latitude, longitude] at a specific cumulative distance along the road path.
    """
    n = len(coordinates)
    if n == 1 or target_dist <= 0:
        return coordinates[0][1], coordinates[0][0]  # lat, lon
    if target_dist >= cumulative_distances[-1]:
        return coordinates[-1][1], coordinates[-1][0]  # lat, lon

    # Binary search or scan for segment
    for i in range(len(cumulative_distances) - 1):
        d_start = cumulative_distances[i]
        d_end = cumulative_distances[i + 1]
        if d_start <= target_dist <= d_end:
            seg_len = d_end - d_start
            fraction = (target_dist - d_start) / seg_len if seg_len > 1e-6 else 0.0
            lon1, lat1 = coordinates[i][0], coordinates[i][1]
            lon2, lat2 = coordinates[i + 1][0], coordinates[i + 1][1]
            interp_lon = lon1 + fraction * (lon2 - lon1)
            interp_lat = lat1 + fraction * (lat2 - lat1)
            return interp_lat, interp_lon

    return coordinates[-1][1], coordinates[-1][0]


def generate_route_checkpoints(
    coordinates: List[List[float]],
    total_distance_miles: float,
    total_duration_seconds: float,
    departure_datetime: datetime,
    interval_miles: float = 25.0,
) -> List[Dict[str, Any]]:
    """
    Generates sampled checkpoints along the road geometry at specified interval.
    
    Args:
        coordinates: Road geometry points [[lon, lat], ...]
        total_distance_miles: Total route distance
        total_duration_seconds: Total driving duration in seconds
        departure_datetime: Departure date and time
        interval_miles: Sampling frequency (10, 25, or 50 miles)
        
    Returns:
        List of checkpoint objects with coordinates, cumulative miles, and ETA.
    """
    if not coordinates or total_distance_miles <= 0:
        return []

    cumulative = build_cumulative_distances(coordinates)
    geom_total_dist = cumulative[-1] if cumulative else total_distance_miles
    
    # Scale factor to align geometric vertex distance with provider odometer distance
    scale = (total_distance_miles / geom_total_dist) if geom_total_dist > 0 else 1.0

    # Determine sample distances
    target_miles = [0.0]
    current = interval_miles
    while current < total_distance_miles - (interval_miles * 0.25):
        target_miles.append(round(current, 1))
        current += interval_miles
    target_miles.append(round(total_distance_miles, 1))

    checkpoints = []
    for idx, target_dist in enumerate(target_miles):
        # Unscale target distance to locate in geometry
        geom_target = (target_dist / scale) if scale > 0 else target_dist
        lat, lon = interpolate_coordinate_at_distance(geom_target, coordinates, cumulative)

        # Proportional travel time approximation along cumulative distance
        progress_ratio = (target_dist / total_distance_miles) if total_distance_miles > 0 else 0.0
        progress_ratio = max(0.0, min(1.0, progress_ratio))
        elapsed_seconds = progress_ratio * total_duration_seconds
        arrival_dt = departure_datetime + timedelta(seconds=elapsed_seconds)

        is_origin = (idx == 0)
        is_dest = (idx == len(target_miles) - 1)
        name = "Origin" if is_origin else ("Destination" if is_dest else f"Checkpoint #{idx}")

        checkpoints.append({
            "index": idx,
            "name": name,
            "is_origin": is_origin,
            "is_destination": is_dest,
            "distance_miles": round(target_dist, 1),
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "elapsed_seconds": int(elapsed_seconds),
            "elapsed_hours": round(elapsed_seconds / 3600.0, 1),
            "eta_iso": arrival_dt.isoformat(),
            "eta_display": arrival_dt.strftime("%b %d, %I:%M %p"),
            "eta_hour": arrival_dt.hour,
            "eta_date": arrival_dt.strftime("%Y-%m-%d"),
        })

    return checkpoints
