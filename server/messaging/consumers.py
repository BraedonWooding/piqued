# messaging/consumers.py
import json
import sys
import traceback
from datetime import datetime, timezone
from enum import Enum

from asgiref.sync import sync_to_async
from azure.cosmosdb.table.tableservice import TableService
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.contrib.auth.models import Group
from firebase_notifications.notification_send import send_to_all_user_devices
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
    STATUS_UPDATE = "status_update",
    MESSAGE_UPDATE = "message_update",
    USER_UPDATE = "user_update",

class GroupConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.userId = self.scope['url_route']['kwargs']['userId']
            self.table_service = TableService(
                account_name=settings.AZURE_STORAGE_ACCOUNT_NAME, account_key=settings.AZURE_STORAGE_ACCOUNT_KEY
            )
            self.groupIds = []

            await self.accept()

            # Join channel group for each group user is in
            for group in await database_sync_to_async(lambda: list(Group.objects.filter(user__id__exact=self.userId).all()))():
                self.groupIds.append(group.id)
                print("Joining " + f'chat_{group.id}')
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

            # create messaging table if it doesn't exist
            try:
                if not self.table_service.exists('Messages'):
                    self.table_service.create_table('Messages')
            except:
                # ignoring if someone else created it between exists <-> create
                if not self.table_service.exists('Messages'):
                    raise

        except Exception:
            handleException(sys.exc_info(), "connecting to socket.")

    # Takes in a message object
    def send_notifications(self, message):
        groupId = int(message['PartitionKey'])
        message = message['message']
        piquedGroup = PiquedGroup.objects.filter(group_id=groupId).first()

        # Getting muted users dict
        try:
            mutedUsers = json.loads(piquedGroup.muted_users)
        except:
            mutedUsers = {}

        group = piquedGroup.group
        users = PiquedUser.objects.filter(user__groups__id__exact=groupId)

        for user in users:
            # Do not send to self
            if str(user.user.id) == str(self.userId):
                continue

            # If mutedUsers[user.id] < 0, it is muted indefinitely
            if str(user.user.id) not in mutedUsers \
                or (mutedUsers[str(user.user.id)] >= 0 \
                    and datetime.now(timezone.utc) >= datetime.fromtimestamp(mutedUsers[str(user.user.id)], tz=timezone.utc)\
                ):
                send_to_all_user_devices(user, group.name, message)
    
    def get_shortcuts(self):
        user = PiquedUser.objects.filter(user__id__exact=self.userId)[0]
        shortcuts = json.loads(user.shortcuts)
        return shortcuts
            
    def get_groups(self):
        groups = Group.objects.filter(user__id__exact=self.userId)
        return list(groups.all())

    async def disconnect(self, close_code):
        for groupId in self.groupIds:
            # Leave channel group for each group user is in and send as response because we don't want a reply
            await self.channel_layer.group_send(
                f"chat_{groupId}",
                {
                    'type': MessageType.STATUS_UPDATE,
                    'userId': self.userId,
                    'status': "Offline",
                    'isResponse': True
                })
            await self.channel_layer.group_discard(
                f"chat_{groupId}",
                self.channel_name
            )

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

                # Check for user-defined text shortcuts
                shortcuts = await sync_to_async(self.get_shortcuts)()
                for shortcut in shortcuts:
                    if str(message) == shortcut[0]: # shortcut[0] is the shortcut string
                        message = ""
                        files = json.loads(files)
                        file_to_add = shortcut[1] #shortcut[1] is the image url
                        type_to_add = shortcut[3] #shortcut[3] is the type extension
                        files.append({"url": file_to_add, "type": "image/" + type_to_add})
                        files = json.dumps(files)

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

                # Send firebase notifications
                await sync_to_async(self.send_notifications)(msg)

            elif message_type == MessageType.SEEN_MESSAGE:
                partitionKey = text_data_json['partitionKey']

                await self.channel_layer.group_send(
                    f"chat_{partitionKey}", {
                        'type': MessageType.SEEN_MESSAGE,
                        'partitionKey': partitionKey,
                        'rowKey':  text_data_json['rowKey'],
                        'seen':  text_data_json['seen'],
                    })
            elif message_type == MessageType.MESSAGE_UPDATE:
                entity = self.table_service.get_entity('Messages', text_data_json['partitionKey'], text_data_json['rowKey'])
                if entity is not None and entity and entity["userId"] != self.userId:
                    # trying to update a message they didn't send (bad human)
                    # just ignore
                    return

                if text_data_json['updateType'] == 'edited':
                    entity["message"] = text_data_json["modification"]
                    self.table_service.merge_entity('Messages', entity)
                elif text_data_json['updateType'] == 'deleted':
                    self.table_service.delete_entity('Messages', text_data_json['partitionKey'], text_data_json['rowKey'])
                else:
                    handleException(
                        sys.exc_info(), "Invalid type: " + str(text_data_json['type']))
                    return
                
                await self.channel_layer.group_send(
                    f"chat_{text_data_json['partitionKey']}",
                    text_data_json
                )
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

    async def user_update(self, event):
        try:
            print("got update")
            await self.send(text_data=json.dumps({
                'type': event['type'],
                'groupId': event['groupId'],
                'userId': event['userId'],
                'user': event['user'] if 'user' in event else None,
                'status': event['status']
            }))
        except Exception:
            handleException(
                sys.exc_info(), "socket receiving message type 'chat_message' from socket_group (channel layer).")

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

    async def message_update(self, event):
        try:
            self.send(text_data=json.dumps(event))
        except Exception:
            handleException(
                sys.exc_info(), "socket receiving message type 'status_update' from socket_group (channel layer).")

    async def status_update(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': event['type'],
                'status': event["status"],
                'userId': event["userId"],
            }))
            if (not event["isResponse"]):
                for groupId in self.groupIds:
                    await self.channel_layer.group_send(f"chat_{groupId}", {
                        'type': MessageType.STATUS_UPDATE,
                        'status': "Online",
                        'userId': self.userId,
                        'isResponse': True
                    })
        except Exception:
            handleException(
                sys.exc_info(), "socket receiving message type 'status_update' from socket_group (channel layer).")
