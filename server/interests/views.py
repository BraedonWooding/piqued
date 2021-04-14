import nltk
from django.db.models import Count
from fuzzywuzzy import fuzz, process
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from textblob import TextBlob
from user.models import PiquedUser

from .graph_serializer import InterestGraphSerializer
from .models import Interest
from .serializers import InterestSerializer


class InterestViewSet(ModelViewSet):
    serializer_class = InterestSerializer
    queryset = Interest.objects.all()
    permission_classes = []

class InterestGraphViewSet(ModelViewSet):
    # everyone can 'add' to the graph and modify stuff they own
    serializer_class = InterestGraphSerializer
    queryset = Interest.objects.all()

    @action(detail=False, methods=['get'])
    def popular(self, request):
        user = PiquedUser.objects.get(user_id=self.request.user.id)
        userInterests = user.interests.all()
        popularInterests = Interest.objects.exclude(id__in=userInterests)
        popularInterests = popularInterests.annotate(num_users=Count('users')).order_by('-num_users')
        return Response(InterestSerializer(list(popularInterests), many=True).data)

nltk.download('punkt')
nltk.download('brown')

@api_view(['POST'])
def addInterests(request):
    # Get user model
    user = PiquedUser.objects.get(user_id=request.user.id)
    if not user: return Response(status=403)

    # Get list of interests
    interests = list(Interest.objects.only('name', 'id').all())
    rawInput = request.data["interests"]

    # Extract noun_phrases from the user's joined groups
    try:
        userInterests = []
        for d in rawInput:
            tb = TextBlob(d)
            userInterests.extend(list(tb.noun_phrases))
        
        # Naively iterate through each interest and see if our user is interested.
        # We can expand to do something more sophisticated later
        matches = set()
        for ui in userInterests:
            for i in interests:
                if fuzz.partial_ratio(i.name, ui) > 85:
                    matches.add(i)

        user.interests.set(list(matches))
    except Exception as e:
        # Meh, if we fail, it's not really the end of the world - it just means something went wrong with the NLP. But let's not crash.
        print("NLP Failure: " + str(e))

    return Response({"status": "success"})
