from channels.layers import get_channel_layer
from interests.models import Interest
from interests.serializers import InterestSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from user.models import PiquedUser

from .models import Group, PiquedGroup


class SimplifiedFeedSerializer(serializers.Serializer):
    feed_id = serializers.CharField()
    id = serializers.IntegerField()
    last_updated_at = serializers.DateTimeField()
    image_url = serializers.CharField()
    name = serializers.CharField()

class SimplifiedUserSerializer(serializers.Serializer):
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    id = serializers.IntegerField(source='user.id', read_only=True)


class GroupSerializer(serializers.Serializer):
    user_set = serializers.SerializerMethodField()
    id = serializers.IntegerField()
    name = serializers.CharField()

    def get_user_set(self, obj: Group):
        users = PiquedUser.objects.filter(
            user_id__in=[u.id for u in obj.user_set.all()])
        return [SimplifiedUserSerializer(pu).data for pu in users.all()]

class SimplifiedPiquedGroupSerializer(serializers.Serializer):
    name = serializers.CharField(source='group.name', validators=[UniqueValidator(
        queryset=Group.objects.all(), message="This group name is taken.")])
    id = serializers.IntegerField(source='group.id', read_only=True)
    interests = InterestSerializer(many=True, required=False)
    expired_at = serializers.DateField(required=False)

class PiquedGroupSerializer(serializers.Serializer):
    name = serializers.CharField(source='group.name', validators=[UniqueValidator(
        queryset=Group.objects.all(), message="This group name is taken.")])
    id = serializers.IntegerField(source='group.id', read_only=True)
    user_set = serializers.SerializerMethodField()
    interests = InterestSerializer(many=True, required=False)
    created_by = SimplifiedUserSerializer(required=False)
    expired_at = serializers.DateField(required=False)
    feeds = SimplifiedFeedSerializer(many=True, read_only=True)

    def update(self, instance: PiquedGroup, validated_data):
        name = validated_data["group"]["name"]
        user = self.context['request'].user
        user = PiquedUser.objects.get(user_id=user.id)

        instance.group.name = name
        instance.group.users.add(user)
        instance.group.save()
        instance.save()
        return instance

    interests_id = serializers.PrimaryKeyRelatedField(many=True, required=False, write_only=True, source='interests', queryset=Interest.objects.all())

    def create(self, validated_data):
        groupname = validated_data["group"]["name"]
        interests = validated_data['interests']
        user = self.context['request'].user
        piquedUser = PiquedUser.objects.get(user_id=user.id)

        group = Group.objects.create(name=groupname)
        piquedGroup = PiquedGroup.objects.create(
            group=group, created_by=piquedUser)

        # we don't need to trigger the channel event here.

        piquedGroup.interests.set(interests)
        piquedGroup.save()
        
        piquedUser.user.groups.add(piquedGroup.group)
        return piquedGroup

    def get_user_set(self, obj: PiquedGroup):
        users = PiquedUser.objects.filter(
            user_id__in=[u.id for u in obj.group.user_set.all()])
        return [SimplifiedUserSerializer(pu).data for pu in users.all()]
