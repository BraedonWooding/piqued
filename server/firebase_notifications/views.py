import json
from datetime import datetime, timedelta, timezone

from django.shortcuts import render
from django.views.decorators.cache import never_cache
from groups.models import PiquedGroup
from groups.serializers import PiquedGroupSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from user.models import PiquedUser
from user.serializers import PiquedUserSerializer


@api_view(['POST'])
@never_cache
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
    except:
        return Response(status=500)

@api_view(['POST'])
@never_cache
def remove_fcm_tokens(request):
    fcm_token = request.data['fcm_token']
    try:
        piquedUser = PiquedUser.objects.all().filter(user=request.user.id).first()        
        tokens_arr = piquedUser.fcm_tokens.split() # Get existing FCM tokens
        if fcm_token in tokens_arr:
            tokens_arr.remove(fcm_token)
        new_tokens_string = ' '.join(tokens_arr) # Create new FCM tokens string
        piquedUser.fcm_tokens = new_tokens_string
        return Response("Token successfully removed")
    except:
        return Response(status=500)
    
@api_view(['POST'])
@never_cache
def mute(request):
    try:
        userId = request.user.id
        groupId = request.data['group_id']
        minutes = request.data['minutes'] # Client sends how many minutes in the future we want to set the expiry for
        expiry = datetime.now(timezone.utc) + timedelta(minutes=minutes)
        group = PiquedGroup.objects.all().filter(group_id=groupId).first()
        # Convert string to dict
        if group.muted_users:
            mutedUsers = json.loads(group.muted_users)
        else:
            mutedUsers = {}
        # Add or update the users mute status
        if minutes < 0: # Negative interval is client's way of telling us to mute indefinitely
            mutedUsers[str(userId)] = -1 # Use negative "timestamp" to represent indefinite
        else:
            mutedUsers[str(userId)] = expiry.timestamp()
        # Convert back to a string and update the model
        mutedUsersString = json.dumps(mutedUsers)
        group.muted_users = mutedUsersString
        group.save()
        return Response()
    except:
        return Response(status=500)

@api_view(['POST'])
@never_cache
def unmute(request):
    try:
        userId = request.user.id
        groupId = request.data['group_id']
        group = PiquedGroup.objects.all().filter(group_id=groupId).first()
        # Convert string to dict
        if group.muted_users:
            mutedUsers = json.loads(group.muted_users)
        else:
            mutedUsers = {}
        # Delete entry
        if str(userId) in mutedUsers:
            del mutedUsers[str(userId)]
        # Convert back to a string and update the model
        mutedUsersString = json.dumps(mutedUsers)
        group.muted_users = mutedUsersString
        group.save()
        return Response()
    except:
        return Response(status=500)
