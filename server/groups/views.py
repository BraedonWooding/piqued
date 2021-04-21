from asgiref.sync import AsyncToSync
from channels.layers import get_channel_layer
from django.db.models import Count
from django.http import HttpResponse
from rest_framework import filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .serializers import (Group, PiquedGroup, PiquedGroupSerializer,
                          SimplifiedPiquedGroupSerializer,
                          SimplifiedUserSerializer)


class PiquedGroupViewSet(ModelViewSet):
    serializer_class = PiquedGroupSerializer
    queryset = PiquedGroup.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'group_id'
    filter_backends = [filters.SearchFilter, ]
    search_fields = ['group__name']

    @AsyncToSync
    async def send_update(self, group_id, user_id, status):
        print("Sending to " + f"chat_{group_id}")
        await get_channel_layer().group_send(f"chat_{group_id}", {
            'type': 'user_update',
            'groupId': group_id,
            'userId': user_id,
            'status': status
        })

    @action(detail=True, methods=['delete'])
    def remove_user(self, request, group_id):
        piquedGroup = self.get_object()
        userToRemove = self.request.user
        userToRemove.groups.remove(piquedGroup.group.id)
        userToRemove.save()

        self.send_update(piquedGroup.group.id, userToRemove.id, 'deleted')
        return HttpResponse("{} removed from group".format(userToRemove.username))

    @action(detail=True, methods=['put'])
    def add_user(self, request, group_id):
        piquedGroup = self.get_object()
        userToAdd = self.request.user
        userToAdd.groups.add(piquedGroup.group.id)
        userToAdd.save()

        print('adding user..')

        self.send_update(piquedGroup.group.id, userToAdd.id, 'added')

        return HttpResponse("{} added to group".format(userToAdd.username))

    # return all piqued groups the user is not in, in descending order
    @action(detail=False, methods=['get'])
    def popular(self, request):
        popularGroups = PiquedGroup.objects.filter(group__user__isnull=False)
        popularGroups = popularGroups.annotate(num_users=Count('group__user')).filter(num_users__gt=0).order_by('-num_users')
        return Response(SimplifiedPiquedGroupSerializer(list(popularGroups), many=True).data)
