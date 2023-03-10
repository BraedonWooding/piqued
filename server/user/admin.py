from django.contrib import admin
from django.contrib.admin.options import BaseModelAdmin, ModelAdmin
from django.contrib.admin.views.main import ChangeList
from django.contrib.auth.admin import GroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group, User

from .models.combos import Combos
from .models.models import PiquedUser


# Define an inline admin descriptor for User model
# which acts a bit like a singleton
class PiquedUserInline(admin.StackedInline):
    model = PiquedUser
    can_delete = False
    verbose_name_plural = 'Extra Data' 
    filter_horizontal = ('interests', 'courses')

# Define a new User admin
class PiquedUserAdmin(BaseUserAdmin):
    inlines = (PiquedUserInline,)
    readonly_fields = ('id',)
    fieldsets = (
        (None, {'fields': ('id', 'email', 'password',)}),
        ('Personal Info', {'fields': ('first_name', 'last_name',)}),
        ('Groups', {'fields': ('groups',)}),
        ('Permissions', {'fields': ('is_active', 'is_superuser')})
    )
    list_display = ('email', 'id', 'first_name', 'last_name')

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, PiquedUserAdmin)
admin.site.register(Combos)

admin.site.site_header = "Piqued Admin"
admin.site.site_title = "Piqued Admin Portal"
admin.site.index_title = "Welcome to Piqued Admin Portal"
