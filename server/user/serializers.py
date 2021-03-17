from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from groups.serializers import GroupSerializer, PiquedGroupSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import PiquedUser


class PiquedUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', validators=[UniqueValidator(
        queryset=get_user_model().objects.all(), message="This username is taken.")])
    first_name = serializers.CharField(source='user.first_name')
    groups = GroupSerializer(source='user.groups', many=True, read_only=True)
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    password = serializers.CharField(
        source='user.password',
        write_only=True,
        required=True,
    )
    id = serializers.IntegerField(source='user.id', read_only=True)

    def update(self, instance: PiquedUser, validated_data):
        if 'user' in validated_data:
            user = validated_data['user']
            del validated_data['user']
        else:
            user = {}
        if 'courses' in validated_data:
            user_courses = validated_data['courses']
            instance.courses.set(user_courses)
            del validated_data['courses']

        for key, value in validated_data.items():
            setattr(instance, key, value)
        for key, value in user.items():
            setattr(instance.user, key, value)
        instance.user.save()
        instance.save()
        return instance

    def create(self, validated_data):
        user = validated_data['user']
        password = make_password(user['password'])
        del validated_data['user']
        del user['password']
        return PiquedUser.objects.create(**validated_data, user=get_user_model().objects.create(**user, password=password))

    class Meta:
        model = PiquedUser
        fields = ('date_of_birth', 'profile_picture', 'username', 'password', 'id', 'groups',
                  'email', 'first_name', 'last_name', 'interests', 'program', 'courses')
