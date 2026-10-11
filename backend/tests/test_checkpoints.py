"""
Tests for checkpoint sampling, cumulative geometry calculation, ETA math, and segment mileage.
"""

from datetime import datetime, timezone
import pytest
from routing.services.checkpoints import (
    haversine_miles,
    build_cumulative_distances,
    interpolate_coordinate_at_distance,
    generate_route_checkpoints,
)
from risk.segment_calculator import compute_segment_boundaries, aggregate_route_risk
from risk.engine import RiskLevel

def test_haversine_miles():
    # NYC (40.7128, -74.0060) to Philadelphia (39.9526, -75.1652) is ~80.5 miles
    dist = haversine_miles(40.7128, -74.0060, 39.9526, -75.1652)
    assert 78.0 <= dist <= 83.0


def test_cumulative_distances_monotonic():
    coords = [
        [-74.0060, 40.7128],  # NYC
        [-74.5000, 40.3500],  # Mid NJ
        [-75.1652, 39.9526],  # Philly
    ]
    cum = build_cumulative_distances(coords)
    assert len(cum) == 3
    assert cum[0] == 0.0
    assert cum[1] > 0.0
    assert cum[2] > cum[1]


def test_checkpoint_interval_generation():
    # Synthetic route of ~100 miles
    coords = [
        [-74.0060, 40.7128],
        [-75.1652, 39.9526],
        [-75.5000, 39.5000],
    ]
    total_dist = 100.0
    total_duration = 7200.0  # 2 hours
    dep_time = datetime(2026, 10, 11, 8, 0, tzoffset=timezone.utc) if hasattr(datetime, "tzoffset") else datetime(2026, 10, 11, 8, 0, tzinfo=timezone.utc)

    # Test 25 mile interval: checkpoints should be at 0, 25, 50, 75, 100
    cps = generate_route_checkpoints(
        coordinates=coords,
        total_distance_miles=total_dist,
        total_duration_seconds=total_duration,
        departure_datetime=dep_time,
        interval_miles=25.0,
    )

    assert len(cps) >= 4
    assert cps[0]["distance_miles"] == 0.0
    assert cps[0]["is_origin"] is True
    assert cps[-1]["distance_miles"] == 100.0
    assert cps[-1]["is_destination"] is True

    # Check ETAs are sequential
    for i in range(1, len(cps)):
        assert cps[i]["elapsed_seconds"] >= cps[i - 1]["elapsed_seconds"]


def test_segment_boundary_partitioning():
    # If checkpoints are at 0, 25, 50, 75, 100 on a 100-mile route:
    distances = [0.0, 25.0, 50.0, 75.0, 100.0]
    total_dist = 100.0
    segments = compute_segment_boundaries(distances, total_dist)

    assert len(segments) == 5
    # Sum of all segment miles must equal exactly total route distance
    assert abs(sum(segments) - total_dist) < 1e-3
    # Checkpoint 0 controls 0..12.5 (12.5 mi)
    assert abs(segments[0] - 12.5) < 0.1
    # Checkpoint 1 controls 12.5..37.5 (25.0 mi)
    assert abs(segments[1] - 25.0) < 0.1
    # Checkpoint 4 controls 87.5..100 (12.5 mi)
    assert abs(segments[4] - 12.5) < 0.1


def test_aggregate_route_risk_calculation():
    checkpoints = [
        {"distance_miles": 0.0, "risk_data": {"overall_risk": RiskLevel.LOW.value, "overall_score": 1.0}},
        {"distance_miles": 25.0, "risk_data": {"overall_risk": RiskLevel.MODERATE.value, "overall_score": 2.0}},
        {"distance_miles": 50.0, "risk_data": {"overall_risk": RiskLevel.HIGH.value, "overall_score": 3.0}},
        {"distance_miles": 75.0, "risk_data": {"overall_risk": RiskLevel.SEVERE.value, "overall_score": 4.0}},
        {"distance_miles": 100.0, "risk_data": {"overall_risk": RiskLevel.LOW.value, "overall_score": 1.0}},
    ]
    total_dist = 100.0
    summary = aggregate_route_risk(checkpoints, total_dist)

    assert summary["severe_miles"] > 0
    assert summary["high_miles"] > 0
    assert summary["moderate_miles"] > 0
    assert summary["low_miles"] > 0
    assert summary["has_no_travel"] is False
    assert 1.0 <= summary["average_risk"] <= 5.0
