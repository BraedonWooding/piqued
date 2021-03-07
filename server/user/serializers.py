from django.contrib.auth import get_user, get_user_model
from django.contrib.auth.models import User
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

    def update(self, instance: PiquedUser, validated_data):
        user = validated_data['user']
        del validated_data['user']
        for key, value in validated_data.items():
            setattr(instance, key, value)
        for key, value in user.items():
            setattr(instance.user, key, value)
        instance.user.save()
        instance.save()
        # User.objects.filter(id=instance.user_id).update(user)
        return instance

    def create(self, validated_data):
        user = validated_data['user']
        del validated_data['user']
        return PiquedUser.objects.create(**validated_data, user=get_user_model().objects.create(**user))

    class Meta:
        model = PiquedUser
        fields = ('date_of_birth', 'profile_picture', 'username', 'id',
                  'email', 'first_name', 'last_name')
