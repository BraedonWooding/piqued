"""
ASGI config for piqued project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os

# order matters

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.settings')

from django.core.asgi import get_asgi_application

app = get_asgi_application()

import messaging.urls
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

# We are using two protocols (http and websockets)
# Both are routed to the approriate routing table
application = ProtocolTypeRouter({
    "http": app,
    "websocket": AuthMiddlewareStack(
            URLRouter(
                messaging.urls.urlpatterns
            )
        ),
})
