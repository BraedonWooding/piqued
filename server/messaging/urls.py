# messaging/routing.py
from django.urls import re_path

from . import consumers

urlpatterns = [
    re_path(r'ws/messaging/(?P<userId>\w+)/$',
            consumers.GroupConsumer.as_asgi()),
]
