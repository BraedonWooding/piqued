import mimetypes
import os
import urllib.parse
from datetime import datetime

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible

from azure.core.exceptions import ResourceExistsError
from azure.storage.blob import (BlobProperties, BlobServiceClient,
                                ContentSettings)


@deconstructible
class AzureStorage(Storage):
    def __init__(self, container=None):
        self._blob_service = None
        if not container:
            self.container = settings.AZURE_STORAGE_DEFAULT_CONTAINER
        else:
            self.container = container

    @property
    def blob_service(self):
        if self._blob_service != None: return self._blob_service

        self._blob_service = BlobServiceClient(account_url=settings.AZURE_STORAGE_ACCOUNT_URL, credential=settings.AZURE_STORAGE_ACCOUNT_KEY).get_container_client(self.container)
        try:
            # Attempt to create container
            self._blob_service.create_container(public_access='blob')
        except ResourceExistsError:
            pass
        return self._blob_service

    def _open(self, name, mode='rb'):
        data = self.blob_service.get_blob_client(name)
        return ContentFile(data.download_blob().content_as_bytes())

    def _save(self, name, content, content_type=None, nice_name=None):
        if nice_name == None: nice_name = name
        content.open(mode="rb")
        data = content.read()
        if content_type == None: content_type = mimetypes.guess_type(name)[0]

        nice_name = urllib.parse.quote_plus(nice_name)
        name = urllib.parse.quote_plus(name)
        self.blob_service.upload_blob(name, data, overwrite=True, blob_type='BlockBlob', content_settings=ContentSettings(content_type=content_type, content_disposition=f'attachment; filename="{nice_name}"'))
        return name

    def upload_content(self, name, content, content_type=None, nice_name=None):
        self._save(name, content, content_type, nice_name)
        return self.url(urllib.parse.quote_plus(name))

    def download_as_text(self, name, encoding="UTF-8"):
        data = self.blob_service.get_blob_client(name)
        return data.download_blob().content_as_text(encoding=encoding)

    def download_as_binary(self, name):
        data = self.blob_service.get_blob_client(name)
        return data.download_blob().content_as_bytes()

    def delete(self, name):
        self.blob_service.delete_blob(name)

    def exists(self, name):
        try:
            return self.blob_service.get_blob_client(name).exists()
        except:
            return False

    def listdir(self, path):
        dirs = []
        files = []
        blobs = self.blob_service.list_blobs(name_starts_with=(path or None))
        for blob in blobs:
            directory, file_name = os.path.split(blob.name)
            dirs.append(directory)
            files.append(file_name)
        return (dirs, files)

    def _properties(self, name):
        props: BlobProperties = self.blob_service.get_blob_client(name).get_blob_properties()
        return props

    def size(self, name):
        return self._properties(name).size

    def url(self, name):
        return self.blob_service.get_blob_client(name).url

    def modified_time(self, name):
        return datetime.fromtimestamp(self._properties(name).last_modified)
