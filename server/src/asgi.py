"""
ASGI config for piqued project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import messaging.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.settings')

# We are using two protocols (http and websockets)
# Both are routed to the approriate routing table
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
            URLRouter(
                messaging.routing.websocket_urlpatterns
            )
        ),
})
