from rest_framework.viewsets import ModelViewSet

from .models import Interest
from .serializers import InterestGraphSerializer, InterestSerializer


class InterestViewSet(ModelViewSet):
    serializer_class = InterestSerializer
    queryset = Interest.objects.all()
    permission_classes = []

class InterestGraphViewSet(ModelViewSet):
    # everyone can 'add' to the graph and modify stuff they own
    serializer_class = InterestGraphSerializer
    queryset = Interest.objects.all()
