from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PiquedGroupViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'groups', PiquedGroupViewSet)

urlpatterns = [
    path('', include(router.urls))
]
