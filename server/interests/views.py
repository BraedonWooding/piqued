import random
from functools import reduce
from itertools import combinations

import nltk
from django.db import models
from django.db.models import Count
from fuzzywuzzy import fuzz, process
from groups.models import Group, PiquedGroup
from groups.serializers import PiquedGroupSerializer
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from textblob import TextBlob
from user.models import Combos, PiquedUser
from wonderwords import RandomWord

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

def createPopularGroups(usr):

    # Get user interests
    user = PiquedUser.objects.get(user=usr)
    interests = user.interests.all()

    # Get all the popular user interests
    numRequiredUsers = 3
    a = Combos.objects.all().values('interest1', 'interest2', 'interest3').annotate(total=Count('user')).annotate(totalGroups=Count('group')).filter(total__gt=numRequiredUsers - 1, totalGroups=0)
    print(a)

    # For each group that needs making, determine if the group already exists
    out = []
    for group_to_make in list(a):

        g = []
        g.append(Interest.objects.get(id=int(group_to_make['interest1'])))
        if group_to_make['interest2'] != None:
            g.append(Interest.objects.get(id=int(group_to_make['interest2'])))
        if group_to_make['interest3'] != None:
            g.append(Interest.objects.get(id=int(group_to_make['interest3'])))

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
        
        e = {
            "id": 0,
            "name": name.title(),
            "existing": False,
            "interests": InterestSerializer(list(g), many=True).data
        }
        out.append(e)
        # Create the group
        #group = Group.objects.create(name=name.title())
        #piquedGroup = PiquedGroup.objects.create(
        #    group=group, created_by=user)
        #piquedGroup.interests.set(g)
        #user.user.groups.add(piquedGroup.group)

        # Add it to the master list
        #if len(g) == 1:
        #    combo = Combos.objects.create(interest1=g[0], group=piquedGroup)
        #elif len(g) == 2:
        #    combo = Combos.objects.create(interest1=g[0], interest2=g[1], group=piquedGroup)
        #elif len(g) == 3:
        #    combo = Combos.objects.create(interest1=g[0], interest2=g[1], interest3=g[2], group=piquedGroup)

    return out


@api_view(['POST'])
def recommendGroups(request):

    # Get user interests
    user = PiquedUser.objects.get(user=request.user)
    interests = user.interests.all()

    # Get all groups with physics as an interest
    grps = list(PiquedGroup.objects.filter(interests__in=interests))

    # Determine similarity
    similarity = set()
    for g in grps:
        print(g)
        grp_interest = g.interests.all()
        c = grp_interest.intersection(interests).count()
        total = grp_interest.count()
        sim = float(c/total)
        similarity.add((g, sim))

    # Sort and return the recommended groups
    similarity = list(similarity)
    similarity.sort(key = lambda x:x[1], reverse=True)

    out = createPopularGroups(request.user)
    for s in similarity:
        e = {
            "id": s[0].id,
            "name": str(s[0]),
            "existing": True
        }
        out.append(e)
    print(out)
    return Response(out)

@api_view(['POST'])
def createGroup(request):
    #await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + response.data + "/add_user/");
    #recommendedGroups.splice(index, 1);
    #setRecommendedGroups([...recommendedGroups]);
    
    # Get the ineterests
    print(request.data)
    g = []
    for i in request.data["group"]["interests"]:
        g.append(i["id"])

    # Create the group
    user = PiquedUser.objects.get(user=request.user)
    group = Group.objects.create(name=request.data["group"]["name"])
    piquedGroup = PiquedGroup.objects.create(
        group=group, created_by=user)
    piquedGroup.interests.set(g)
    user.user.groups.add(piquedGroup.group)

    # Add it to the master list
    if len(g) == 1:
        i1 = list(Interest.objects.filter(id=g[0]))[0]
        combo = Combos.objects.create(interest1=i1, group=piquedGroup)
    elif len(g) == 2:
        i1 = list(Interest.objects.filter(id=g[0]))[0]
        i2 = list(Interest.objects.filter(id=g[1]))[0]
        combo = Combos.objects.create(interest1=i1, interest2=i2, group=piquedGroup)
    elif len(g) == 3:
        i1 = list(Interest.objects.filter(id=g[0]))[0]
        i2 = list(Interest.objects.filter(id=g[1]))[0]
        i3 = list(Interest.objects.filter(id=g[2]))[0]
        combo = Combos.objects.create(interest1=i1, interest2=i2, interest3=i3, group=piquedGroup)

    return Response({"id": piquedGroup.group_id})

@api_view(['GET'])
def getChessEngine(request):
    return Response({"status": "Checkmate"})
