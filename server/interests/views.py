from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Interest
from user.models import PiquedUser
from .serializers import InterestGraphSerializer, InterestSerializer
from rest_framework.decorators import api_view

from textblob import TextBlob
import nltk
from fuzzywuzzy import fuzz, process


class InterestViewSet(ModelViewSet):
    serializer_class = InterestSerializer
    queryset = Interest.objects.all()
    permission_classes = []

class InterestGraphViewSet(ModelViewSet):
    # everyone can 'add' to the graph and modify stuff they own
    serializer_class = InterestGraphSerializer
    queryset = Interest.objects.all()

@api_view(['POST'])
def addInterests(request):
    nltk.download('punkt')
    nltk.download('brown')

    # Get user model
    userId = request.data["userId"]
    user = PiquedUser.objects.get(user_id=int(userId))

    # Get list of interests
    interests = Interest.objects.all()

    # Extract noun_phrases from the user's joined groups
    userInterests = []
    rawInput = request.data["interests"]
    for d in rawInput:
        tb = TextBlob(d)
        userInterests.extend(list(tb.noun_phrases))
    
    # Naively iterate through each interest and see if our user is interested.
    # We can expand to do something more sophisticated later
    matches = set()
    for i in interests:
        for ui in userInterests:
            if fuzz.partial_ratio(i.name,ui) > 85:
                matches.add(i)

    for i in matches:
        user.interests.add(i)

    return Response({"status": "success"})
