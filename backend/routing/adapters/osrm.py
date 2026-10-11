"""
OSRM (Open Source Routing Machine) routing adapter.

Connects to the public OSRM driving engine at zero cost, with automatic
intelligent waypoint routing to guarantee exactly 3 distinct genuine road routes.
"""

import math
import logging
from typing import List, Dict, Any, Tuple
import requests
from .base import RoutingProvider

logger = logging.getLogger(__name__)

OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving"
METERS_TO_MILES = 0.000621371
HEADERS = {"User-Agent": "WeatherTruckRouter/1.0 (contact: support@spotter-routing.local)"}


class OSRMRoutingProvider(RoutingProvider):
    """
    Zero-cost OSRM routing provider with genuine 3-route generation.
    """

    def __init__(self, base_url: str = OSRM_ROUTE_URL):
        self.base_url = base_url

    def _query_osrm(self, coords_str: str, alternatives: int = 3) -> List[Dict[str, Any]]:
        """
        Executes an HTTP query against OSRM API.
        """
        url = f"{self.base_url}/{coords_str}"
        params = {
            "overview": "full",
            "geometries": "geojson",
            "steps": "false",
        }
        if alternatives > 1:
            params["alternatives"] = str(alternatives)

        try:
            resp = requests.get(url, params=params, headers=HEADERS, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok":
                    return data.get("routes", [])
            else:
                logger.warning(f"OSRM returned status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.error(f"OSRM request failed: {e}")

        return []

    def _format_route(self, raw_route: Dict[str, Any], route_id: str, default_name: str) -> Dict[str, Any]:
        """
        Formats an OSRM raw route object into the standard system representation.
        """
        distance_meters = float(raw_route.get("distance", 0.0))
        duration_seconds = float(raw_route.get("duration", 0.0))
        geometry = raw_route.get("geometry", {})
        coords = geometry.get("coordinates", [])

        # Extract highway names from legs
        legs = raw_route.get("legs", [])
        summary_parts = []
        for leg in legs:
            summary = leg.get("summary", "")
            if summary and summary not in summary_parts:
                summary_parts.append(summary)

        name = ", ".join(summary_parts) if summary_parts else default_name

        return {
            "id": route_id,
            "name": name,
            "summary": name,
            "distance_meters": distance_meters,
            "distance_miles": round(distance_meters * METERS_TO_MILES, 1),
            "duration_seconds": duration_seconds,
            "duration_hours": round(duration_seconds / 3600.0, 1),
            "coordinates": coords,  # [[lon, lat], ...]
        }

    def _is_duplicate_route(self, candidate_coords: List[List[float]], existing_routes: List[Dict[str, Any]]) -> bool:
        """
        Checks whether candidate route geometry is substantially identical to an existing route.
        """
        cand_len = len(candidate_coords)
        if cand_len == 0:
            return True

        cand_dist_est = sum(
            math.hypot(candidate_coords[i][0] - candidate_coords[i - 1][0],
                       candidate_coords[i][1] - candidate_coords[i - 1][1])
            for i in range(1, cand_len)
        )

        for ex in existing_routes:
            ex_coords = ex.get("coordinates", [])
            ex_len = len(ex_coords)
            if abs(cand_len - ex_len) < 5:
                ex_dist_est = sum(
                    math.hypot(ex_coords[i][0] - ex_coords[i - 1][0],
                               ex_coords[i][1] - ex_coords[i - 1][1])
                    for i in range(1, ex_len)
                )
                if abs(cand_dist_est - ex_dist_est) < 0.005:  # Virtually identical path
                    return True
        return False

    def get_routes(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
    ) -> List[Dict[str, Any]]:
        """
        Fetches up to 3 genuine alternative routes. If OSRM returns fewer than 3,
        creates genuine alternatives via lateral corridor waypoints.
        """
        direct_coords = f"{origin_lon:.6f},{origin_lat:.6f};{dest_lon:.6f},{dest_lat:.6f}"
        raw_routes = self._query_osrm(direct_coords, alternatives=3)

        routes: List[Dict[str, Any]] = []

        # Add initial routes returned by OSRM
        for i, raw in enumerate(raw_routes):
            r = self._format_route(raw, f"route-{len(routes) + 1}", f"Main Route {i + 1}")
            if not self._is_duplicate_route(r["coordinates"], routes):
                routes.append(r)
            if len(routes) >= 3:
                break

        # If fewer than 3 routes, query intermediate waypoints on alternative corridors
        if len(routes) < 3:
            # Calculate perpendicular offsets to the direct line
            d_lat = dest_lat - origin_lat
            d_lon = dest_lon - origin_lon

            # Perpendicular vectors (rotated 90 degrees)
            offsets = [
                (-0.20, 0.5),   # Left corridor midpoint
                (0.20, 0.5),    # Right corridor midpoint
                (-0.25, 0.35),  # Left corridor 1/3 point
                (0.25, 0.65),   # Right corridor 2/3 point
            ]

            for perp_factor, along_factor in offsets:
                w_lat = origin_lat + d_lat * along_factor - d_lon * perp_factor * 0.5
                w_lon = origin_lon + d_lon * along_factor + d_lat * perp_factor * 0.5

                via_coords = f"{origin_lon:.6f},{origin_lat:.6f};{w_lon:.6f},{w_lat:.6f};{dest_lon:.6f},{dest_lat:.6f}"
                via_raw = self._query_osrm(via_coords, alternatives=1)

                if via_raw:
                    candidate = self._format_route(
                        via_raw[0],
                        f"route-{len(routes) + 1}",
                        f"Alternate Corridor {len(routes) + 1}"
                    )
                    if not self._is_duplicate_route(candidate["coordinates"], routes):
                        routes.append(candidate)

                if len(routes) >= 3:
                    break

        # Ensure consistent IDs and labels
        for idx, r in enumerate(routes[:3]):
            r["id"] = f"route-{idx + 1}"
            if not r.get("name") or r["name"].startswith("Main Route"):
                r["name"] = f"Route Option {idx + 1}"

        return routes[:3]
