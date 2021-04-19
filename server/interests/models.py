from django.db import models
from django.db.models.fields import BooleanField, CharField


class Interest(models.Model):
    name: CharField = models.CharField(
        max_length=255, null=False, db_index=True)
    is_course: BooleanField = models.BooleanField(default=False, null=False)

    def __str__(self):
        return self.name
