from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from user.models import PiquedUser

from .models import Group, PiquedGroup


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        depth = 5
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
