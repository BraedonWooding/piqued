from django.db.models import base
from django.urls import path
from django.urls.conf import include
from rest_framework.routers import DefaultRouter

from .views import UserViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register('', UserViewSet, basename="PiquedUser")

urlpatterns = [
    path('', include(router.urls))
]
