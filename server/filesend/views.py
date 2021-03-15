from rest_framework.decorators import api_view
from rest_framework.response import Response
from .blob import Blob
import uuid

container_name = "piqued-files-comp3900"

# Create your views here.
@api_view(['POST'])
def upload(request):
    # Create our blob_obj for most of the logic
    # Assume we have set the environment variable
    group_name = "Something_hardcoded_for_now"
    blob_obj = Blob(container_name)

    # Create blob client which is associated with the specific file/blob
    file_to_upload = request.data['file']
    filename = file_to_upload.name
    blob_obj.create_blob_client(filename, group_name)

    # Upload the file to blob storage
    blob_obj.upload_file(file_to_upload)

    # Retrieve the (public) url such that the file (image) can be displayed
    url = blob_obj.get_blob_client_url()

    # Pass the url to the fileSend/image.html view
    return Response({"url": url})
