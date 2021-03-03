# messaging/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/messaging/(?P<group_name>\w+)/$', consumers.GroupConsumer.as_asgi()),
]