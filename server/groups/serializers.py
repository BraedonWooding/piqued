from user.serializers import PiquedUserSerializer
from rest_framework import serializers
from user.models import PiquedUser
from .models import PiquedGroup, Group

# serializers here unvalidated and WIP

class PiquedGroupSerializer(serializers.ModelSerializer):
    piquedUserSerializer = PiquedUserSerializer()
    name = serializers.CharField(source='group.name')
    # permissions = serializers.
    users = piquedUserSerializer
    is_course = serializers.BooleanField(source='is_course')
    ModifiedAt = serializers.DateTimeField(source='ModifiedAt')      # update on modification
    CreatedAt = serializers.DateTimeField(source='CreatedAt')  
    id = serializers.IntegerField(source='group.id', read_only=True)

    def create(self, validated_data):
        group = validated_data['group']
        users = validated_data['users']
        # newGroup = 
        # newGroup = PiquedGroup.objects.create(**validated_data, group=Group.objects.create())
        newGroup = PiquedGroup.objects.create(is_course=validated_data['is_course'])
        #  return PiquedGroup.objects.create(

class Meta:
    model = PiquedGroup
    fields = ['id', 'name', 'permissions', 'users', 'is_course', 'ModifiedAt', 'CreatedAt']
        


