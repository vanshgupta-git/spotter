"""
End-to-end trip planning service.

Orchestrates:
1. Geocoding
2. 3-Route calculation
3. Cumulative geometry checkpoint sampling
4. Batch weather retrieval & unit normalization
5. Checkpoint risk evaluation with load-dependent wind rules
6. Segment-mile aggregation
7. Strict lexicographical route ranking & recommendation
8. 0-48h Corridor weather heatmap generation
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

from ..adapters.geocoding import search_locations, parse_direct_coordinates
from ..adapters.osrm import OSRMRoutingProvider
from .checkpoints import generate_route_checkpoints
from weather.adapters.open_meteo import fetch_batch_forecasts, extract_weather_at_eta, extract_hourly_timeline
from weather.services.corridor import build_corridor_heatmap_data
from risk.engine import evaluate_checkpoint_risk
from risk.segment_calculator import aggregate_route_risk
from risk.recommender import rank_and_recommend_routes

logger = logging.getLogger(__name__)


def resolve_location(loc_input: Any) -> Tuple[float, float, str]:
    """
    Resolves location input (dict or string) into (lat, lon, display_name).
    """
    if isinstance(loc_input, dict):
        lat = float(loc_input.get("latitude") or loc_input.get("lat"))
        lon = float(loc_input.get("longitude") or loc_input.get("lon"))
        name = loc_input.get("display_name") or loc_input.get("name") or f"{lat:.4f}, {lon:.4f}"
        return lat, lon, name

    if isinstance(loc_input, (list, tuple)) and len(loc_input) >= 2:
        lat, lon = float(loc_input[0]), float(loc_input[1])
        return lat, lon, f"{lat:.4f}, {lon:.4f}"

    if isinstance(loc_input, str):
        direct = parse_direct_coordinates(loc_input)
        if direct:
            return direct["latitude"], direct["longitude"], direct["display_name"]
        
        results = search_locations(loc_input, limit=1)
        if results:
            return results[0]["latitude"], results[0]["longitude"], results[0]["display_name"]
        raise ValueError(f"Could not geocode location: '{loc_input}'. Please check the place name or enter coordinates.")

    raise ValueError(f"Invalid location format: {loc_input}")


def plan_truck_routes(
    origin_input: Any,
    destination_input: Any,
    departure_time_iso: str,
    load_weight_lbs: float,
    interval_miles: float = 25.0,
    mock_weather_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Plans 3 weather-aware truck routes and returns full evaluation, ETAs, risk, and heatmap.
    """
    # 1. Resolve locations
    orig_lat, orig_lon, orig_name = resolve_location(origin_input)
    dest_lat, dest_lon, dest_name = resolve_location(destination_input)

    # 2. Parse departure time
    try:
        clean_dep = departure_time_iso.replace("Z", "+00:00")
        dep_dt = datetime.fromisoformat(clean_dep)
    except Exception:
        dep_dt = datetime.now(timezone.utc)

    # 3. Retrieve 3 genuine routes from routing provider
    router = OSRMRoutingProvider()
    routes = router.get_routes(orig_lat, orig_lon, dest_lat, dest_lon)

    if not routes:
        raise RuntimeError("Routing provider could not find a drivable route between the specified locations.")

    # 4. Generate checkpoints along each route
    all_unique_coords = []
    seen_coords = set()

    for route in routes:
        coords = route.get("coordinates", [])
        dist_mi = route.get("distance_miles", 0.0)
        dur_s = route.get("duration_seconds", 0.0)
        
        cps = generate_route_checkpoints(
            coordinates=coords,
            total_distance_miles=dist_mi,
            total_duration_seconds=dur_s,
            departure_datetime=dep_dt,
            interval_miles=interval_miles,
        )
        route["checkpoints"] = cps

        for cp in cps:
            c_key = (cp["latitude"], cp["longitude"])
            if c_key not in seen_coords:
                seen_coords.add(c_key)
                all_unique_coords.append(c_key)

    # 5. Fetch batch weather forecasts (or use mock fixture if provided in test)
    if mock_weather_data is not None:
        forecast_map = mock_weather_data
    else:
        forecast_map = fetch_batch_forecasts(all_unique_coords, forecast_days=3)

    # 6. Evaluate weather and risk at each checkpoint
    for route in routes:
        cps = route.get("checkpoints", [])
        for cp in cps:
            c_key = (round(cp["latitude"], 2), round(cp["longitude"], 2))
            pt_forecast = forecast_map.get(c_key)
            weather = extract_weather_at_eta(pt_forecast, cp["eta_iso"])
            timeline = extract_hourly_timeline(pt_forecast, max_hours=49)

            risk_eval = evaluate_checkpoint_risk(
                wind_mph=weather["wind_mph"],
                rain_in_hr=weather["rain_in_hr"],
                snow_in_hr=weather["snow_in_hr"],
                load_weight_lbs=load_weight_lbs,
            )

            # Pre-compute hourly risk for the 0-48h slider
            hourly_risks = []
            for h in timeline:
                h_risk = evaluate_checkpoint_risk(
                    wind_mph=h["wind_mph"],
                    rain_in_hr=h["rain_in_hr"],
                    snow_in_hr=h["snow_in_hr"],
                    load_weight_lbs=load_weight_lbs,
                )
                hourly_risks.append({
                    "hour_offset": h["hour_offset"],
                    "time": h["time"],
                    "wind_mph": h["wind_mph"],
                    "rain_in_hr": h["rain_in_hr"],
                    "snow_in_hr": h["snow_in_hr"],
                    "risk_level": h_risk["overall_risk"],
                    "risk_score": h_risk["overall_score"],
                    "color": h_risk["color"],
                })

            cp["weather"] = weather
            cp["risk_data"] = risk_eval
            cp["hourly_risks"] = hourly_risks

        # 7. Aggregate segment miles and route risk
        risk_summary = aggregate_route_risk(cps, route.get("distance_miles", 0.0))
        route["risk_summary"] = risk_summary

    # 8. Rank and recommend routes lexicographically
    recommendation_result = rank_and_recommend_routes(routes)

    # 9. Build corridor heatmap data (grid with 48h risk overlay)
    all_routes_coords = [r.get("coordinates", []) for r in routes]
    corridor_heatmap = build_corridor_heatmap_data(all_routes_coords, load_weight_lbs)

    return {
        "status": "success",
        "trip_input": {
            "origin": {"name": orig_name, "latitude": orig_lat, "longitude": orig_lon},
            "destination": {"name": dest_name, "latitude": dest_lat, "longitude": dest_lon},
            "departure_time": dep_dt.isoformat(),
            "load_weight_lbs": load_weight_lbs,
            "interval_miles": interval_miles,
        },
        "recommendation": {
            "status": recommendation_result["recommendation_status"],
            "overall_advice": recommendation_result["overall_advice"],
            "recommended_route_id": recommendation_result["recommended_route_id"],
        },
        "routes": recommendation_result["ranked_routes"],
        "corridor_heatmap": corridor_heatmap,
    }
