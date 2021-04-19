import nltk
from django.db.models import Count
from fuzzywuzzy import fuzz, process
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from textblob import TextBlob
from user.models import PiquedUser
from groups.models import Group, PiquedGroup
from .serializers import InterestSerializer
from .graphSerializer import InterestGraphSerializer
from rest_framework.decorators import api_view
from itertools import combinations
from django.db import models
from functools import reduce
from textblob import TextBlob
import nltk
from fuzzywuzzy import fuzz, process
from wonderwords import RandomWord
import random

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
        popularInterests = Interest.objects.filter(users__isnull=False)
        popularInterests = popularInterests.annotate(num_users=Count('users')).filter(num_users__gt=0).order_by('-num_users')
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

@api_view(['POST'])
def createPopularGroups(request):

    # Get user interests
    user = PiquedUser.objects.get(user=request.user)
    interests = user.interests.all()

    # Get ALL users with at least one overlapping interest
    #usrs = PiquedUser.objects.filter(interests__in = interests)

    # Generate all possible combinations of the users interests (to a cap)
    maxCombinations = 2
    combinationsList = list()
    for i in range(maxCombinations):
        comb = combinations(list(interests), i + 1)
        combinationsList.extend(list(comb))

    # For each interest combination, find out how many users have the same combos
    # This isn't the nicest(or fastest) approach, but its the best I could figure out.
    requiredSimilarUsers = 3
    groupsToMake = []
    print(len(combinationsList))
    for c in combinationsList:
        similarUsers = PiquedUser.objects
        for i in c:
            similarUsers = similarUsers.filter(interests__exact = i)
            #print(i)
        #print(similarUsers.query)
        #similarUsers = PiquedUser.objects.filter(interests__overlap = c)
        #similarUsers = reduce(lambda qs, pk: qs.filter(interests=pk), c, PiquedUser.objects.all())
        print(1)
        if similarUsers.count() >= requiredSimilarUsers:
            groupsToMake.append(c)
            

    return Response()

    # For each group that needs making, determine if the group already exists
    for g in groupsToMake:
        initialFilter = PiquedGroup.objects.annotate(cnt=models.Count('interests')).filter(cnt=len(g))
        existingGrps = reduce(lambda qs, pk: qs.filter(interests=pk), g, initialFilter)
        if len(existingGrps) == 0:

            # Generate a creative name
            r = RandomWord()
            name = ""
            first = True
            for intrst in g:
                if not first: 
                    name = name + "and "
                for _ in range(random.randint(1,2)):
                    name = name + r.word(include_parts_of_speech=["adjectives"]) + " "
                name += str(intrst) + " "
                first = False

            # Avoid any weird issues
            if name == "":
                continue

            # Create the group
            #group = Group.objects.create(name=name.title())
            #piquedGroup = PiquedGroup.objects.create(
            #    group=group, created_by=user)
            #piquedGroup.interests.set(g)
            #user.user.groups.add(piquedGroup.group)

    return Response()


@api_view(['POST'])
def recommendGroups(request):

    # Get user interests
    user = PiquedUser.objects.get(user=request.user)
    interests = user.interests.all()

    # Get all groups with physics as an interest
    grps = PiquedGroup.objects.filter(interests__in=interests)
    print(grps)

    # Determine similarity
    similarity = set()
    for g in grps:
        print(g)
        grp_interest = g.interests.all()
        c = grp_interest.intersection(interests).count()
        total = grp_interest.count()
        sim = float(c/total)
        similarity.add((g.id, sim))

    # Sort and return the recommended groups
    similarity = list(similarity)
    similarity.sort(key = lambda x:x[1], reverse=True)
    return Response({"recommended": [i for i,_ in similarity]})

@api_view(['GET'])
def getChessEngine(request):
    return Response({"status": "Checkmate"})
