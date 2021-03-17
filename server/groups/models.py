from django.contrib.auth.models import Group, User
from django.db import models
from django.db.models.fields import CharField
from django.db.models.fields.related import ManyToManyField, OneToOneField
from interests.models import Interest
from user.models import PiquedUser


class PiquedGroup(models.Model):
    # Foreign key for interests
    group: OneToOneField = models.OneToOneField(
        Group, related_name="piqued_group", on_delete=models.CASCADE)  # users and permissions
    interests: ManyToManyField = models.ManyToManyField(
        Interest, related_name="groups", blank=True)
    created_by = models.ForeignKey(
        PiquedUser, on_delete=models.SET_NULL, related_name="groups_created", null=True, blank=True)

    def __str__(self):
        return self.user.__str__()
