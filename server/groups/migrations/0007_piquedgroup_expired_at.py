# Generated by Django 3.1.7 on 2021-04-04 03:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('groups', '0006_piquedgroup_created_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='piquedgroup',
            name='expired_at',
            field=models.DateField(null=True, verbose_name='Expiry Date'),
        ),
    ]
