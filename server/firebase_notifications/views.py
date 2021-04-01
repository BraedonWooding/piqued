from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from user.models import PiquedUser
from user.serializers import PiquedUserSerializer

@api_view(['POST'])
def add_fcm_tokens(request):
    fcm_token = request.data['fcm_token']
    try:
        piquedUser = PiquedUser.objects.all().filter(user=request.user.id).first()
        serialiser = PiquedUserSerializer(piquedUser)
       
        tokens_arr = piquedUser.fcm_tokens.split() # Get existing FCM tokens
        if fcm_token not in tokens_arr: # Avoid duplicates (eg. on page refresh)
            tokens_arr.append(fcm_token)
        new_tokens_string = ' '.join(tokens_arr) # Create new FCM tokens string
        validated_data = {
            "fcm_tokens": new_tokens_string
        }

        serialiser.update(piquedUser, validated_data)
        return Response()
    except e:
        return Response(status=500)

@api_view(['POST'])
def remove_fcm_tokens(request):
    fcm_token = request.data['fcm_token']
    try:
        piquedUser = PiquedUser.objects.all().filter(user=request.user.id).first()
        serialiser = PiquedUserSerializer(piquedUser)
        
        tokens_arr = piquedUser.fcm_tokens.split() # Get existing FCM tokens
        if fcm_token in tokens_arr:
            tokens_arr.remove(fcm_token)
        new_tokens_string = ' '.join(tokens_arr) # Create new FCM tokens string
        validated_data = {
            "fcm_tokens": new_tokens_string
        }

        serialiser.update(piquedUser, validated_data)
        return Response()
    except e:
        return Response(status=500)
