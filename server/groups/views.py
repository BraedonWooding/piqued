from django.db.models import Count
from django.http import HttpResponse
from rest_framework import filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .serializers import (Group, PiquedGroup, PiquedGroupSerializer,
                          SimplifiedPiquedGroupSerializer)


class PiquedGroupViewSet(ModelViewSet):
    serializer_class = PiquedGroupSerializer
    queryset = PiquedGroup.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'group_id'
    filter_backends = [filters.SearchFilter, ]
    search_fields = ['group__name']

    @action(detail=True, methods=['delete'])
    def remove_user(self, request, group_id):
        piquedGroup = self.get_object()
        userToRemove = self.request.user
        userToRemove.groups.remove(piquedGroup.group.id)
        userToRemove.save()
        return HttpResponse("{} removed from group".format(userToRemove.username))

    @action(detail=True, methods=['put'])
    def add_user(self, request, group_id):
        piquedGroup = self.get_object()
        userToAdd = self.request.user
        userToAdd.groups.add(piquedGroup.group.id)
        userToAdd.save()
        return HttpResponse("{} added to group".format(userToAdd.username))

    # return all piqued groups the user is not in, in descending order
    @action(detail=False, methods=['get'])
    def popular(self, request):
        user = self.request.user
        userGroups = user.groups.all()
        popularGroups = PiquedGroup.objects.exclude(group__in=userGroups)
        popularGroups = popularGroups.annotate(num_users=Count('group__user')).order_by('-num_users')
        return Response(SimplifiedPiquedGroupSerializer(list(popularGroups), many=True).data)
