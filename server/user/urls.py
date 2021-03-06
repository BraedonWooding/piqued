from django.urls import path

from .views import login, refresh_token

urlpatterns = [
    path('login/', login),
    path('refresh_token/', refresh_token)
]
