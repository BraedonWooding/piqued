from django.contrib import admin
from django.contrib.admin.options import BaseModelAdmin, ModelAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Interest


class InterestInline(admin.StackedInline):
    model = Interest
    can_delete = True
    verbose_name_plural = 'Interests'

# Define a new Interest admin
class InterestAdmin(ModelAdmin):
    readonly_fields = ('id',)
    fieldsets = (
        (None, {'fields': ('id', 'name', 'is_course',)}),
    )
    list_display = ('id', 'name', 'is_course')


admin.site.site_header = "Piqued Admin"
admin.site.site_title = "Piqued Admin Portal"
admin.site.index_title = "Welcome to Piqued Admin Portal"
admin.site.register(Interest, InterestAdmin)
