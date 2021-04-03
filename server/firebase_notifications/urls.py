from django.urls import path
from rest_framework.views import APIView
from . import views

urlpatterns = [
    path('add_fcm_tokens/', views.add_fcm_tokens),
    path('remove_fcm_tokens/', views.remove_fcm_tokens),
    path('mute/', views.mute),
    path('unmute/', views.unmute)
]