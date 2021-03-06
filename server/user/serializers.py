from rest_framework import serializers
from rest_framework_jwt.settings import api_settings

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'date_of_birth')
