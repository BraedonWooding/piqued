from groups.serializers import PiquedGroupSerializer
from rest_framework import serializers


class FeedSerializer(serializers.Serializer):
    feed_id = serializers.CharField()
    id = serializers.IntegerField()
    groups = PiquedGroupSerializer(many=True)
    last_updated_at = serializers.DateTimeField()
    image_url = serializers.CharField()
    name = serializers.CharField()
