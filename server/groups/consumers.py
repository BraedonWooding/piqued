from django.contrib.auth import get_user_model,models
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
from .models import PiquedGroup, PiquedUser

User = get_user_model()

class GroupConsumer(WebsocketConsumer):
    
    def createGroup(self, group_name):
        # group = models.Group.objects.create(name = group_name)
        #TODO change perms
        # group.permissions.set([])
        createdGroup = PiquedGroup.objects.create( )
            # group = group,          
            # is_course = False,
        #TODO: figure out how to add list of things for interests and users
        createdGroup.users.set(User)
        createdGroup.save()

    def connect(self):
        self.accept()

    # def disconnect(self, close_code):
    #     pass

    def receive(self, text_data):
        data = json.loads(text_data)
        print("group name {}".format(data['message']))
        self.createGroup(data['message'])

    


