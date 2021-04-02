from django.db.models import base
from django.urls import path
from django.urls.conf import include
from rest_framework.routers import DefaultRouter

from .views import PiquedUsersForGroupViewSet, UserViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'testing/(?P<group_id>\d+)', PiquedUsersForGroupViewSet, basename="PiquedUser")

urlpatterns = [
    path('', include(router.urls))
]
