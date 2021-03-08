from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
from .models import PiquedGroup

class GroupConsumer(WebsocketConsumer):
    
    def createGroup(self, group_name):
        createdGroup = PiquedGroup.objects.create(
            name = group_name
            # TODO
            # users -> default join creator
            # interests
            # rss feeds
        )

    


