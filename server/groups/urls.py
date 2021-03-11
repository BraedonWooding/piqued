from django.urls import include, path

from . import views
from .routing import router

urlpatterns = [
    path('create_group/', views.index),
]

urlpatterns += router.urls

