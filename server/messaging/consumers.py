# messaging/consumers.py
import json
import sys
import traceback
from datetime import datetime, timedelta, timezone
from os import sync

from asgiref.sync import sync_to_async
from azure.cosmosdb.table.models import Entity
from azure.cosmosdb.table.tablebatch import TableBatch
from azure.cosmosdb.table.tableservice import TableService
from channels.generic.websocket import AsyncWebsocketConsumer
from dateutil import parser, tz
from django.conf import settings
from groups.models import PiquedGroup
from user.models import PiquedUser
from user.views import PiquedUsersForGroupViewSet, UserViewSet


def handleException(e, loc):
    exc_type = e[0]
    exc_value = e[1]
    exc_tb = e[2]
    print("\n\n--------\nError in " + loc + "\n" + str(exc_value) + "\nTraceback: " + str(traceback.format_exception(exc_type, exc_value, exc_tb)))

def SendAlerts():
    PiquedUsersForGroupViewSet(group_id=1).get_queryset().all()

class GroupConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.groupId = self.scope['url_route']['kwargs']['groupId']
            self.userId = self.scope['url_route']['kwargs']['userId']
            self.channelGroupName = 'chat_%s' % self.groupId

            await sync_to_async(SendAlerts)

            # Join channel group
            await self.channel_layer.group_add(
                self.channelGroupName,
                self.channel_name
            )

            self.table_service = TableService(
                account_name=settings.AZURE_STORAGE_ACCOUNT_NAME, account_key=settings.AZURE_STORAGE_ACCOUNT_KEY
            )

            try:
                if not self.table_service.exists('Messages'):
                    self.table_service.create_table('Messages')
            except:
                # ignoring if someone else created it between exists <-> create
                if not self.table_service.exists('Messages'):
                    raise

            self.msgs = await sync_to_async(self.get_history)()

            await self.accept()

            for msg in self.msgs:
                await self.chat_message(msg)
        except Exception:
            handleException(sys.exc_info(),"connecting to socket.")


    def get_history(self, msgs_since=datetime.now(timezone.utc) - timedelta(days=30)):
        filter = "PartitionKey eq '" + str(self.groupId) + "' and deleted eq 0"
        msgs = self.table_service.query_entities('Messages', filter=filter)
        return msgs

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.channelGroupName,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            files = text_data_json['files'] # Files are urls
            userId = text_data_json['userId']
            timestamp = datetime.now(timezone.utc)
            rowKey = str(int(timestamp.timestamp() * 10000000))

            msg = {
                'PartitionKey': str(self.groupId),
                'RowKey': rowKey,
                'message': message,
                'files': files,
                'deleted': 0,
                'userId': int(userId),
                'seen': str(self.userId) + " ",
                'createdAt': timestamp}
            print(f"Received Message for {userId} in group {self.groupId}: {msg}")
            self.table_service.insert_entity('Messages', msg)

            # Send message to room group
            await self.channel_layer.group_send(
                self.channelGroupName,
                {
                    'type': 'chat_message',
                    'message': message,
                    'files': files,
                    'userId': userId,
                    'createdAt': timestamp.astimezone(),
                    'PartitionKey':  str(self.groupId),
                    'RowKey': rowKey,
                    'seen': str(self.userId) + " "
                }
            )
        except Exception:
            handleException(sys.exc_info(),"socket receiving data from client.")

    # Receive message from room group
    async def chat_message(self, event):
        try:
            seen = event['seen']
            if str(self.userId) not in seen.split():
                seen += str(self.userId) + " "
                msg = {'PartitionKey': event["PartitionKey"], 
                    'RowKey': event["RowKey"],
                    'seen': seen
                }
                self.table_service.merge_entity('Messages', msg)

            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'files': event['files'],
                'userId': event['userId'],
                'timestamp': str(event["createdAt"]),
                'partitionKey': event["PartitionKey"],
                'rowKey': event["RowKey"],
                'seen': seen
            }))
        except Exception:
            handleException(sys.exc_info(),"socket recieving message from socket_group (channel layer).")
