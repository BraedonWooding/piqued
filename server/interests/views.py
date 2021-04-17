from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Interest
from user.models import PiquedUser
from groups.models import PiquedGroup
from .serializers import InterestSerializer
from .graphSerializer import InterestGraphSerializer
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
    try:
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
    except:
        # Meh, if we fail, it's not really the end of the world - it just means something went wrong with the NLP. But let's not crash.
        print("NLP Failure")

    return Response({"status": "success"})

@api_view(['POST'])
def recommendGroups(request):

    # Get user interests
    user = PiquedUser.objects.get(user=request.user)
    interests = user.interests.all()

    # Get all groups with physics as an interest
    grps = PiquedGroup.objects.filter(interests__in=interests)

    # Determine similarity
    similarity = list()
    for g in grps:
        grp_interest = g.interests.all()
        c = grp_interest.intersection(interests).count()
        total = grp_interest.count()
        sim = float(c/total)
        similarity.append((g.id, sim))

    # Sort and return the recommended groups
    similarity.sort(key = lambda x:x[1], reverse=True)
    return Response({"recommended": [i for i,_ in similarity]})

@api_view(['GET'])
def getChessEngine(request):
    return Response({"status": "Checkmate"})
