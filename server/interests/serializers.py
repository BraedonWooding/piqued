from rest_framework import serializers


class InterestSerializer(serializers.Serializer):
    name = serializers.CharField()
    is_course = serializers.BooleanField()
