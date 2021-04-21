from django.urls import path
from rest_framework.views import APIView
from . import views

urlpatterns = [
    path('upload/', views.upload),
    path('shortcutUpload/', views.shortcutUpload)
]