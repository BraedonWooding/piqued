from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from user.models import PiquedUser

from .models import Group, PiquedGroup


class SimplifiedUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = PiquedUser
        fields = ('date_of_birth', 'profile_picture', 'username', 'id',
                  'email', 'first_name', 'last_name', 'interests', 'program', 'courses')

class GroupSerializer(serializers.ModelSerializer):
    user_set = serializers.SerializerMethodField()

    def get_user_set(self, obj: Group):
        users = PiquedUser.objects.filter(user_id__in = [u.id for u in obj.user_set.all()])
        return [SimplifiedUserSerializer(pu).data for pu in users.all()]

    class Meta:
        model = Group
        depth = 1
        fields = ('id', 'user_set', 'name')


class PiquedGroupSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='group.name', validators=[UniqueValidator(
        queryset=Group.objects.all(), message="This group name is taken.")])
    id = serializers.IntegerField(source='group.id', read_only=True)

    def update(self, instance: PiquedGroup, validated_data):
        name = validated_data["group"]["name"]
        user = self.context['request'].user
        user = PiquedUser.objects.get(user_id=user.id)

        instance.group.name = name
        instance.group.users.add(user)
        instance.group.save()
        instance.save()
        return instance

    def create(self, validated_data):
        groupname = validated_data["group"]["name"]
        user = self.context['request'].user
        piquedUser = PiquedUser.objects.get(user_id=user.id)

        # TODO interests
        group = Group.objects.create(name=groupname)
        piquedGroup = PiquedGroup.objects.create(
            group=group, created_by=piquedUser)
        piquedUser.user.groups.add(piquedGroup.group)
        return piquedGroup

    class Meta:
        model = PiquedGroup
        fields = ['id', 'name', 'interests', 'created_by']
