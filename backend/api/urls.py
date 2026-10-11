"""
API URL routing.
"""

from django.urls import path
from .views import HealthCheckView, GeocodeView, RoutePlanView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='api-health'),
    path('geocode/', GeocodeView.as_view(), name='api-geocode'),
    path('route-plan/', RoutePlanView.as_view(), name='api-route-plan'),
]
