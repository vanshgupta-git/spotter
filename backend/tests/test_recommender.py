"""
Tests proving strict lexicographical route ranking order and No-Travel safety policies.
"""

import pytest
from risk.recommender import rank_and_recommend_routes

class TestRouteRankingPriorities:
    """
    Proves each ranking priority strictly takes precedence over all lower priorities:
    1. Fewest Severe miles
    2. Fewest High miles
    3. Lowest average risk
    4. Shortest travel time
    """

    def test_priority_1_severe_miles_dominates_everything(self):
        """Route with 0 Severe miles MUST beat route with 5 Severe miles, even if the latter is faster."""
        route_a = {
            "id": "route-a",
            "name": "Route A (Zero Severe)",
            "duration_seconds": 36000,  # 10 hrs (slower)
            "risk_summary": {
                "severe_miles": 0.0,
                "high_miles": 50.0,
                "average_risk": 2.8,
                "has_no_travel": False,
            }
        }
        route_b = {
            "id": "route-b",
            "name": "Route B (Has Severe)",
            "duration_seconds": 18000,  # 5 hrs (faster!)
            "risk_summary": {
                "severe_miles": 5.0,
                "high_miles": 0.0,      # 0 High miles!
                "average_risk": 1.2,    # Lower avg risk!
                "has_no_travel": False,
            }
        }

        result = rank_and_recommend_routes([route_b, route_a])
        assert result["recommended_route_id"] == "route-a"
        assert result["ranked_routes"][0]["id"] == "route-a"
        assert result["ranked_routes"][0]["rank"] == 1

    def test_priority_2_high_miles_dominates_avg_risk_and_travel_time(self):
        """When Severe miles are tied, fewest High miles MUST win."""
        route_a = {
            "id": "route-a",
            "name": "Route A (Fewer High miles)",
            "duration_seconds": 25000,
            "risk_summary": {
                "severe_miles": 2.0,
                "high_miles": 10.0,
                "average_risk": 2.9,
                "has_no_travel": False,
            }
        }
        route_b = {
            "id": "route-b",
            "name": "Route B (More High miles)",
            "duration_seconds": 15000,  # Faster
            "risk_summary": {
                "severe_miles": 2.0,    # Tied
                "high_miles": 25.0,     # More High miles
                "average_risk": 2.1,    # Lower avg risk
                "has_no_travel": False,
            }
        }

        result = rank_and_recommend_routes([route_b, route_a])
        assert result["recommended_route_id"] == "route-a"
        assert result["ranked_routes"][0]["id"] == "route-a"

    def test_priority_3_average_risk_dominates_travel_time(self):
        """When Severe and High miles are tied, lowest average risk MUST win."""
        route_a = {
            "id": "route-a",
            "name": "Route A (Lower avg risk)",
            "duration_seconds": 30000,  # Slower
            "risk_summary": {
                "severe_miles": 0.0,
                "high_miles": 5.0,
                "average_risk": 1.45,   # Lower average risk
                "has_no_travel": False,
            }
        }
        route_b = {
            "id": "route-b",
            "name": "Route B (Higher avg risk, faster)",
            "duration_seconds": 20000,  # Faster
            "risk_summary": {
                "severe_miles": 0.0,
                "high_miles": 5.0,
                "average_risk": 1.95,
                "has_no_travel": False,
            }
        }

        result = rank_and_recommend_routes([route_b, route_a])
        assert result["recommended_route_id"] == "route-a"
        assert result["ranked_routes"][0]["id"] == "route-a"

    def test_priority_4_shortest_travel_time_breaks_tie(self):
        """When all risk metrics are identical, shortest travel time wins."""
        route_fast = {
            "id": "route-fast",
            "duration_seconds": 18000,  # 5 hours
            "risk_summary": {
                "severe_miles": 0.0,
                "high_miles": 0.0,
                "average_risk": 1.0,
                "has_no_travel": False,
            }
        }
        route_slow = {
            "id": "route-slow",
            "duration_seconds": 25200,  # 7 hours
            "risk_summary": {
                "severe_miles": 0.0,
                "high_miles": 0.0,
                "average_risk": 1.0,
                "has_no_travel": False,
            }
        }

        result = rank_and_recommend_routes([route_slow, route_fast])
        assert result["recommended_route_id"] == "route-fast"
        assert result["ranked_routes"][0]["id"] == "route-fast"


class TestNoTravelSafetyPolicy:
    def test_no_travel_route_excluded_from_safe_recommendation(self):
        """Even if fastest and 0 severe miles, No-Travel route cannot be recommended."""
        hazardous_route = {
            "id": "route-hazard",
            "duration_seconds": 10000,
            "risk_summary": {
                "severe_miles": 0.0,
                "high_miles": 0.0,
                "average_risk": 1.0,
                "has_no_travel": True,  # Has No-Travel segment
                "no_travel_miles": 15.0,
            }
        }
        safe_route = {
            "id": "route-safe",
            "duration_seconds": 30000,
            "risk_summary": {
                "severe_miles": 2.0,
                "high_miles": 10.0,
                "average_risk": 2.2,
                "has_no_travel": False,
            }
        }

        result = rank_and_recommend_routes([hazardous_route, safe_route])
        assert result["recommended_route_id"] == "route-safe"
        assert result["recommendation_status"] == "RECOMMENDED_SAFE"
        # Hazardous route placed below safe route
        assert result["ranked_routes"][1]["id"] == "route-hazard"
        assert result["ranked_routes"][1]["is_recommended"] is False
        assert result["ranked_routes"][1]["recommendation_badge"] == "NO TRAVEL HAZARD"

    def test_all_routes_hazardous_triggers_critical_warning(self):
        """When all routes have No-Travel conditions, no safe route is recommended."""
        route1 = {
            "id": "r1",
            "duration_seconds": 15000,
            "risk_summary": {"severe_miles": 0.0, "high_miles": 0.0, "average_risk": 3.0, "has_no_travel": True, "no_travel_miles": 10.0}
        }
        route2 = {
            "id": "r2",
            "duration_seconds": 18000,
            "risk_summary": {"severe_miles": 0.0, "high_miles": 0.0, "average_risk": 3.5, "has_no_travel": True, "no_travel_miles": 25.0}
        }

        result = rank_and_recommend_routes([route1, route2])
        assert result["recommendation_status"] == "ALL_ROUTES_HAZARDOUS"
        assert result["recommended_route_id"] is None
        assert "CRITICAL WARNING" in result["overall_advice"]
        for r in result["ranked_routes"]:
            assert r["is_recommended"] is False
