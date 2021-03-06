
from rest_framework.viewsets import ModelViewSet

from .models import PiquedUser
from .permissions import IsCreatable
from .serializers import PiquedUserSerializer


class UserViewSet(ModelViewSet):
    serializer_class = PiquedUserSerializer
    queryset = PiquedUser.objects.all()
    permission_classes = [IsCreatable]
