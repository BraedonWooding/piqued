from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import PiquedUser


class PiquedUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', validators=[UniqueValidator(
        queryset=get_user_model().objects.all(), message="This username is taken.")])
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    username = serializers.CharField(source='user.username')
    password = serializers.CharField(
        write_only=True,
        required=True,
    )
    id = serializers.IntegerField(source='user.id', read_only=True)

    def create(self, validated_data):
        user = validated_data['user']
        password = make_password(user['password'])
        del validated_data['user']
        del user['password']
        return PiquedUser.objects.create(**validated_data, user=get_user_model().objects.create(**user, password=password))

    class Meta:
        model = PiquedUser
        fields = ('id', 'first_name', 'last_name', 'email',
                  'username', 'password', 'date_of_birth')
