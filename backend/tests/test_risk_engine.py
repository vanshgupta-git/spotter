"""
Comprehensive tests for the weather risk engine.
Validates all wind, rain, and snow threshold boundaries, load rules, and combined hazards.
"""

import pytest
from risk.engine import (
    RiskLevel,
    classify_wind,
    classify_rain,
    classify_snow,
    evaluate_checkpoint_risk,
)

class TestWindRiskRules:
    """
    Wind thresholds:
    Low: <25 mph
    Moderate: 25 to <35 mph
    High: 35 to <45 mph
    Severe: 45 to <55 mph
    No Travel: >=55 mph
    
    Load rules:
    >=55 mph -> No Travel for any load
    45-54 mph + >30,000 lb -> No Travel
    35-44 mph + >40,000 lb -> Severe
    """

    @pytest.mark.parametrize("wind,load,expected_risk", [
        # Standard load (20,000 lb <= 30,000 lb)
        (0.0, 20000, RiskLevel.LOW),
        (24.9, 20000, RiskLevel.LOW),
        (25.0, 20000, RiskLevel.MODERATE),
        (34.9, 20000, RiskLevel.MODERATE),
        (35.0, 20000, RiskLevel.HIGH),
        (44.9, 20000, RiskLevel.HIGH),
        (45.0, 20000, RiskLevel.SEVERE),
        (54.9, 20000, RiskLevel.SEVERE),
        (55.0, 20000, RiskLevel.NO_TRAVEL),
        (75.0, 20000, RiskLevel.NO_TRAVEL),

        # Wind 35-44 mph boundary with load > 40,000 lb (elevated to Severe)
        (35.0, 40000, RiskLevel.HIGH),         # boundary: <= 40,000 is still High
        (35.0, 40001, RiskLevel.SEVERE),       # strictly > 40,000 elevated to Severe
        (40.0, 45000, RiskLevel.SEVERE),       # elevated to Severe
        (44.9, 50000, RiskLevel.SEVERE),       # elevated to Severe

        # Wind 45-54 mph boundary with load > 30,000 lb (elevated to No Travel)
        (45.0, 30000, RiskLevel.SEVERE),       # boundary: <= 30,000 is Severe
        (45.0, 30001, RiskLevel.NO_TRAVEL),    # strictly > 30,000 elevated to No Travel
        (50.0, 35000, RiskLevel.NO_TRAVEL),    # elevated to No Travel
        (54.9, 45000, RiskLevel.NO_TRAVEL),    # elevated to No Travel

        # Wind >= 55 mph (No Travel for ANY load)
        (55.0, 5000, RiskLevel.NO_TRAVEL),
        (60.0, 0, RiskLevel.NO_TRAVEL),
        (80.0, 80000, RiskLevel.NO_TRAVEL),
    ])
    def test_wind_boundaries_and_load_rules(self, wind, load, expected_risk):
        risk, _ = classify_wind(wind, load)
        assert risk == expected_risk

    def test_missing_wind_data(self):
        risk, _ = classify_wind(None, 20000)
        assert risk == RiskLevel.UNKNOWN

    def test_negative_wind_raises_error(self):
        with pytest.raises(ValueError):
            classify_wind(-5.0, 20000)


class TestRainRiskRules:
    """
    Rain thresholds:
    Low: <0.10 in/hr
    Moderate: 0.10 to <0.25 in/hr
    High: 0.25 to <0.50 in/hr
    Severe: 0.50 through 1.00 in/hr
    No Travel: >1.00 in/hr
    """

    @pytest.mark.parametrize("rain,expected_risk", [
        (0.0, RiskLevel.LOW),
        (0.09, RiskLevel.LOW),
        (0.10, RiskLevel.MODERATE),
        (0.249, RiskLevel.MODERATE),
        (0.25, RiskLevel.HIGH),
        (0.499, RiskLevel.HIGH),
        (0.50, RiskLevel.SEVERE),
        (1.00, RiskLevel.SEVERE),      # 0.50 through 1.00 is Severe
        (1.01, RiskLevel.NO_TRAVEL),   # > 1.00 is No Travel
        (2.50, RiskLevel.NO_TRAVEL),
    ])
    def test_rain_boundaries(self, rain, expected_risk):
        risk, _ = classify_rain(rain)
        assert risk == expected_risk

    def test_missing_rain_data(self):
        risk, _ = classify_rain(None)
        assert risk == RiskLevel.UNKNOWN


class TestSnowRiskRules:
    """
    Snow thresholds:
    Low: <0.5 in/hr
    Moderate: 0.5 to <1.0 in/hr
    High: 1.0 to <2.0 in/hr
    Severe: 2.0 through 3.0 in/hr
    No Travel: >3.0 in/hr
    """

    @pytest.mark.parametrize("snow,expected_risk", [
        (0.0, RiskLevel.LOW),
        (0.49, RiskLevel.LOW),
        (0.50, RiskLevel.MODERATE),
        (0.99, RiskLevel.MODERATE),
        (1.00, RiskLevel.HIGH),
        (1.99, RiskLevel.HIGH),
        (2.00, RiskLevel.SEVERE),
        (3.00, RiskLevel.SEVERE),      # 2.0 through 3.0 is Severe
        (3.01, RiskLevel.NO_TRAVEL),   # > 3.0 is No Travel
        (5.00, RiskLevel.NO_TRAVEL),
    ])
    def test_snow_boundaries(self, snow, expected_risk):
        risk, _ = classify_snow(snow)
        assert risk == expected_risk

    def test_missing_snow_data(self):
        risk, _ = classify_snow(None)
        assert risk == RiskLevel.UNKNOWN


class TestCombinedCheckpointRisk:
    def test_highest_severity_takes_precedence(self):
        # Wind Low, Rain Moderate, Snow Severe -> Severe
        res = evaluate_checkpoint_risk(
            wind_mph=10.0,
            rain_in_hr=0.15,
            snow_in_hr=2.5,
            load_weight_lbs=25000,
        )
        assert res["overall_risk"] == RiskLevel.SEVERE.value
        assert res["primary_hazard"] == "Snow"

    def test_no_travel_overrides_everything(self):
        # Rain > 1.0 triggers No Travel even if wind and snow are 0
        res = evaluate_checkpoint_risk(
            wind_mph=0.0,
            rain_in_hr=1.2,
            snow_in_hr=0.0,
            load_weight_lbs=20000,
        )
        assert res["overall_risk"] == RiskLevel.NO_TRAVEL.value
        assert res["is_no_travel"] is True

    def test_incomplete_weather_is_flagged(self):
        # Missing snow data
        res = evaluate_checkpoint_risk(
            wind_mph=15.0,
            rain_in_hr=0.05,
            snow_in_hr=None,
            load_weight_lbs=20000,
        )
        assert res["is_incomplete"] is True
        assert res["overall_risk"] != RiskLevel.LOW.value
