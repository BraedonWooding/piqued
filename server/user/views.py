
from django.http import HttpResponseForbidden
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import PiquedUser
from .permissions import IsCreatable
from .serializers import PiquedUserSerializer


class UserViewSet(ModelViewSet):
    serializer_class = PiquedUserSerializer
    queryset = PiquedUser.objects.all()
    permission_classes = (IsCreatable,)
    lookup_field = 'user_id'

    def check_permissions(self, req):
        return super().check_permissions(req)

    def retrieve(self, request, *args, **kwargs):
        """
        If provided 'user_id' is "self" then return the current user.
        """
        if kwargs.get('user_id') == 'self':
            user = self.queryset.filter(user=request.user.id)
            if user:
                return Response(self.get_serializer(user.first()).data)
            else:
                return HttpResponseForbidden("You don't have permission to access this")
        return super().retrieve(request, args, kwargs)
