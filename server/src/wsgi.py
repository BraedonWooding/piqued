"""
WSGI config for piqued project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/wsgi/
"""

import os

import messaging.urls
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.settings')

# We are using two protocols (http and websockets)
# Both are routed to the approriate routing table
application = ProtocolTypeRouter({
    "http": get_wsgi_application(),
    "websocket": AuthMiddlewareStack(
            URLRouter(
                messaging.urls.ws_urlpatterns
            )
        ),
})
