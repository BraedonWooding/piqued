from django.db import models.
from django.contrib.auth.models import Group
from django.db.fields import BooleanField, CharField, DateTimeField
from django.db.models.fields.related.ManyToMany import ManyToMany
# from django.db.models.fields. import BooleanField

from ..user import models as PiquedUserModels
# Create your models here.

class PiquedGroup(models.Model):
        # Foreign key for interests

        group: OneToOneField = models.OneToOneField(Group) # users and permissions

        users: ManyToMany = models.ManyToMany(PiquedUser) # foreign key??
        # one to one relo, with main group

        # TODO add interests
        # interests: ManyToMany = models.ManyToMany(InterestPlaceHolderClass, on_delete = models.CASCADE)
        # TODO add RSS feeds
        # rss_ids: ManyToMany??
        
        is_course: BooleanField =  models.BooleanField(default = False)
        DeletedAt: DateTimeField = models.DateTimeField(default = None, blank = True, null = True)
        ModifiedAt: DateTimeField = models.DateTimeFied(auto_now = True)        # update on modification
        CreatedAt: DateTimeField = models.DateTimeField(auto_now_add = True)    # update on creation

        # group = models.OneToOneField(Group) # users and permissions

        # users = models.ManyToMany(PiquedUser) # foreign key??
        # # one to one relo, with main group

        # # TODO add interests
        # # interests: ManyToMany = models.ManyToMany(InterestPlaceHolderClass, on_delete = models.CASCADE)
        # # TODO add RSS feeds
        # # rss_ids: ManyToMany??
        
        # is_course = models.BooleanField(default = False)
        # DeletedAt = models.DateTimeField(default = None, blank = True, null = True)
        # ModifiedAt = models.DateTimeFied(auto_now = True)        # update on modification
        # CreatedAt = models.DateTimeField(auto_now_add = True)    # update on creation


        


