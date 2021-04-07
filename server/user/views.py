
from django.http import HttpResponseForbidden
from groups.serializers import SimplifiedUserSerializer
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import PiquedUser
from .permissions import IsCreatable
from .serializers import PiquedUserSerializer


class UserViewSet(ModelViewSet):
    serializer_class = PiquedUserSerializer
    permission_classes = []
    lookup_field = 'user_id'

    def __init__(self, **kwargs):
        self.kwargs = kwargs

    def check_permissions(self, req):
        return None

    def get_queryset(self):
        group_id = self.kwargs['group_id'] if 'group_id' in self.kwargs \
                else self.request.query_params.get('group_id')

        if group_id == None:
            objs = PiquedUser.objects.all()
        else:
            objs = PiquedUser.objects.filter(user__groups__id__exact=group_id)
        objs = objs.select_related('user', 'program').prefetch_related('user__groups', 'user__groups__user_set', 'courses', 'interests', 'groups_created')
        return objs

    def retrieve(self, request, *args, **kwargs):
        """
        If provided 'user_id' is "self" then return the current user.
        """
        if kwargs.get('user_id') == 'self':
            user = self.get_queryset().get(user=request.user.id)
            if user:
                return Response(PiquedUserSerializer(user).data)
            else:
                return HttpResponseForbidden("You don't have permission to access this")
        return super().retrieve(request, args, kwargs)
