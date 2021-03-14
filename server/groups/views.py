from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

from .permission import IsCreatable
from .serializers import PiquedGroup, PiquedGroupSerializer

# Create your views here.\

class PiquedGroupViewSet(ModelViewSet):
    serializer_class = PiquedGroupSerializer
    queryset = PiquedGroup.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'group_id'

    @action(detail=True, methods=['delete'])
    def remove_user(self, request, group_id):
        piquedGroup = self.get_object()
        userToRemove = self.request.user
        userToRemove.groups.remove(piquedGroup.group.id)
        userToRemove.save()
        return HttpResponse("{} removed from group".format(userToRemove.username))      
