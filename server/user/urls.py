from django.urls import path

from .views import UserList, current_user

urlpatterns = [
    path('current_user/', current_user),
    path('users/', UserList.as_view())
]
