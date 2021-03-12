# messaging/consumers.py
import json
from datetime import datetime, timedelta
from dateutil import tz, parser
import sys
import traceback
from django.conf import settings
from asgiref.sync import sync_to_async
from azure.cosmosdb.table.models import Entity
from azure.cosmosdb.table.tableservice import TableService
from channels.generic.websocket import AsyncWebsocketConsumer

account_name = "devstoreaccount1"
account_key = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="
connection_string = "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10003/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10004/devstoreaccount1;TableEndpoint=http://127.0.0.1:10005/devstoreaccount1;"

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

            #TODO self.table_service = TableService(connection_string = settings.TABLE_STORAGE_CON_STRING)
            self.table_service = TableService(
                account_name=account_name, account_key=account_key, is_emulated=True
            )

            try:
                self.table_service.create_table('Messages')
            except:
                print("Failed to create Messages Table")

            self.msgs = await sync_to_async(self.get_history)()

            await self.accept()

            for msg in self.msgs:
                await self.chat_message(msg)
        except Exception:
            handleException(sys.exc_info(),"connecting to socket.")


    def get_history(self, msgs_since=datetime.utcnow() - timedelta(days=30)):
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
            userId = text_data_json['userId']
            timestamp = datetime.utcnow()

            msg = {
                'PartitionKey': str(self.groupId),
                'RowKey': str(int(timestamp.timestamp() * 10000000)),
                'message': message,
                'deleted': 0,
                'userId': int(userId),
                'assets': "",
                'modifiedAt': timestamp}
            print(msg)
            self.table_service.insert_entity('Messages', msg)

            # Send message to room group
            await self.channel_layer.group_send(
                self.channelGroupName,
                {
                    'type': 'chat_message',
                    'message': message,
                    'userId': userId,
                    'modifiedAt': timestamp
                }
            )
        
        except Exception:
            handleException(sys.exc_info(),"socket recieving data from client.")

    # Receive message from room group
    async def chat_message(self, event):
        try:
            # Send message to WebSocket
            timestamp = event["modifiedAt"]
            from_zone = tz.gettz('UTC')
            to_zone = tz.gettz('Australia/ACT')
            timestamp.replace(tzinfo=from_zone)

            await self.send(text_data=json.dumps({
                'message': event['message'],
                'userId': event['userId'],
                'timestamp': str(timestamp)
            }))
        except Exception:
            handleException(sys.exc_info(),"socket recieving message from socket_group (channel layer).")
