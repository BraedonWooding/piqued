from rest_framework.decorators import api_view

connect_str = ""

# Create your views here.
@api_view(['POST'])
def upload(request):
    # Create our blob_obj for most of the logic
    # Assume we have set the environment variable
    group_name = "Something_hardcoded_for_now"
    blob_obj = Blob(connect_str, group_name)

    # Create blob client which is associated with the specific file/blob
    file_to_upload = request.FILES["uploadedfile"]
    filename = file_to_upload.name
    blob_obj.create_blob_client(filename)

    # Upload the file to blob storage
    blob_obj.upload_file(file_to_upload)

    # Retrieve the (public) url such that the file (image) can be displayed
    url = blob_obj.get_blob_client_url()

    # Pass the url to the fileSend/image.html view
    return Response({"url": url})
