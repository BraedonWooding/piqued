# Generated by Django 3.1.7 on 2021-03-17 15:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0004_delete_piquedgroup'),
        ('groups', '0003_auto_20210317_1454'),
    ]

    operations = [
        migrations.AlterField(
            model_name='piquedgroup',
            name='created_by',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='user.piqueduser'),
        ),
    ]
