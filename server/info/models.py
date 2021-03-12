from django.contrib.auth.models import Group, User
from django.db import models


class Course(models.Model):
    course_code = models.CharField(max_length=255, null=False, db_index=True)
    course_name = models.CharField(max_length=255, null=False, db_index=True)
    faculty = models.CharField(max_length=255, blank=True, null=True, default=None)
    school = models.CharField(max_length=255, blank=True, null=True, default=None)
    course_level = models.CharField(max_length=255, blank=True, null=True, default=None)
    terms = models.CharField(max_length=255, blank=True, null=True, default=None)
    desc = models.TextField(blank=True, null=True, default=None)

    def __str__(self):
        return self.course_name

class Program(models.Model):
    program_code = models.CharField(max_length=255, null=False, db_index=True)
    name = models.CharField(max_length=255, null=False, db_index=True)
    faculty = models.CharField(max_length=255, null=True, blank=True, default=None)
    duration_years = models.CharField(max_length=10, null=True, blank=True, default=None)
    desc = models.TextField(null=True, blank=True, default=None)
    
    def __str__(self):
        return self.name
