import json

from django.contrib.auth.models import User
from django.db import models
from django.db.models.fields import DateField
from django.db.models.fields.files import ImageField
from django.db.models.fields.related import (ForeignKey, ManyToManyField,
                                             OneToOneField)
from groups.models import PiquedGroup
from info.models import Course, Program
from interests.models import Interest
from src.azure import AzureStorage


class Feed(models.Model):
    groups = models.ManyToManyField(PiquedGroup, related_name='feeds')
    feed_id = models.CharField(max_length=2000, db_index=True)
    last_updated_at = models.CharField(max_length=50)
    image_url = models.CharField(max_length=2000, null=True)
    name = models.CharField(max_length=200, null=True)

    def __str__(self):
        return self.user.__str__()
