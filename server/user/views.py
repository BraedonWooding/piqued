
from rest_framework.viewsets import ModelViewSet

from .models import PiquedUser
from .serializers import PiquedUserSerializer


class UserViewSet(ModelViewSet):
    serializer_class = PiquedUserSerializer
    queryset = PiquedUser.objects.all()
