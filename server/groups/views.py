from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import permissions
from rest_framework.viewsets import ModelViewSet

from .permission import IsCreatable
from .serializers import PiquedGroup, PiquedGroupSerializer

# Create your views here.\

class PiquedGroupViewSet(ModelViewSet):
    serializer_class = PiquedGroupSerializer
    queryset = PiquedGroup.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'group_id'
