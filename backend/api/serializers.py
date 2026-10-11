"""
DRF Serializers for input validation and request schemas.
"""

from rest_framework import serializers
from datetime import datetime

class TripPlanRequestSerializer(serializers.Serializer):
    """
    Validates user trip request inputs.
    """
    origin = serializers.CharField(
        required=True,
        min_length=2,
        max_length=250,
        help_text="Origin location name, city, or 'lat,lon' coordinates"
    )
    destination = serializers.CharField(
        required=True,
        min_length=2,
        max_length=250,
        help_text="Destination location name, city, or 'lat,lon' coordinates"
    )
    departure_time = serializers.DateTimeField(
        required=True,
        help_text="ISO 8601 departure datetime (e.g. 2026-10-11T12:00:00Z)"
    )
    load_weight = serializers.FloatField(
        required=True,
        min_value=0.0,
        max_value=150000.0,
        help_text="Truck load weight in pounds (0 to 150,000 lbs)"
    )
    interval_miles = serializers.ChoiceField(
        choices=[10, 25, 50],
        default=25,
        help_text="Checkpoint sampling interval: 10, 25, or 50 miles"
    )

    def validate_departure_time(self, value):
        # Ensure timestamp is sensible
        if value.year < 2020 or value.year > 2035:
            raise serializers.ValidationError("Departure time year is out of valid range.")
        return value
