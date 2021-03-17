from rest_framework import serializers
from user.models import PiquedUser

from .models import Group, PiquedGroup


class GroupSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Group
        fields = ('name', 'id')

class PiquedGroupSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='group.name')
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
        group=Group.objects.create(name=groupname)
        piquedGroup = PiquedGroup.objects.create(group=group)
        piquedUser.user.groups.set([piquedGroup.group])
        return piquedGroup

    class Meta:
        model = PiquedGroup
        fields = ['id', 'name', 'interests']
