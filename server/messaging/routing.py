# messaging/routing.py
from django.urls import re_path

from . import consumers, notificationConsumers

websocket_urlpatterns = [
    re_path(r'ws/messaging/(?P<groupId>\w+)/(?P<userId>\w+)/$', consumers.GroupConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<userId>\w+)/$', notificationConsumers.NotificationConsumer.as_asgi()),
]
