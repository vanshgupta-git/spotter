"""
Segment-based mileage aggregation and risk scoring for routes.

Calculates Severe miles, High miles, Moderate miles, Low miles, No Travel miles,
and distance-weighted average risk along the cumulative road geometry.
"""

from typing import List, Dict, Any
from .engine import RiskLevel, RISK_ORDER

def compute_segment_boundaries(checkpoint_distances: List[float], total_route_distance: float) -> List[float]:
    """
    Computes representative segment lengths for each checkpoint using Voronoi/midpoint partitioning
    along the 1D cumulative route distance.
    
    Guarantees:
    - sum(segment_lengths) == total_route_distance (within floating point precision)
    - Each checkpoint controls the section of road closest to it.
    """
    n = len(checkpoint_distances)
    if n == 0:
        return []
    if n == 1:
        return [max(0.0, total_route_distance)]

    segment_lengths = [0.0] * n
    # For first checkpoint: from 0 to midpoint between d_0 and d_1
    mid_first = (checkpoint_distances[0] + checkpoint_distances[1]) / 2.0
    segment_lengths[0] = max(0.0, mid_first)

    # For intermediate checkpoints: between consecutive midpoints
    for i in range(1, n - 1):
        mid_prev = (checkpoint_distances[i - 1] + checkpoint_distances[i]) / 2.0
        mid_next = (checkpoint_distances[i] + checkpoint_distances[i + 1]) / 2.0
        segment_lengths[i] = max(0.0, mid_next - mid_prev)

    # For last checkpoint: from previous midpoint to total_route_distance
    mid_last = (checkpoint_distances[n - 2] + checkpoint_distances[n - 1]) / 2.0
    segment_lengths[n - 1] = max(0.0, total_route_distance - mid_last)

    # Re-normalize slightly if total differs due to rounding
    total_assigned = sum(segment_lengths)
    if total_assigned > 0 and abs(total_assigned - total_route_distance) > 1e-4:
        ratio = total_route_distance / total_assigned
        segment_lengths = [sl * ratio for sl in segment_lengths]

    return segment_lengths


def aggregate_route_risk(
    checkpoints: List[Dict[str, Any]],
    total_distance_miles: float,
) -> Dict[str, Any]:
    """
    Aggregates weather risk across all checkpoints using segment-weighted mileage.
    
    Args:
        checkpoints: List of evaluated checkpoint dictionaries containing:
                     'distance_miles', 'risk_data' (with 'overall_risk', 'overall_score', etc.)
        total_distance_miles: Actual total distance of the route in miles.
        
    Returns:
        Summary dictionary with severe_miles, high_miles, moderate_miles, low_miles,
        no_travel_miles, weighted average_risk, no_travel_flag, and incomplete_flag.
    """
    if not checkpoints or total_distance_miles <= 0:
        return {
            "severe_miles": 0.0,
            "high_miles": 0.0,
            "moderate_miles": 0.0,
            "low_miles": 0.0,
            "no_travel_miles": 0.0,
            "average_risk": 1.0,
            "has_no_travel": False,
            "has_incomplete_weather": False,
            "total_distance_miles": total_distance_miles,
        }

    distances = [float(cp.get("distance_miles", 0.0)) for cp in checkpoints]
    segment_lengths = compute_segment_boundaries(distances, total_distance_miles)

    severe_miles = 0.0
    high_miles = 0.0
    moderate_miles = 0.0
    low_miles = 0.0
    no_travel_miles = 0.0
    weighted_score_sum = 0.0
    has_no_travel = False
    has_incomplete_weather = False

    for cp, seg_len in zip(checkpoints, segment_lengths):
        cp["segment_miles"] = round(seg_len, 2)
        risk_data = cp.get("risk_data", {})
        risk_level = risk_data.get("overall_risk", RiskLevel.LOW.value)
        score = float(risk_data.get("overall_score", 1.0))
        
        if risk_data.get("is_incomplete", False):
            has_incomplete_weather = True

        if risk_level == RiskLevel.NO_TRAVEL.value:
            no_travel_miles += seg_len
            has_no_travel = True
        elif risk_level == RiskLevel.SEVERE.value:
            severe_miles += seg_len
        elif risk_level == RiskLevel.HIGH.value:
            high_miles += seg_len
        elif risk_level == RiskLevel.MODERATE.value:
            moderate_miles += seg_len
        else:
            low_miles += seg_len

        weighted_score_sum += score * seg_len

    avg_risk = weighted_score_sum / total_distance_miles if total_distance_miles > 0 else 1.0

    return {
        "severe_miles": round(severe_miles, 1),
        "high_miles": round(high_miles, 1),
        "moderate_miles": round(moderate_miles, 1),
        "low_miles": round(low_miles, 1),
        "no_travel_miles": round(no_travel_miles, 1),
        "average_risk": round(avg_risk, 2),
        "has_no_travel": has_no_travel,
        "has_incomplete_weather": has_incomplete_weather,
        "total_distance_miles": round(total_distance_miles, 1),
    }
