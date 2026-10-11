"""
DRF API views for health check, geocoding, and route planning.
"""

import logging
from datetime import datetime, timezone
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TripPlanRequestSerializer
from routing.adapters.geocoding import search_locations
from routing.services.route_service import plan_truck_routes

logger = logging.getLogger(__name__)


class RootView(APIView):
    """
    Root index endpoint providing status, discovery, and browser documentation.
    """
    def get(self, request):
        accept_header = request.headers.get("Accept", "")
        if "text/html" in accept_header and "application/json" not in accept_header:
            html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spotter API • Active</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 2rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(16, 185, 129, 0.4);
      margin-bottom: 1rem;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
    h1 { font-size: 1.4rem; margin: 0 0 0.5rem 0; color: #f1f5f9; }
    p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; margin: 0 0 1.5rem 0; }
    .endpoints {
      background: #0f172a;
      border-radius: 8px;
      padding: 0.8rem 1rem;
      border: 1px solid #334155;
      margin-bottom: 1.5rem;
    }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #1e293b;
      font-size: 0.85rem;
    }
    .item:last-child { border-bottom: none; }
    .item a { color: #38bdf8; text-decoration: none; font-family: monospace; }
    .item a:hover { text-decoration: underline; }
    .tag { font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .get { background: #0369a1; color: #e0f2fe; }
    .post { background: #047857; color: #d1fae5; }
    .btn {
      display: block;
      text-align: center;
      background: #2563eb;
      color: white;
      text-decoration: none;
      padding: 10px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Online & Active</div>
    <h1>Spotter Truck Routing Backend</h1>
    <p>Weather-Aware Commercial Truck Routing Engine deployed on Render. Ready to accept requests from the frontend.</p>
    <div class="endpoints">
      <div class="item">
        <span class="tag get">GET</span>
        <a href="/api/health/">/api/health/</a>
      </div>
      <div class="item">
        <span class="tag get">GET</span>
        <a href="/api/geocode/?q=Chicago">/api/geocode/?q=Chicago</a>
      </div>
      <div class="item">
        <span class="tag post">POST</span>
        <span style="font-family: monospace; color: #94a3b8;">/api/route-plan/</span>
      </div>
    </div>
    <a href="/api/health/" class="btn">Test Health Check Endpoint</a>
  </div>
</body>
</html>"""
            return HttpResponse(html, content_type="text/html")

        return Response({
            "service": "Spotter Weather-Aware Truck Routing Backend",
            "status": "online",
            "version": "1.0.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "endpoints": {
                "health": "/api/health/",
                "geocode": "/api/geocode/?q=Chicago",
                "route_plan": "/api/route-plan/ (POST)",
            },
        }, status=status.HTTP_200_OK)


class HealthCheckView(APIView):
    """
    Health check endpoint for service monitoring, Render, and deployment readiness.
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
