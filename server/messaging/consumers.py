# messaging/consumers.py
import json
from datetime import datetime, timedelta

from asgiref.sync import sync_to_async
from azure.cosmosdb.table.models import Entity
from azure.cosmosdb.table.tableservice import TableService
from channels.generic.websocket import AsyncWebsocketConsumer

account_name = "devstoreaccount1"
account_key = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="


class GroupConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['group_name']
        self.room_group_name = 'chat_%s' % self.group_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        self.table_service = TableService(
            account_name=account_name, account_key=account_key, is_emulated=True)

        # This is the only synchronous call made in this consumer, and it runs upon connection request
        # Performance should not suffer as a result
        self.msgs = await sync_to_async(self.get_history)()

        await self.accept()

        for msg in self.msgs:
            await self.chat_message(msg)

    def get_history(self, msgs_since=datetime.utcnow() - timedelta(days=30)):
        msgs = self.table_service.query_entities(
            'Messages', filter="PartitionKey eq '" + str(self.group_name) + "'")
        return msgs

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        print(text_data)
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        userId = text_data_json['userId']

        msg = {
            # TODO: change the partition key to be the group ID. For now, i'm leaving it as whatever the string in the URI is
            'PartitionKey': str(self.group_name),
            'RowKey': str(int(datetime.utcnow().timestamp() * 10000000)),
            'Message': message,
            'Deleted': 0,
            'UserId': int(userId),
            'Assets': "",
            'ModifiedAt': datetime.utcnow()}
        self.table_service.insert_entity('Messages', msg)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'userId': userId
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'userId': event['userId']
        }))
