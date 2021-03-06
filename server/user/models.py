from django.db import models

# Create your models here.


class User(models.Model):
    first_name = models.TextField(max_length=20)
    last_name = models.TextField(max_length=20)
    email = models.EmailField()
    date_of_birth = models.DateField()
    password = models.CharField(default=None, max_length=100)

    def _str_(self):
        return self.title
