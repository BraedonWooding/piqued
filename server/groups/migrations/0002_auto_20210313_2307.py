# Generated by Django 3.1.7 on 2021-03-13 23:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('interests', '0001_initial'),
        ('groups', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='piquedgroup',
            name='users',
        ),
        migrations.AddField(
            model_name='piquedgroup',
            name='interests',
            field=models.ManyToManyField(blank=True, related_name='groups', to='interests.Interest'),
        ),
    ]