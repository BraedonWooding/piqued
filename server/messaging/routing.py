# messaging/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/messaging/(?P<groupId>\w+)/(?P<userId>\w+)/$', consumers.GroupConsumer.as_asgi()),
]
