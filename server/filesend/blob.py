import os, uuid
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, __version__, AccessPolicy, ContainerSasPermissions
from datetime import datetime, timedelta
from azure.core.exceptions import ResourceExistsError

# Encapsulating the functionality for blob manipulation
# Used extensively by views.py

class Blob:
    def __init__(self, connect_str, group_name):
        # Create the BlobServiceClient object which will be used to create a container client
        self.blob_service_client = BlobServiceClient.from_connection_string(connect_str)

        # Create or get the container
        # group_name should be unique and hence appropriate to use for the container name
        # Each group will have its own container
        self.container_name = container_name = str(uuid.uuid4()) # Should incorporate group_name if possible
        try:
            # public_access="container" makes this container publicly accessible
            self.container_client = self.blob_service_client.create_container(self.container_name, public_access="container")
        except ResourceExistsError:
            self.container_client = self.blob_service_client.get_container_client(self.container_name)
    
    def create_blob_client(self, filename):
        unique_filename = filename # do something here to make it unique
        self.blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=unique_filename)
    
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