import os
from django.core.asgi import get_asgi_application

# Ensure this matches your project folder name (mealsync)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mealsync.settings')

application = get_asgi_application()