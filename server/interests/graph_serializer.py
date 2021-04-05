from django.contrib.auth import get_user, get_user_model
from django.contrib.auth.models import User
from django.db import IntegrityError
from groups.serializers import (GroupSerializer, PiquedGroupSerializer,
                                SimplifiedUserSerializer)
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from user.serializers import PiquedUserSerializer


class InterestGraphSerializer(serializers.Serializer):
    users = SimplifiedUserSerializer(many=True, read_only=True)
    groups = PiquedGroupSerializer(many=True, read_only=True)
    id = serializers.IntegerField()
    name = serializers.CharField()
    is_course = serializers.BooleanField()
