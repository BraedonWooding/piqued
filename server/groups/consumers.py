import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth import get_user_model, models

from .models import PiquedGroup, PiquedUser
from .serializers import PiquedGroupSerializer

# User = get_user_model()

# redundant file will push then remove

# class GroupConsumer(WebsocketConsumer):
    
#     def createGroup(self, group_name):     

#         tempgroup = models.Group.objects.create(name=group_name)
#         tempgroup.permissions.set([])
#         tempgroup.save()

#         newPiquedGroup = PiquedGroup.objects.create(is_course=False, group=tempgroup)
#         # newPiquedGroup.group.set(tempgroup)
#         newPiquedGroup.users.add(0)
#         newPiquedGroup.save()

#         #TODO change perms
#         # tempgroup.permissions.set([])
#         # createdGroup = PiquedGroup.objects.create(group=tempgroup, is_course=False)
#             # group = group,          
#             # is_course = False,
#         #TODO: figure out how to add list of things for interests and users
#         # createdGroup.users.set(PiquedUserSerializer.create())

#     def connect(self):
#         self.accept()

#     # def disconnect(self, close_code):
#     #     pass

#     def receive(self, text_data):
#         data = json.loads(text_data)
#         print("group name {}".format(data['message']))
#         self.createGroup(data['message'])
