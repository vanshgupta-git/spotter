"""
Weather risk engine for commercial truck routing.

Implements exact risk thresholds and load-dependent wind rules specified in the
transportation assessment:

Condition | Low      | Moderate       | High           | Severe          | No Travel
Wind      | <25 mph  | 25 to <35 mph  | 35 to <44 mph  | 45 to <55 mph   | >=55 mph
Rain      | <0.10 in | 0.10 to <0.25  | 0.25 to <0.50  | 0.50 to 1.00    | >1.00 in/hr
Snow      | <0.5 in  | 0.5 to <1.0    | 1.0 to <2.0    | 2.0 to 3.0      | >3.0 in/hr

Load rules:
• >=55 mph -> No Travel for any load
• 45 to <55 mph + load > 30,000 lb -> No Travel
• 35 to <45 mph + load > 40,000 lb -> Severe
"""

from enum import Enum
from typing import Dict, Any, Optional, Tuple

class RiskLevel(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    SEVERE = "Severe"
    NO_TRAVEL = "No Travel"
    UNKNOWN = "Unknown"

# Numerical ordering and weights for severity levels
RISK_ORDER = {
    RiskLevel.LOW: 1,
    RiskLevel.MODERATE: 2,
    RiskLevel.HIGH: 3,
    RiskLevel.SEVERE: 4,
    RiskLevel.NO_TRAVEL: 5,
    RiskLevel.UNKNOWN: 5,  # Conservative: treat missing data as highest risk
}

RISK_COLORS = {
    RiskLevel.LOW: "#10b981",       # Emerald green
    RiskLevel.MODERATE: "#f59e0b",  # Amber yellow
    RiskLevel.HIGH: "#f97316",      # Vibrant orange
    RiskLevel.SEVERE: "#ef4444",    # Red
    RiskLevel.NO_TRAVEL: "#7f1d1d", # Dark maroon / crimson
    RiskLevel.UNKNOWN: "#6b7280",   # Neutral slate
}


def classify_wind(wind_mph: Optional[float], load_weight_lbs: float) -> Tuple[RiskLevel, str]:
    """
    Classifies wind speed with load-dependent safety rules.
    
    Args:
        wind_mph: Wind speed in miles per hour.
        load_weight_lbs: Total truck load weight in pounds.
        
    Returns:
        Tuple of (RiskLevel, explanation string)
    """
    if wind_mph is None:
        return RiskLevel.UNKNOWN, "Wind data unavailable"
    if wind_mph < 0:
        raise ValueError(f"Wind speed cannot be negative: {wind_mph}")
    if load_weight_lbs < 0:
        raise ValueError(f"Load weight cannot be negative: {load_weight_lbs}")

    # 1. Base wind >= 55 mph -> No Travel for any load
    if wind_mph >= 55.0:
        return RiskLevel.NO_TRAVEL, f"Wind speed {wind_mph:.1f} mph >= 55 mph (No Travel for any load)"

    # 2. Wind 45 to <55 mph
    if wind_mph >= 45.0:
        if load_weight_lbs > 30000.0:
            return RiskLevel.NO_TRAVEL, (
                f"Wind {wind_mph:.1f} mph (45-54 mph) with heavy load {load_weight_lbs:,.0f} lb "
                f"> 30,000 lb triggers No Travel"
            )
        return RiskLevel.SEVERE, f"Wind speed {wind_mph:.1f} mph is Severe (45 to <55 mph)"

    # 3. Wind 35 to <45 mph
    if wind_mph >= 35.0:
        if load_weight_lbs > 40000.0:
            return RiskLevel.SEVERE, (
                f"Wind {wind_mph:.1f} mph (35-44 mph) with load {load_weight_lbs:,.0f} lb "
                f"> 40,000 lb elevated to Severe"
            )
        return RiskLevel.HIGH, f"Wind speed {wind_mph:.1f} mph is High (35 to <45 mph)"

    # 4. Wind 25 to <35 mph
    if wind_mph >= 25.0:
        return RiskLevel.MODERATE, f"Wind speed {wind_mph:.1f} mph is Moderate (25 to <35 mph)"

    # 5. Wind < 25 mph
    return RiskLevel.LOW, f"Wind speed {wind_mph:.1f} mph is Low (<25 mph)"


def classify_rain(rain_in_hr: Optional[float]) -> Tuple[RiskLevel, str]:
    """
    Classifies rainfall intensity in inches per hour.
    
    Args:
        rain_in_hr: Rainfall in inches per hour.
        
    Returns:
        Tuple of (RiskLevel, explanation string)
    """
    if rain_in_hr is None:
        return RiskLevel.UNKNOWN, "Rain data unavailable"
    if rain_in_hr < 0:
        raise ValueError(f"Rainfall intensity cannot be negative: {rain_in_hr}")

    if rain_in_hr > 1.00:
        return RiskLevel.NO_TRAVEL, f"Rainfall {rain_in_hr:.2f} in/hr > 1.00 in/hr (No Travel)"
    if rain_in_hr >= 0.50:
        return RiskLevel.SEVERE, f"Rainfall {rain_in_hr:.2f} in/hr is Severe (0.50 to 1.00 in/hr)"
    if rain_in_hr >= 0.25:
        return RiskLevel.HIGH, f"Rainfall {rain_in_hr:.2f} in/hr is High (0.25 to <0.50 in/hr)"
    if rain_in_hr >= 0.10:
        return RiskLevel.MODERATE, f"Rainfall {rain_in_hr:.2f} in/hr is Moderate (0.10 to <0.25 in/hr)"
    return RiskLevel.LOW, f"Rainfall {rain_in_hr:.2f} in/hr is Low (<0.10 in/hr)"


def classify_snow(snow_in_hr: Optional[float]) -> Tuple[RiskLevel, str]:
    """
    Classifies snowfall intensity in inches per hour.
    
    Args:
        snow_in_hr: Snowfall in inches per hour.
        
    Returns:
        Tuple of (RiskLevel, explanation string)
    """
    if snow_in_hr is None:
        return RiskLevel.UNKNOWN, "Snow data unavailable"
    if snow_in_hr < 0:
        raise ValueError(f"Snowfall intensity cannot be negative: {snow_in_hr}")

    if snow_in_hr > 3.0:
        return RiskLevel.NO_TRAVEL, f"Snowfall {snow_in_hr:.2f} in/hr > 3.0 in/hr (No Travel)"
    if snow_in_hr >= 2.0:
        return RiskLevel.SEVERE, f"Snowfall {snow_in_hr:.2f} in/hr is Severe (2.0 to 3.0 in/hr)"
    if snow_in_hr >= 1.0:
        return RiskLevel.HIGH, f"Snowfall {snow_in_hr:.2f} in/hr is High (1.0 to <2.0 in/hr)"
    if snow_in_hr >= 0.5:
        return RiskLevel.MODERATE, f"Snowfall {snow_in_hr:.2f} in/hr is Moderate (0.5 to <1.0 in/hr)"
    return RiskLevel.LOW, f"Snowfall {snow_in_hr:.2f} in/hr is Low (<0.5 in/hr)"


def evaluate_checkpoint_risk(
    wind_mph: Optional[float],
    rain_in_hr: Optional[float],
    snow_in_hr: Optional[float],
    load_weight_lbs: float,
) -> Dict[str, Any]:
    """
    Evaluates combined checkpoint weather risk based on independent wind, rain, and snow
    assessments and returns the highest applicable severity level.
    
    Returns:
        Dictionary containing overall_risk, individual risks, explanations, and safety flag.
    """
    wind_risk, wind_msg = classify_wind(wind_mph, load_weight_lbs)
    rain_risk, rain_msg = classify_rain(rain_in_hr)
    snow_risk, snow_msg = classify_snow(snow_in_hr)

    hazards = [
        ("Wind", wind_risk, wind_msg),
        ("Rain", rain_risk, rain_msg),
        ("Snow", snow_risk, snow_msg),
    ]

    # Find maximum severity based on defined risk ordering
    # If any is UNKNOWN, overall cannot be safely assumed Low
    highest_hazard = max(hazards, key=lambda h: RISK_ORDER[h[1]])
    overall_risk = highest_hazard[1]

    # Incomplete coverage flag
    is_incomplete = any(h[1] == RiskLevel.UNKNOWN for h in hazards)

    return {
        "overall_risk": overall_risk.value,
        "overall_score": float(RISK_ORDER[overall_risk]),
        "primary_hazard": highest_hazard[0],
        "summary": highest_hazard[2],
        "is_no_travel": overall_risk == RiskLevel.NO_TRAVEL,
        "is_incomplete": is_incomplete,
        "color": RISK_COLORS[overall_risk],
        "wind": {
            "value_mph": wind_mph,
            "risk": wind_risk.value,
            "explanation": wind_msg,
        },
        "rain": {
            "value_in_hr": rain_in_hr,
            "risk": rain_risk.value,
            "explanation": rain_msg,
        },
        "snow": {
            "value_in_hr": snow_in_hr,
            "risk": snow_risk.value,
            "explanation": snow_msg,
        },
    }
