from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TranscriptViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'transcript', TranscriptViewSet)

urlpatterns = [
    path('', include(router.urls))
]
