from django.contrib.auth import get_user, get_user_model
from django.contrib.auth.models import User
from django.db import IntegrityError
from groups.serializers import PiquedGroupSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from user.serializers import PiquedUserSerializer

from .models import Interest


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ('name', 'is_course')

class InterestGraphSerializer(serializers.ModelSerializer):
    users = PiquedUserSerializer(many=True, read_only=True)
    groups = PiquedGroupSerializer(many=True, read_only=True)

    class Meta:
        model = Interest
        fields = ('id', 'name', 'is_course', 'users', 'groups')
