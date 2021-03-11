from rest_framework import serializers
from user.models import PiquedUser
from user.serializers import PiquedUserSerializer

from .models import Group, PiquedGroup

# serializers here unvalidated and WIP

class PiquedGroupSerializer(serializers.ModelSerializer):
    users = PiquedUserSerializer(many=True)
    group_name = serializers.CharField(source='group.name')

    #TODO interests many to many and 
    # bring permissions in here perhaps

    id = serializers.IntegerField(source='group.id', read_only=True)

    def create(self, validated_data):
        groupname = validated_data["group"]["name"]
        user = self.context['request'].user
        user = PiquedUser.objects.get(user_id=user.id)

        # TODO permissions and interests
        group=Group.objects.create(name=groupname)
        piquedGroup = PiquedGroup.objects.create(group=group)
        piquedGroup.users.set([user])
        return piquedGroup

    class Meta:
        model = PiquedGroup
        fields = ['id', 'group_name', 'users']
            


