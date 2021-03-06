from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import PiquedUser


class PiquedUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    id = serializers.IntegerField(source='user.id', read_only=True)

    def create(self, validated_data):
        date_of_birth = validated_data['date_of_birth']
        del validated_data['date_of_birth']
        return PiquedUser.objects.create(date_of_birth=date_of_birth, user=get_user_model().objects.create(**validated_data))

    class Meta:
        model = PiquedUser
        fields = ('date_of_birth', 'username', 'id',
                  'email', 'first_name', 'last_name')
