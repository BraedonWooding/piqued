# Generated by Django 3.1.7 on 2021-04-02 03:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('groups', '0006_piquedgroup_created_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='piquedgroup',
            name='muted_users',
            field=models.CharField(blank=True, default='', max_length=2000),
        ),
    ]
