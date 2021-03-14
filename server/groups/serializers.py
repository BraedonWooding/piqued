from rest_framework import serializers
from user.models import PiquedUser

from .models import Group, PiquedGroup


class GroupSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Group
        fields = ('name', 'id')

class PiquedGroupSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name')
    id = serializers.IntegerField(source='group.id', read_only=True)

    def update(self, instance: PiquedGroup, validated_data):
        name = validated_data["group"]["name"]
        user = self.context['request'].user
        user = PiquedUser.objects.get(user_id=user.id)

        # Un commented code below may cause issues in future
        # as PiquedGroup.Group doesn't point to user list

        # assign on users side
        # user.groups.add(piquedGroup.group)
        # user.save()
        # instance.group.save()
        # instance.save()

        # Adam's thoughts happy to discuss

        instance.group.name = name
        instance.group.users.add(user)
        instance.group.save()
        instance.save()
        return instance

    def create(self, validated_data):
        groupname = validated_data["group"]["name"]
        user = self.context['request'].user
            # user = PiquedUser.objects.get(user_id=user.id)
        piquedUser = PiquedUser.objects.get(user_id=user.id)

        # TODO interests
        group=Group.objects.create(name=groupname)
        piquedGroup = PiquedGroup.objects.create(group=group)
        # piquedGroup.users.set([user])
        piquedUser.user.groups.set([piquedGroup.group])
        return piquedGroup

    class Meta:
        model = PiquedGroup
        # fields = ['id', 'group_name', 'users', 'interests']
        fields = ['id', 'group_name', 'interests']
            


