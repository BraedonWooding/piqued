from django.contrib.auth.models import Group
from django.db import models
from django.db.models.fields import BooleanField, CharField, DateTimeField
from django.db.models.fields.related import ManyToManyField, OneToOneField
from user.models import PiquedUser

# from django.db.models.fields. import BooleanField

# Create your models here.

class PiquedGroup(models.Model):
        # Foreign key for interests

        group: OneToOneField = models.OneToOneField(Group, on_delete = models.CASCADE) # users and permissions

        users: ManyToManyField = models.ManyToManyField(PiquedUser)
        
        #remove perhaps
        # is_course: BooleanField =  models.BooleanField(default = False)

        #perhaps remove -> probs in model
        # DeletedAt: DateTimeField = models.DateTimeField(default = None, blank = True, null = True)
        # ModifiedAt: DateTimeField = models.DateTimeField(auto_now = True)        # update on modification
        # CreatedAt: DateTimeField = models.DateTimeField(auto_now_add = True)    # update on creation


        


