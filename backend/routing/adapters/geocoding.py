"""
Geocoding adapter using Open-Meteo Geocoding API and coordinate parser.
Zero-cost, no API key required, with Nominatim fallback.
"""

import re
import logging
from typing import List, Dict, Any, Optional
import requests

logger = logging.getLogger(__name__)

OPEN_METEO_GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
NOMINATIM_GEOCODE_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "WeatherTruckRouter/1.0 (contact: support@spotter-routing.local)"}

def parse_direct_coordinates(query: str) -> Optional[Dict[str, Any]]:
    """
    Checks if the query is already in 'lat, lon' or 'lon, lat' format.
    """
    clean_q = query.strip()
    match = re.match(r"^\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*$", clean_q)
    if match:
        v1, v2 = float(match.group(1)), float(match.group(2))
        # Usually lat is -90..90 and lon is -180..180
        if -90 <= v1 <= 90 and -180 <= v2 <= 180:
            return {
                "name": f"{v1:.4f}, {v2:.4f}",
                "latitude": v1,
                "longitude": v2,
                "country": "",
                "admin1": "",
                "display_name": f"Coordinates ({v1:.4f}, {v2:.4f})",
            }
    return None


def search_locations(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Searches for locations using Open-Meteo Geocoding API with Nominatim fallback.
    
    Args:
        query: Place name or address (e.g., 'Chicago, IL', 'Dallas, TX')
        limit: Maximum results to return
        
    Returns:
        List of location dictionaries with name, latitude, longitude, display_name.
    """
    if not query or not query.strip():
        return []

    # Check for direct lat/lon format
    direct = parse_direct_coordinates(query)
    if direct:
        return [direct]

    # Primary: Open-Meteo Geocoding (fast, zero key, reliable)
    try:
        resp = requests.get(
            OPEN_METEO_GEOCODE_URL,
            params={"name": query.strip(), "count": limit, "language": "en", "format": "json"},
            headers=HEADERS,
            timeout=5,
        )
        if resp.status_code == 200:
            data = resp.json()
            results = data.get("results", [])
            formatted = []
            for item in results:
                admin = item.get("admin1", "")
                country = item.get("country", "")
                name = item.get("name", "")
                parts = [p for p in [name, admin, country] if p]
                display_name = ", ".join(parts)
                formatted.append({
                    "name": name,
                    "latitude": float(item["latitude"]),
                    "longitude": float(item["longitude"]),
                    "country": country,
                    "admin1": admin,
                    "display_name": display_name,
                })
            if formatted:
                return formatted
    except Exception as e:
        logger.warning(f"Open-Meteo geocoding query '{query}' failed: {e}")

    # Fallback: Nominatim OpenStreetMap
    try:
        resp = requests.get(
            NOMINATIM_GEOCODE_URL,
            params={"q": query.strip(), "format": "json", "limit": limit, "addressdetails": 1},
            headers=HEADERS,
            timeout=5,
        )
        if resp.status_code == 200:
            items = resp.json()
            formatted = []
            for item in items:
                formatted.append({
                    "name": item.get("name") or item.get("display_name", "").split(",")[0],
                    "latitude": float(item["lat"]),
                    "longitude": float(item["lon"]),
                    "country": item.get("address", {}).get("country", ""),
                    "admin1": item.get("address", {}).get("state", ""),
                    "display_name": item.get("display_name", ""),
                })
            return formatted
    except Exception as e:
        logger.error(f"Nominatim geocoding fallback failed: {e}")

    return []
