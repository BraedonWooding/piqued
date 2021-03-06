from django.contrib.auth import get_user, get_user_model
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import PiquedUser


class PiquedUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', validators=[UniqueValidator(queryset=get_user_model().objects.all(), message="This username is taken")])
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    id = serializers.IntegerField(source='user.id', read_only=True)

    def create(self, validated_data):
        user = validated_data['user']
        del validated_data['user']
        return PiquedUser.objects.create(**validated_data, user=get_user_model().objects.create(**user))

    class Meta:
        model = PiquedUser
        fields = ('date_of_birth', 'username', 'id',
                  'email', 'first_name', 'last_name')
