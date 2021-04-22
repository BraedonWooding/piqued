from django.urls import path

from . import views

urlpatterns = [
    path('forgot_password/', views.forgot_password),
    path('change_password/', views.change_password)
]
