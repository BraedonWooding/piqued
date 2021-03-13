from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin
from django.contrib.auth.models import Group

from .models import PiquedGroup

# Register your models here.

class PiquedGroupInline(admin.StackedInline):
    model = PiquedGroup
    can_delete = False
    verbose_name_plural = 'Extra Data'
    filter_horizontal = ('interests',)

class PiquedGroupAdmin(GroupAdmin):
    inlines = (PiquedGroupInline,)
    readonly_fields = ('id',)

admin.site.unregister(Group)
admin.site.register(Group, PiquedGroupAdmin)
