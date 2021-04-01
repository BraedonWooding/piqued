import firebase_admin
from firebase_admin import credentials
from firebase_admin import messaging
from user.models import PiquedUser
from user.serializers import PiquedUserSerializer

cred = credentials.Certificate("firebase_notifications/serviceAccountKey.json")
default_app = firebase_admin.initialize_app(cred)

def sendToAllUserDevices(piquedUser, groupname, message):
    # Create a list containing up to 500 registration tokens.
    # These registration tokens come from the client FCM SDKs.
    
    registration_tokens = piquedUser.fcm_tokens.split()
    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title="Message in " + groupname,
            body=message,
        ),
        tokens=registration_tokens,
    )
    response = messaging.send_multicast(message)
    # See the BatchResponse reference documentation
    # for the contents of response.
    print('{0} messages failed to send'.format(response.failure_count))