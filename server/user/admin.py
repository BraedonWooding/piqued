from django.contrib import admin

from .models import User

# Register your models here.


class UserAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'date_of_birth')

# Register your models here.


admin.site.register(User, UserAdmin)
