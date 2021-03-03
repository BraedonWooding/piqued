# messaging/urls.py
from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('<str:group_name>/', views.group, name='group'),
]