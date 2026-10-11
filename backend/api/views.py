"""
DRF API views for health check, geocoding, and route planning.
"""

import logging
from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TripPlanRequestSerializer
from routing.adapters.geocoding import search_locations
from routing.services.route_service import plan_truck_routes

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    """
    Health check endpoint for service monitoring, Vercel, and deployment readiness.
    """
    def get(self, request):
        return Response({
            "status": "ok",
            "service": "Weather-Aware Truck Routing Backend",
            "version": "1.0.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "providers": {
                "routing": "OSRM (Open Source Routing Machine)",
                "weather": "Open-Meteo Forecast & Geocoding",
            },
        }, status=status.HTTP_200_OK)


class GeocodeView(APIView):
    """
    Geocoding search endpoint for location autocomplete.
    """
    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query or len(query) < 2:
            return Response([], status=status.HTTP_200_OK)

        try:
            results = search_locations(query, limit=5)
            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Geocoding error for '{query}': {e}")
            return Response(
                {"error": "Failed to search location suggestions."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RoutePlanView(APIView):
    """
    Primary endpoint: Plans 3 alternative routes, computes weather risk per checkpoint,
    and returns ranked route recommendations.
    """
    def post(self, request):
        serializer = TripPlanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "status": "error",
                "errors": serializer.errors,
                "message": "Invalid trip parameters.",
            }, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            result = plan_truck_routes(
                origin_input=data["origin"],
                destination_input=data["destination"],
                departure_time_iso=data["departure_time"].isoformat(),
                load_weight_lbs=data["load_weight"],
                interval_miles=float(data.get("interval_miles", 25)),
            )
            return Response(result, status=status.HTTP_200_OK)

        except ValueError as ve:
            return Response({
                "status": "error",
                "message": str(ve),
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception(f"Trip planning execution failed: {e}")
            return Response({
                "status": "error",
                "message": "Trip route planning failed. Please verify the origin and destination addresses and try again.",
            }, status=status.HTTP_502_BAD_GATEWAY)
