import json
import urllib.parse
from datetime import datetime

import src.settings as settings
from asgiref.sync import AsyncToSync
from azure.cosmosdb.table.tableservice import TableService
from channels.layers import get_channel_layer
from django.http import HttpResponseForbidden
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from src.permissions import AppKey

from messaging.models import Feed
from messaging.serializers import FeedSerializer


@AsyncToSync
async def do_msg_send(msg):
    await get_channel_layer().group_send(f"chat_{msg['PartitionKey']}", msg)

@api_view(['POST'])
def send_msg(request):
    app_key = request.META['HTTP_X_APP_KEY']
    if settings.APP_KEY != app_key:
        return HttpResponseForbidden()

    do_msg_send(request.data)
    return Response()

class FeedViewSet(ModelViewSet):
    serializer_class = FeedSerializer
    queryset = Feed.objects.all()
    permission_classes = []

    def check_permissions(self, req):
        return None

    @action(detail=True, methods=['post'])
    def update_feed(self, request, pk):
        feed = self.get_object()
        feed.last_updated_at = int(request.data['updated'])
        
        table_service = TableService(
            account_name=settings.AZURE_STORAGE_ACCOUNT_NAME, account_key=settings.AZURE_STORAGE_ACCOUNT_KEY
        )

        table_service.create_table('RSS', fail_on_exist=False)
        for msg in request.data['items']:
            mapped = {
                "type": "chat_message",
                "PartitionKey": str(feed.id),
                "RowKey": str(msg['published']),
                "createdAt": datetime.fromtimestamp(float(msg['published']) / 1000),
                "overrideRowKey": msg['published'],
                "files": f'[{{ "url": "{urllib.parse.quote_plus(msg["canonicalUrl"] if "canonicalUrl" in msg else (msg["originId"] if "originId" in msg else ""))}", "type": "feed/{msg["title"]}" }}]',
                "userId": "feed/" + str(feed.id),
                "isHtml": True,
                "deleted": 0,
                "seen": "",
                "message": ""
            }

            table_service.insert_or_replace_entity('RSS', mapped)
            for group in feed.groups.all():
                mapped["PartitionKey"] = str(group.group.id)
                table_service.insert_or_replace_entity('Messages', mapped)
                do_msg_send(mapped)
        feed.save()
        return Response()

