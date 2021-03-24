# messaging/consumers.py
import json
import sys
import traceback
from datetime import datetime, timezone

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from user.models import PiquedUser


def handleException(e, loc):
    exc_type = e[0]
    exc_value = e[1]
    exc_tb = e[2]
    print("\n\n--------\nError in " + loc + "\n" + str(exc_value) + "\nTraceback: " + str(traceback.format_exception(exc_type, exc_value, exc_tb)))

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.userId = self.scope['url_route']['kwargs']['userId']
            groups = await database_sync_to_async(self.getGroups)()

            for group in groups:
                channelGroupName = 'notification_group_%s' % group.id

                # Join channel group for each group user is in
                await self.channel_layer.group_add(
                    channelGroupName,
                    self.channel_name
                )
        except Exception:
            handleException(sys.exc_info(),"connecting to socket.")

    def getGroups(self):
        piquedUser =  PiquedUser.objects.get(user_id=self.userId)
        return list(piquedUser.user.groups.all())

    async def disconnect(self, close_code):
        groups = await database_sync_to_async(self.getGroups)()

        for group in groups:
            channelGroupName = 'notification_group_%s' % group.id

            # Leave channel group for each group user is in
            await self.channel_layer.group_discard(
                channelGroupName,
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

            # # Send message to room group
            # await self.channel_layer.group_send(
            #     self.channelGroupName,
            #     {
            #         'type': 'chat_message',
            #         'message': message,
            #         'files': files,
            #         'userId': userId,
            #         'createdAt': timestamp.astimezone(),
            #         'PartitionKey':  str(self.groupId),
            #         'RowKey': rowKey,
            #         'seen': str(self.userId) + " "
            #     }
            # )
        except Exception:
            handleException(sys.exc_info(),"socket receiving data from client.")

    # Receive message from room group
    async def chat_message(self, event):
        try:
            pass
            # # Send message to WebSocket
            # await self.send(text_data=json.dumps({
            #     'message': event['message'],
            #     'files': event['files'],
            #     'userId': event['userId'],
            #     'timestamp': str(event["createdAt"]),
            #     'partitionKey': event["PartitionKey"],
            #     'rowKey': event["RowKey"],
            # }))
        except Exception:
            handleException(sys.exc_info(),"socket recieving message from socket_group (channel layer).")
