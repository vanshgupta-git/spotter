"""
Abstract base class for routing engine providers.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple

class RoutingProvider(ABC):
    """
    Interface for routing engines (OSRM, OpenRouteService, etc.)
    """

    @abstractmethod
    def get_routes(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
    ) -> List[Dict[str, Any]]:
        """
        Calculates at least 3 genuine alternative routes between origin and destination.
        
        Args:
            origin_lat: Departure latitude
            origin_lon: Departure longitude
            dest_lat: Arrival latitude
            dest_lon: Arrival longitude
            
        Returns:
            List of route dictionaries containing distance, duration, and coordinates.
        """
        pass
