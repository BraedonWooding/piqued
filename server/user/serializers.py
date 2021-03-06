from django.contrib.auth.models import User
from rest_framework import serializers

from .models import PiquedUser


class PiquedUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    last_name = serializers.CharField(source='user.last_name')
    first_name = serializers.CharField(source='user.first_name')
    email = serializers.EmailField(source='user.email')
    id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = PiquedUser
        fields = ('date_of_birth', 'username', 'id', 'email', 'first_name', 'last_name')
