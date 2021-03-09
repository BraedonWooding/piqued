from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/create_group/$', consumers.GroupConsumer.as_asgi()),
]