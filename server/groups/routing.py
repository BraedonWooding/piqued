from djang.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/create_group/(?P<group_name>\w+)/$', consumers.GroupConsumer.as_asgi()),
]