"""
Corridor grid and weather heatmap generator.

Samples points along the trip corridor and attaches 0-48h forecast timelines
to power the interactive weather heatmap and time slider on the map.
"""

from typing import List, Dict, Any, Tuple
from ..adapters.open_meteo import fetch_batch_forecasts, round_coord, extract_hourly_timeline
from risk.engine import evaluate_checkpoint_risk

def build_corridor_heatmap_data(
    all_route_coordinates: List[List[List[float]]],
    load_weight_lbs: float,
    max_grid_points: int = 30,
) -> List[Dict[str, Any]]:
    """
    Creates corridor grid points across the route envelopes with 48-hour risk scores for each hour.
    
    Args:
        all_route_coordinates: List of coordinate lists from each route [[ [lon, lat], ... ], ...]
        load_weight_lbs: Truck load weight for risk calculation
        max_grid_points: Maximum grid points to query to maintain fast response times
        
    Returns:
        List of corridor points, each with latitude, longitude, and an array of hourly points (0..48h).
    """
    if not all_route_coordinates:
        return []

    # Flatten and sample representative points across all routes
    unique_coords: List[Tuple[float, float]] = []
    seen = set()

    for route_coords in all_route_coordinates:
        step = max(1, len(route_coords) // 10)
        for i in range(0, len(route_coords), step):
            lon, lat = route_coords[i][0], route_coords[i][1]
            rounded = round_coord(lat, lon)
            if rounded not in seen:
                seen.add(rounded)
                unique_coords.append(rounded)
                if len(unique_coords) >= max_grid_points:
                    break
        if len(unique_coords) >= max_grid_points:
            break

    # Fetch batch weather
    forecast_map = fetch_batch_forecasts(unique_coords, forecast_days=3)

    corridor_points = []
    for lat, lon in unique_coords:
        pt_forecast = forecast_map.get((lat, lon))
        timeline = extract_hourly_timeline(pt_forecast, max_hours=49)
        
        # Calculate risk score for each hour in timeline
        hourly_risk = []
        for h in timeline:
            risk = evaluate_checkpoint_risk(
                wind_mph=h["wind_mph"],
                rain_in_hr=h["rain_in_hr"],
                snow_in_hr=h["snow_in_hr"],
                load_weight_lbs=load_weight_lbs,
            )
            hourly_risk.append({
                "hour_offset": h["hour_offset"],
                "time": h["time"],
                "wind_mph": h["wind_mph"],
                "rain_in_hr": h["rain_in_hr"],
                "snow_in_hr": h["snow_in_hr"],
                "risk_level": risk["overall_risk"],
                "risk_score": risk["overall_score"],
                "color": risk["color"],
                "summary": risk["summary"],
            })

        corridor_points.append({
            "latitude": lat,
            "longitude": lon,
            "hourly": hourly_risk,
        })

    return corridor_points
