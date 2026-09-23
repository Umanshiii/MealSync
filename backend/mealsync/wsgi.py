import os
from django.core.wsgi import get_wsgi_application

# This tells Django where your settings.py is located
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mealsync.settings')

application = get_wsgi_application()