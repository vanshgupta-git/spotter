"""
WSGI config for spotter_project.
"""
import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spotter_project.settings')

application = get_wsgi_application()
app = application  # Required for Vercel serverless WSGI handler
