import uuid

from rest_framework.decorators import api_view
from rest_framework.response import Response
from src.azure import AzureStorage

container_name = "assets"

# Create your views here.
@api_view(['POST'])
def upload(request):
    group_id = request.data['group_id']
    blob = AzureStorage(container_name)

    file_to_upload = request.data['file']
    filename = file_to_upload.name
    unique_filename = str(uuid.uuid4()) + ":" + filename
    public_url = blob.upload_content(f"{group_id}/{unique_filename}", file_to_upload, file_to_upload.content_type, filename)

    return Response({"url": public_url, "type": file_to_upload.content_type})

@api_view(['POST'])
def shortcutUpload(request):
    group_id = "shortcuts"
    blob = AzureStorage(container_name)

    file_to_upload = request.data['file']
    filename = file_to_upload.name
    unique_filename = str(uuid.uuid4()) + ":" + filename
    public_url = blob.upload_content(f"{group_id}/{unique_filename}", file_to_upload, file_to_upload.content_type, filename)

    return Response({"url": public_url, "type": file_to_upload.content_type})
