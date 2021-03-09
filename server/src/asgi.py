"""
ASGI config for piqued project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import URLRouter, ProtocolTypeRouter
from groups import routing as groupsRouting

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.settings')

# application = get_asgi_application()


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
            URLRouter(
                # messaging.routing.websocket_urlpatterns
                groupsRouting.websocket_urlpatterns
            )
        ),
})

