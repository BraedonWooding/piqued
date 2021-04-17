from django.urls import path
from django.urls.conf import include
from rest_framework import views
from rest_framework.routers import DefaultRouter
from . import views

from .views import InterestGraphViewSet, InterestViewSet, addInterests, recommendGroups, getChessEngine, createPopularGroups

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'interests', InterestViewSet)
router.register(r'interest-graph', InterestGraphViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('addInterests/', views.addInterests),
    path('recommendGroups/', views.recommendGroups),
    path('getChessEngine/', views.getChessEngine),
    path('createPopularGroups/', views.createPopularGroups)
]
