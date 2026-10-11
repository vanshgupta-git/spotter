"""
URL configuration for spotter_project.
"""
from django.urls import path, include
from api.views import RootView, HealthCheckView

urlpatterns = [
    path('', RootView.as_view(), name='root'),
    path('health/', HealthCheckView.as_view(), name='root-health'),
    path('health', HealthCheckView.as_view(), name='root-health-no-slash'),
    path('api/', include('api.urls')),
]
