"""
API URL routing.
"""

from django.urls import path
from .views import RootView, HealthCheckView, GeocodeView, RoutePlanView

urlpatterns = [
    path('', RootView.as_view(), name='api-root'),
    path('health/', HealthCheckView.as_view(), name='api-health'),
    path('health', HealthCheckView.as_view(), name='api-health-no-slash'),
    path('geocode/', GeocodeView.as_view(), name='api-geocode'),
    path('geocode', GeocodeView.as_view(), name='api-geocode-no-slash'),
    path('route-plan/', RoutePlanView.as_view(), name='api-route-plan'),
    path('route-plan', RoutePlanView.as_view(), name='api-route-plan-no-slash'),
]
