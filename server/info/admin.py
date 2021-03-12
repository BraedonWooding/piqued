from django.contrib import admin
from django.contrib.admin.options import ModelAdmin

from info.models import Course, Program


# Define a new Interest admin
class ProgramAdmin(ModelAdmin):
    readonly_fields = ('id',)
    fieldsets = (
        (None, {'fields': ('id', 'name', 'program_code')}),
        ("Metadata", {'fields': ('faculty', 'duration_years')}),
        ("Description", {'fields': ('desc',)}),
    )
    list_display = ('id', 'name', 'program_code')


class CourseAdmin(ModelAdmin):
    readonly_fields = ('id',)
    fieldsets = (
        (None, {'fields': ('id', 'course_name', 'course_code')}),
        ("Metadata", {'fields': ('faculty', 'school', 'course_level', 'terms')}),
        ("Description", {'fields': ('desc',)}),
    )
    list_display = ('id', 'course_name', 'course_code')


admin.site.site_header = "Piqued Admin"
admin.site.site_title = "Piqued Admin Portal"
admin.site.index_title = "Welcome to Piqued Admin Portal"
admin.site.register(Course, CourseAdmin)
admin.site.register(Program, ProgramAdmin)
