from django.contrib import admin

from .models import PiquedGroup

# Register your models here.

class PiquedGroupInline(admin.StackedInline):
    model = PiquedGroup
    can_delete = False
    verbose_name_plural = 'Extra Data'

class PiquedGroupAdmin(GroupAdmin):
    inlines = (PiquedGroupInline,)
    readonly_fields = ('id', 'users')
    filter_horizontal = ('users',)

admin.site.unregister(Group)
admin.site.register(Group, PiquedGroupAdmin)
