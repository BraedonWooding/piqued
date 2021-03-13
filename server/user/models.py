from django.contrib.auth.models import User
from django.db import models
from django.db.models.fields import DateField
from django.db.models.fields.related import OneToOneField


class PiquedUser(models.Model):
    user: OneToOneField = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth: DateField = models.DateField("Date of Birth")
