from django.shortcuts import render
from django.http import HttpResponse
from .serializers import PiquedGroupSerializer
# Create your views here.\

def index(request):
    return render(request,'groups/create_group.html')

class PiquedGroupViewSet(ModelViewSet):
    serializer_class = PiquedGroupSerializer
    queryset = PiquedGroup.objects.all()
    permission_classes = [IsCreatable]

