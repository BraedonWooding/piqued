from datetime import datetime, timedelta, timezone

from asgiref.sync import AsyncToSync
from azure.cosmosdb.table.tableservice import TableService
from channels.layers import get_channel_layer
from django.db.models import Count
from django.http import HttpResponse
from messaging.models import Feed
from rest_framework import filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from src import settings

from .serializers import (PiquedGroup, PiquedGroupSerializer,
                          SimplifiedPiquedGroupSerializer)


class PiquedGroupViewSet(ModelViewSet):
    serializer_class = PiquedGroupSerializer
    queryset = PiquedGroup.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'group_id'
    filter_backends = [filters.SearchFilter, ]
    search_fields = ['group__name']

    @AsyncToSync
    async def send_update(self, group_id, user_id, status):
        await get_channel_layer().group_send(f"chat_{group_id}", {
            'type': 'user_update',
            'groupId': group_id,
            'userId': user_id,
            'status': status
        })

    @AsyncToSync
    async def send_feed(self, feed_id, group_id):
        table_service = TableService(
            account_name=settings.AZURE_STORAGE_ACCOUNT_NAME, account_key=settings.AZURE_STORAGE_ACCOUNT_KEY
        )
        messages = table_service.query_entities('RSS', filter=f"PartitionKey eq '{feed_id}' and deleted eq 0")
        for msg in messages:
            msg['type'] = 'chat_message'
            await get_channel_layer().group_send(f"chat_{group_id}", msg)

    @action(detail=True, methods=['put'])
    def add_feed(self, request, group_id):
        piquedGroup = self.get_object()
        feed = Feed.objects.filter(feed_id = request.data['feed_id']).first()
        if not feed:
            feed = Feed.objects.create(feed_id = request.data['feed_id'], name=request.data['name'], image_url = request.data['image_url'] if 'image_url' in request.data else None, last_updated_at = datetime.now(timezone.utc))
        feed.groups.add(piquedGroup.group.id)
        feed.save()
        # go through the entire feed and send all their messages
        self.send_feed(feed.id, piquedGroup.group.id)

        return HttpResponse("{} added to group".format(request.data['feed_id']))

    @action(detail=True, methods=['delete'])
    def remove_feed(self, request, group_id):
        piquedGroup = self.get_object()
        feed = Feed.objects.filter(feed_id = request.data['feed_id']).first()
        if feed:
            feed.groups.remove(piquedGroup.group.id)
            feed.save()
        return HttpResponse("{} removed group".format(request.data['feed_id']))

    @action(detail=True, methods=['delete'])
    def remove_user(self, request, group_id):
        piquedGroup = self.get_object()
        userToRemove = self.request.user
        userToRemove.groups.remove(piquedGroup.group.id)
        userToRemove.save()

        self.send_update(piquedGroup.group.id, userToRemove.id, 'deleted')
        return HttpResponse("{} removed from group".format(userToRemove.username))

    @action(detail=True, methods=['put'])
    def add_user(self, request, group_id):
        piquedGroup = self.get_object()
        userToAdd = self.request.user
        userToAdd.groups.add(piquedGroup.group.id)
        userToAdd.save()

        self.send_update(piquedGroup.group.id, userToAdd.id, 'added')

        return HttpResponse("{} added to group".format(userToAdd.username))

    # return all piqued groups the user is not in, in descending order
    @action(detail=False, methods=['get'])
    def popular(self, request):
        popularGroups = PiquedGroup.objects.filter(group__user__isnull=False)
        popularGroups = popularGroups.annotate(num_users=Count('group__user')).filter(num_users__gt=0).order_by('-num_users')
        return Response(SimplifiedPiquedGroupSerializer(list(popularGroups), many=True).data)
