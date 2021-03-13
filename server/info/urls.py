from django.urls import path
from django.urls.conf import include
from rest_framework.routers import DefaultRouter

from .views import CourseViewSet, ProgramViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'info/courses', CourseViewSet)
router.register(r'info/programs', ProgramViewSet)

urlpatterns = [
    path('', include(router.urls))
]
