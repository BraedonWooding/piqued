# messaging/consumers.py
import json
import sys
import traceback
from datetime import datetime, timedelta, timezone

from asgiref.sync import sync_to_async
from azure.cosmosdb.table.models import Entity
from azure.cosmosdb.table.tableservice import TableService
from channels.generic.websocket import AsyncWebsocketConsumer
from dateutil import parser, tz
from django.conf import settings

def handleException(e, loc):
    exc_type = e[0]
    exc_value = e[1]
    exc_tb = e[2]
    print("\n\n--------\nError in " + loc + "\n" + str(exc_value) + "\nTraceback: " + str(traceback.format_exception(exc_type, exc_value, exc_tb)))

class GroupConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.groupId = self.scope['url_route']['kwargs']['groupId']
            # Get group_ID from the db (Db not implemented yet by Adam)

            self.username = self.scope["user"]
            #TODO somehow get user
            self.channelGroupName = 'chat_%s' % self.groupId

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
        msgs = self.table_service.query_entities(
            'Messages', filter="PartitionKey eq '" + str(self.groupId) + "'")
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

            msg = {
                'PartitionKey': str(self.groupId),
                'RowKey': str(int(timestamp.timestamp() * 10000000)),
                'message': message,
                'files': files,
                'deleted': 0,
                'userId': int(userId),
                'assets': "",
                'modifiedAt': timestamp}
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
                    'modifiedAt': timestamp.astimezone()
                }
            )
        except Exception:
            handleException(sys.exc_info(),"socket receiving data from client.")

    # Receive message from room group
    async def chat_message(self, event):
        try:
            print(event["modifiedAt"])
            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'files': event['files'],
                'userId': event['userId'],
                'timestamp': str(event["modifiedAt"])
            }))
        except Exception:
            handleException(sys.exc_info(),"socket recieving message from socket_group (channel layer).")
