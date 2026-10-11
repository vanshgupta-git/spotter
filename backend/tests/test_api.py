"""
Integration and validation tests for DRF API endpoints.
"""

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class APITestCases(APITestCase):
    def test_health_check_endpoint(self):
        url = reverse('api-health')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "ok"
        assert "providers" in data

    def test_route_plan_rejects_empty_payload(self):
        url = reverse('api-route-plan')
        response = self.client.post(url, {}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "origin" in data["errors"]
        assert "destination" in data["errors"]

    def test_route_plan_rejects_negative_load_weight(self):
        url = reverse('api-route-plan')
        payload = {
            "origin": "Chicago, IL",
            "destination": "Detroit, MI",
            "departure_time": "2026-10-11T12:00:00Z",
            "load_weight": -5000,
            "interval_miles": 25,
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "load_weight" in data["errors"]

    def test_route_plan_rejects_unsupported_interval(self):
        url = reverse('api-route-plan')
        payload = {
            "origin": "Chicago, IL",
            "destination": "Detroit, MI",
            "departure_time": "2026-10-11T12:00:00Z",
            "load_weight": 35000,
            "interval_miles": 15,  # Only 10, 25, 50 allowed
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "interval_miles" in data["errors"]

    def test_geocode_search(self):
        url = reverse('api-geocode')
        response = self.client.get(url, {"q": "New York"})
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)
