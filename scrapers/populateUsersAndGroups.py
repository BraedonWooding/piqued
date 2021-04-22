import requests
import json
import names
import random
from wonderwords import RandomWord

url = 'DOMAIN'
finterest = 1033
linterest = 2032

# Get interests
with open('raw_interests.txt') as f:
    interest_list = [line.rstrip() for line in f]

# Bearer token authentication
class BearerAuth(requests.auth.AuthBase):
    def __init__(self, token):
        self.token = token
    def __call__(self, r):
        r.headers["authorization"] = "Bearer " + self.token
        return r

# Get token
path = 'token/'
myobj = {'username':'n.thumiger@student.unsw.edu.au', 'password':'123'}
response_dict = requests.post(url + path, data = myobj).json()
print(response_dict)
token = response_dict["access"]
auth = BearerAuth(token)

# Make a bunch of groups
num_groups = 20
path = 'groups/'
g_id = []
for i in range(num_groups):
    g_interest = random.sample(range(finterest, linterest), random.randint(1,3))
    #g = ""
    #for x in g_interest:
    #    print(x)
    #    print(len(interest_list))
    #    g = g + interest_list[x - finterest] + " "

    # Generate a creative name
    r = RandomWord()
    name = ""
    first = True
    for x in g_interest:
        if not first: 
            name = name + "and "
        for _ in range(random.randint(1,2)):
            name = name + r.word(include_parts_of_speech=["adjectives"]) + " "
        name += str(interest_list[x - finterest]) + " "
        first = False

    # Avoid any weird issues
    if name == "":
        continue
    g = name.title()

    obj = {
        "name":g,
        "interests_id": g_interest
        }
    response = requests.post(url + path, auth=auth, json=obj).json()
    print(response)
    g_id.append(response["id"])
    print("Added [" + str(response["id"]) + "]: " + g)

# Make a bunch of users
num_users = 50
for i in range(num_users):
    path = 'users/'
    fname = names.get_first_name()
    lname = names.get_last_name()
    usr = {
        'first_name': fname,
        'last_name': lname,
        'date_of_birth': "2000-04-04",
        'email': fname + "." + lname + "@unsw.edu.au",
        'password': "123",
        'username': fname + "." + lname + "@unsw.edu.au"
    }
    response_dict = requests.post(url + path, auth=auth, json=usr).json()
    usr_id = response_dict["id"]
    
    path = 'token/'
    myobj = {'username': fname + "." + lname + "@unsw.edu.au", 'password':'123'}
    response_dict = requests.post(url + path, data = myobj).json()
    print(response_dict)
    token = response_dict["access"]
    auth = BearerAuth(token)

    path = 'users/' + str(usr_id) + '/'
    obj = {"interests_id":random.sample(range(finterest, linterest), random.randint(1,10))}
    print("************** ADDING INTERESTS ***************")
    print(obj)
    response = requests.patch(url + path, auth=auth, json=obj)
    print(response.text)
    print("Added: ", fname, lname)


    for gr in range(random.randint(0,10)):
        path = 'groups/' + str(g_id[random.randint(0, len(g_id)-1)]) +'/add_user/'
        print(path)
        response = requests.put(url + path, auth=auth)
        print(response.text)

    
    print("Added: ", fname, lname)