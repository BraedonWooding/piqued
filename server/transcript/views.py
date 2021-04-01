from django.http import HttpResponse
from django.shortcuts import render
from groups.models import PiquedGroup
from rest_framework.decorators import action, api_view
from rest_framework.viewsets import ViewSet


class TranscriptViewSet(ViewSet):
    queryset=PiquedGroup.objects.all()

    @action( detail=False, methods=['post'])
    def upload(self, request):
        uploadedFile = self.request.FILES['transcript']
        return HttpResponse('Successfully uploaded {}'.format(uploadedFile))

