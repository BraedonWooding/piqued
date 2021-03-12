from django.contrib.auth.models import Group, User
from django.db import models
from django.db.models.fields import BooleanField, CharField, DateField
from django.db.models.fields.files import ImageField
from django.db.models.fields.related import (ForeignKey, ManyToManyField,
                                             OneToOneField)
from info.models import Course, Program
from interests.models import Interest
from src.azure import AzureStorage


class PiquedGroup(models.Model):
    group: OneToOneField = models.OneToOneField(Group, on_delete=models.CASCADE)
    interests: ManyToManyField = models.ManyToManyField(Interest, related_name="groups", blank=True)

class PiquedUser(models.Model):
    user: OneToOneField = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth: DateField = models.DateField("Date of Birth")
    profile_picture: ImageField = models.ImageField(upload_to="profiles", storage=AzureStorage(container="user"), default=None, blank=True, null=True)
    interests: ManyToManyField = models.ManyToManyField(Interest, related_name='users', blank=True)
    courses: ManyToManyField = models.ManyToManyField(Course, related_name='users', blank=True)
    program: ForeignKey = models.ForeignKey(Program, related_name='users', on_delete=models.CASCADE, null=True, default=None, blank=True)
    
    def __str__(self):
        return self.user.__str__()
