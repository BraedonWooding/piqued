from django.contrib.auth.models import User
from django.db import models
from django.db.models.fields import DateField
from django.db.models.fields.files import ImageField
from django.db.models.fields.related import OneToOneField
from src.azure import AzureStorage


class PiquedUser(models.Model):
    user: OneToOneField = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth: DateField = models.DateField("Date of Birth")
    profile_picture: ImageField = models.ImageField(upload_to="profiles", storage=AzureStorage(container="user"), default=None, blank=True, null=True)
