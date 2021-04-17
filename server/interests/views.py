from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Interest
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
def createPopularGroups(request):

    # Get user interests
    user = PiquedUser.objects.get(user=request.user)
    interests = user.interests.all()

    # Get ALL users with at least one overlapping interest
    #usrs = PiquedUser.objects.filter(interests__in = interests)

    # Generate all possible combinations of the users interests (to a cap)
    maxCombinations = 3
    combinationsList = list()
    for i in range(maxCombinations):
        comb = combinations(list(interests), i + 1)
        combinationsList.extend(list(comb))

    # For each interest combination, find out how many users have the same combos
    # This isn't the nicest(or fastest) approach, but its the best I could figure out.
    requiredSimilarUsers = 3
    groupsToMake = []
    for c in combinationsList:
        similarUsers = reduce(lambda qs, pk: qs.filter(interests=pk), c, PiquedUser.objects.all())
        if len(similarUsers) >= requiredSimilarUsers:
            groupsToMake.append(c)

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
            group = Group.objects.create(name=name.title())
            piquedGroup = PiquedGroup.objects.create(
                group=group, created_by=user)
            piquedGroup.interests.set(g)
            user.user.groups.add(piquedGroup.group)

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
