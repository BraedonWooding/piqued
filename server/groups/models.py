from django.contrib.auth.models import Group
from django.db import models
from django.db.models.fields import BooleanField, CharField, DateTimeField
from django.db.models.fields.related import ManyToManyField, OneToOneField
from user.models import PiquedUser


class PiquedGroup(models.Model):
    # Foreign key for interests
    group: OneToOneField = models.OneToOneField(Group, on_delete = models.CASCADE) # users and permissions
    interests: ManyToManyField = models.ManyToManyField(Interest, related_name="groups", blank=True)
