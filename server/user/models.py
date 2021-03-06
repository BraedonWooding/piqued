from django.db import models

# Create your models here.


class User(models.Model):
    first_name = models.TextField(max_length=20)
    last_name = models.TextField(max_length=20)
    email = models.EmailField()
    date_of_birth = models.DateTimeField()

    def _str_(self):
        return self.title
