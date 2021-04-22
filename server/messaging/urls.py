# messaging/routing.py
from django.urls import re_path
from django.urls.conf import include, path
from rest_framework.routers import DefaultRouter

from messaging import views

from . import consumers

router = DefaultRouter()
router.register(r'feeds', views.FeedViewSet)

ws_urlpatterns = [
    re_path(r'ws/messaging/(?P<userId>\w+)/$',
            consumers.GroupConsumer.as_asgi()),
]

urlpatterns = [
    path('messaging/api-send', views.send_msg),
    path('', include(router.urls))
]
