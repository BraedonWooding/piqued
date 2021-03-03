from django.shortcuts import render

# Home page for groups (probably not necessary)
def index(request):
    return render(request, 'messaging/index.html')

# Group page
def group(request, group_name):
    print("TESTING\n\n")
    return render(request, 'messaging/group.html', {
        'group_name': group_name
    })