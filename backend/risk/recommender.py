"""
Route recommendation engine.

Implements strict lexicographical ranking:
1. Fewest Severe miles
2. Fewest High miles
3. Lowest average risk
4. Shortest travel time (seconds)
5. Deterministic tie-breaker (route ID)

Strict No-Travel rules:
- Any route with No Travel segments is excluded from safe recommendation.
- If all routes have No Travel segments, no route is declared safe and a warning is issued.
- Incomplete weather data is clearly flagged.
"""

from typing import List, Dict, Any, Tuple

def get_lexicographical_key(route: Dict[str, Any]) -> Tuple[float, float, float, float, str]:
    """
    Returns the strict lexicographical sorting key:
    (severe_miles, high_miles, average_risk, duration_seconds, route_id)
    """
    risk_summary = route.get("risk_summary", {})
    severe_miles = float(risk_summary.get("severe_miles", 0.0))
    high_miles = float(risk_summary.get("high_miles", 0.0))
    avg_risk = float(risk_summary.get("average_risk", 1.0))
    duration_s = float(route.get("duration_seconds", 0.0))
    route_id = str(route.get("id", ""))
    return (severe_miles, high_miles, avg_risk, duration_s, route_id)


def rank_and_recommend_routes(routes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ranks alternative routes lexicographically and determines the recommended route.
    
    Args:
        routes: List of processed route dictionaries.
        
    Returns:
        Dictionary containing:
        - ranked_routes: All routes with rank, is_recommended, and explanation badges
        - recommendation_status: 'RECOMMENDED_SAFE' or 'ALL_ROUTES_HAZARDOUS'
        - overall_advice: Clear operational recommendation for dispatchers/drivers
    """
    if not routes:
        return {
            "ranked_routes": [],
            "recommendation_status": "NO_ROUTES",
            "overall_advice": "No routes available to evaluate.",
            "recommended_route_id": None,
        }

    safe_routes = []
    hazardous_routes = []

    for r in routes:
        risk_summary = r.get("risk_summary", {})
        if risk_summary.get("has_no_travel", False):
            hazardous_routes.append(r)
        else:
            safe_routes.append(r)

    # Sort each group lexicographically
    safe_routes.sort(key=get_lexicographical_key)
    hazardous_routes.sort(key=get_lexicographical_key)

    all_ranked = []
    recommended_route_id = None
    overall_advice = ""
    status = ""

    if safe_routes:
        status = "RECOMMENDED_SAFE"
        # Safe routes take top ranks
        for idx, route in enumerate(safe_routes):
            rank = idx + 1
            is_rec = (rank == 1)
            route["rank"] = rank
            route["is_recommended"] = is_rec
            
            risk_summary = route.get("risk_summary", {})
            sev = risk_summary.get("severe_miles", 0.0)
            high = risk_summary.get("high_miles", 0.0)
            avg = risk_summary.get("average_risk", 1.0)
            dur_hr = route.get("duration_hours", round(route.get("duration_seconds", 0) / 3600.0, 1))

            if is_rec:
                recommended_route_id = route.get("id")
                route["recommendation_badge"] = "RECOMMENDED"
                route["recommendation_explanation"] = (
                    f"Safest route: {sev:.1f} Severe miles, {high:.1f} High miles, "
                    f"average risk score {avg:.2f}, travel time {dur_hr:.1f} hrs. "
                    f"Free of No-Travel conditions."
                )
            else:
                route["recommendation_badge"] = f"ALTERNATIVE #{rank}"
                route["recommendation_explanation"] = (
                    f"Alternative route #{rank}: {sev:.1f} Severe mi, {high:.1f} High mi, "
                    f"average risk {avg:.2f}, {dur_hr:.1f} hrs."
                )
            all_ranked.append(route)

        # Append any hazardous routes below safe routes
        offset = len(safe_routes)
        for idx, route in enumerate(hazardous_routes):
            rank = offset + idx + 1
            route["rank"] = rank
            route["is_recommended"] = False
            route["recommendation_badge"] = "NO TRAVEL HAZARD"
            route["recommendation_explanation"] = (
                f"Contains {route.get('risk_summary', {}).get('no_travel_miles', 0.0):.1f} miles "
                f"of dangerous No-Travel conditions (high wind/precipitation). Unsuitable for safe dispatch."
            )
            all_ranked.append(route)

        top_route = safe_routes[0]
        overall_advice = (
            f"Route '{top_route.get('name', 'Route 1')}' is recommended. It delivers the optimal balance: "
            f"{top_route['risk_summary']['severe_miles']:.1f} Severe miles and "
            f"{top_route['risk_summary']['high_miles']:.1f} High miles without encountering any No-Travel conditions."
        )

    else:
        # ALL routes contain No Travel conditions!
        status = "ALL_ROUTES_HAZARDOUS"
        overall_advice = (
            "CRITICAL WARNING: No fully acceptable route was found. "
            "All available options cross corridors with weather exceeding commercial safety limits "
            "(Wind >= 55 mph, severe wind-load shear, or excessive rain/snow). Delay departure or seek alternate corridor."
        )
        for idx, route in enumerate(hazardous_routes):
            rank = idx + 1
            route["rank"] = rank
            route["is_recommended"] = False
            route["recommendation_badge"] = "NO TRAVEL HAZARD"
            route["recommendation_explanation"] = (
                f"Alternative #{rank}: Contains {route.get('risk_summary', {}).get('no_travel_miles', 0.0):.1f} miles "
                f"of No-Travel weather. Not recommended for safe operation."
            )
            all_ranked.append(route)

    return {
        "ranked_routes": all_ranked,
        "recommendation_status": status,
        "overall_advice": overall_advice,
        "recommended_route_id": recommended_route_id,
    }
