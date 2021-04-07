from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from groups.models import PiquedGroup
from groups.serializers import PiquedGroupSerializer
from info.serializers import CourseSerializer, ProgramSerializer
from interests.serializers import InterestSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from interests.serializers import InterestSerializer

from .models import PiquedUser
from interests.models import Interest


class PiquedUserSerializer(serializers.Serializer):
    username = serializers.CharField(source='user.username', validators=[UniqueValidator(
        queryset=get_user_model().objects.all(), message="This username is taken.")])
    first_name = serializers.CharField(source='user.first_name')
    groups = serializers.SerializerMethodField(read_only=True)
    groups_created = serializers.SerializerMethodField(read_only=True)
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    password = serializers.CharField(
        source='user.password',
        write_only=True,
        required=True,
    )
    id = serializers.IntegerField(source='user.id', read_only=True)
    date_of_birth = serializers.DateField()
    fcm_tokens = serializers.CharField(required=False)
    interests = InterestSerializer(many=True, required=False)
    program = ProgramSerializer(required=False)
    courses = CourseSerializer(many=True, required=False)

    def get_groups_created(self, obj: PiquedUser):
        return [x.id for x in obj.groups_created.all()]

    def get_groups(self, obj: PiquedUser):
        groups = PiquedGroup.objects.filter(
            group__user__id__exact=obj.user_id).all()
        return [PiquedGroupSerializer(pg).data for pg in groups.all()]
    interests = InterestSerializer(many=True, required=False, read_only=True)
    interests_id = serializers.PrimaryKeyRelatedField(many=True, required=False, write_only=True, source='interests', queryset=Interest.objects.all())

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
        if 'interests' in validated_data:
            user_interests = validated_data['interests']
            instance.interests.set(user_interests)
            del validated_data['interests']

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
