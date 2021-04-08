import firebase_admin
from firebase_admin import credentials, messaging
from user.models import PiquedUser
from user.serializers import PiquedUserSerializer

cred = credentials.Certificate("firebase_notifications/serviceAccountKey.json")
default_app = firebase_admin.initialize_app(cred)

def sendToAllUserDevices(piquedUser, groupname, stringMessage):
    registration_tokens = piquedUser.fcm_tokens.split()
    message = messaging.MulticastMessage(
        data={
            "group" : groupname,
            "message" : stringMessage,
        },
        tokens=registration_tokens,
    )
    response = messaging.send_multicast(message)

    if response.failure_count > 0:
        print('{0} messages failed to send'.format(response.failure_count))
