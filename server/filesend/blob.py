import os, uuid
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, __version__, AccessPolicy, ContainerSasPermissions
from datetime import datetime, timedelta
from azure.core.exceptions import ResourceExistsError

# Encapsulating the functionality for blob manipulation
# Used extensively by views.py

class Blob:
    def __init__(self, connect_str, container_name):
        self.container_name = container_name
        # Create the BlobServiceClient object which will be used to create a container client
        self.blob_service_client = BlobServiceClient.from_connection_string(connect_str)

        try:
            # public_access="container" makes this container publicly accessible
            print("ISSUE 1")
            self.container_client = self.blob_service_client.create_container(container_name, public_access="container")
        except ResourceExistsError:
            print("ISSUE 2")
            self.container_client = self.blob_service_client.get_container_client(container_name)
        print("ISSUE 3")
    
    def create_blob_client(self, filename, group_name):
        unique_filename = str(uuid.uuid4()) + filename # do something here to make it unique. Not sure if this is necessary
        # Group name used to create virtual folder structure in blob storage
        self.blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=group_name + "/" + unique_filename)
    
    def upload_file(self, file_to_upload):
        self.blob_client.upload_blob(file_to_upload)
    
    def list_blobs(self):
        # List the blobs in the container
        blob_list = self.container_client.list_blobs()
        for blob in blob_list:
            print("\t" + blob.name)
    
    def download_blob(download_location):
        with open(download_location, "wb") as download_file:
            download_file.write(self.blob_client.download_blob().readall())

    def delete_container(self): # this logic probably won't exist in this class, but just for easy cleaning in dev
        self.container_client.delete_container()

    def get_blob_client_url(self):
        return self.blob_client.url