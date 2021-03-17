# messaging/urls.py
from django.urls import path
from rest_framework.views import APIView
from . import views

urlpatterns = [
    path('delete/', views.delete),
    path('edit/', views.edit)
]
