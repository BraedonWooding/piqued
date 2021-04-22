import json

import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

BASE_URL = "https://cloud.feedly.com/v3/search/feeds?locale=en_US&count=5&query="

@api_view(['GET'])
def query_feed(request):
    query = request.query_params.get("query")
    raw = requests.get(BASE_URL + query)
    return Response(json.loads(raw.content), content_type="application/json")
