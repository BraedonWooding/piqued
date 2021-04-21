from django.db import models
from django.db.models.fields import BooleanField, CharField
from django.db.models.fields.related import ManyToManyField
from groups.models import PiquedGroup
from src.azure import AzureStorage
from user.models import PiquedUser

from .models import Interest


class Combos(models.Model):
    user: PiquedUser = models.ForeignKey(PiquedUser, null=True, on_delete=models.CASCADE)
    group: PiquedGroup = models.ForeignKey(PiquedGroup, null=True, on_delete=models.CASCADE)
    interest1: Interest = models.ForeignKey(Interest, null=True, blank=True, unique=False, on_delete=models.CASCADE, related_name="interest1")
    interest2: Interest = models.ForeignKey(Interest, null=True, blank=True, unique=False, on_delete=models.CASCADE, related_name="interest2")
    interest3: Interest = models.ForeignKey(Interest, null=True, blank=True, unique=False, on_delete=models.CASCADE, related_name="interest3")

    class Meta:
        index_together = [['interest1','interest2','interest3']]

    def __str__(self):
        return str(self.interest1) + " " + str(self.interest2) + " " + str(self.interest3)
