# messaging/consumers.py
import json
import sys
import traceback
from datetime import datetime, timezone
from enum import Enum

from azure.cosmosdb.table.tableservice import TableService
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.contrib.auth.models import Group
from groups.models import PiquedGroup
from user.models import PiquedUser


def handleException(e, loc):
    exc_type = e[0]
    exc_value = e[1]
    exc_tb = e[2]
    print("\n\n--------\nError in " + loc + "\n" + str(exc_value) +
          "\nTraceback: " + str(traceback.format_exception(exc_type, exc_value, exc_tb)))


class MessageType(str, Enum):
    GET_HISTORY = "get_history",
    CHAT_MESSAGE = "chat_message",
    SEEN_MESSAGE = "seen_message",
    STATUS_UPDATE = "status_update"


class GroupConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        try:
            self.userId = self.scope['url_route']['kwargs']['userId']
            self.table_service = TableService(
                account_name=settings.AZURE_STORAGE_ACCOUNT_NAME, account_key=settings.AZURE_STORAGE_ACCOUNT_KEY
            )

            await self.accept()

            self.groups = await database_sync_to_async(self.get_groups)()

            for group in self.groups:
                # Join channel group for each group user is in
                await self.channel_layer.group_add(
                    f'chat_{group.id}',
                    self.channel_name
                )
                await self.channel_layer.group_send(
                    f"chat_{group.id}",
                    {
                        'type': MessageType.STATUS_UPDATE,
                        'userId': self.userId,
                        'status': "Online",
                        'isResponse': False
                    })

            try:
                if not self.table_service.exists('Messages'):
                    self.table_service.create_table('Messages')
            except:
                # ignoring if someone else created it between exists <-> create
                if not self.table_service.exists('Messages'):
                    raise

        except Exception:
            handleException(sys.exc_info(), "connecting to socket.")

    def get_groups(self):
        groups = Group.objects.filter(user__id__exact=self.userId)
        return list(groups.all())

    async def disconnect(self, close_code):
        for group in self.groups:
            # Leave channel group for each group user is in
            await self.channel_layer.group_send(
                f"chat_{group.id}",
                {
                    'type': MessageType.STATUS_UPDATE,
                    'userId': self.userId,
                    'status': "Offline",
                    'isResponse': False
                })
            await self.channel_layer.group_discard(
                f"chat_{group.id}",
                self.channel_name
            )

    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json['type']

            # Send message to room group
            if message_type == MessageType.GET_HISTORY:
                await self.get_history({
                    'partitionKey':  text_data_json['partitionKey'],
                })
            elif message_type == MessageType.CHAT_MESSAGE:
                createdAt = datetime.now(timezone.utc)
                partitionKey = text_data_json['partitionKey']
                rowKey = str(int(createdAt.timestamp() * 10000000))
                message = text_data_json['message']
                files = text_data_json['files']  # Files are urls
                userId = text_data_json['userId']
                seen = text_data_json["seen"]

                msg = {
                    'PartitionKey': partitionKey,
                    'RowKey': rowKey,
                    'message': message,
                    'files': files,
                    'deleted': 0,
                    'userId': userId,
                    'seen': seen,
                    'createdAt': createdAt
                }

                self.table_service.insert_entity('Messages', msg)

                await self.channel_layer.group_send(
                    f"chat_{partitionKey}",
                    {
                        'type': message_type,
                        'PartitionKey': partitionKey,
                        'RowKey': rowKey,
                        'message': message,
                        'files': files,
                        'userId': userId,
                        'seen': seen,
                        'createdAt': createdAt.astimezone(),
                    }
                )
            elif message_type == MessageType.SEEN_MESSAGE:
                partitionKey = text_data_json['partitionKey']

                await self.channel_layer.group_send(
                    f"chat_{partitionKey}", {
                        'type': MessageType.SEEN_MESSAGE,
                        'partitionKey': partitionKey,
                        'rowKey':  text_data_json['rowKey'],
                        'seen':  text_data_json['seen'],
                    })
        except Exception:
            handleException(
                sys.exc_info(), "socket receiving data from client.")

    # Function handlers to receive message from room group based on message type
    async def get_history(self, event):
        try:
            partitionKey = event['partitionKey']
            messages = self.table_service.query_entities(
                'Messages', filter=f"PartitionKey eq '{partitionKey}' and deleted eq 0")
            serializable_messages = []

            for message in messages:
                serializable_messages.append({
                    'partitionKey': message["PartitionKey"],
                    'rowKey': message["RowKey"],
                    'message': message['message'],
                    'files': message['files'],
                    'userId': message['userId'],
                    'seen': message['seen'],
                    'createdAt': str(message["createdAt"]),
                })

            await self.history_messages({'type': MessageType.GET_HISTORY, 'messages': serializable_messages})
        except Exception:
            handleException(
                sys.exc_info(), "socket receiving message type 'get_history' from socket_group (channel layer).")

    async def history_messages(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': event['type'],
                'messages': event['messages'],
            }))
        except Exception:
            handleException(
                sys.exc_info(), "socket receiving message type 'history_messages' from socket_group (channel layer).")

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': event['type'],
                'partitionKey': event["PartitionKey"],
                'rowKey': event["RowKey"],
                'message': event['message'],
                'files': event['files'],
                'userId': event['userId'],
                'seen': event['seen'],
                'createdAt': str(event["createdAt"]),
            }))
        except Exception:
            handleException(
                sys.exc_info(), "socket receiving message type 'chat_message' from socket_group (channel layer).")

    async def seen_message(self, event):
        try:
            self.table_service.merge_entity('Messages', {
                'PartitionKey': event["partitionKey"],
                'RowKey': event["rowKey"],
                'seen': event['seen']
            })

            await self.send(text_data=json.dumps({
                'type': event['type'],
                'partitionKey': event["partitionKey"],
                'rowKey': event["rowKey"],
                'seen': event['seen'],
            }))
        except Exception:
            handleException(
                sys.exc_info(), "socket receiving message type 'seen_message' from socket_group (channel layer).")

    async def status_update(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': MessageType.STATUS_UPDATE,
                'status': event["status"],
                'userId': event["userId"],
            }))
            if (not event["isResponse"]):
                for group in self.groups:
                    await self.channel_layer.group_send(f"chat_{group.id}", {
                        'type': MessageType.STATUS_UPDATE,
                        'status': event["status"],
                        'userId': self.userId,
                        'isResponse': True
                    })
        except Exception:
            handleException(
                sys.exc_info(), "socket receiving message type 'status_update' from socket_group (channel layer).")
