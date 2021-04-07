from django.contrib.auth import get_user, get_user_model
from django.contrib.auth.models import User
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Course, Program


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ('program_code', 'name', 'id')

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('course_code', 'course_name', 'id')
