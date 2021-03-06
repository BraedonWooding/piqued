
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import exceptions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import PiquedUser
from .serializers import UserSerializer
from .utils import generate_access_token, generate_refresh_token


class UserView(ModelViewSet):
    serializer_class = UserSerializer
    queryset = PiquedUser.objects.all()
