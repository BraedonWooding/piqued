# Generated by Django 3.1.7 on 2021-03-06 15:34

from django.db import migrations, models
import src.azure


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='piqueduser',
            name='profile_picture',
            field=models.ImageField(blank=True, default=None, null=True, storage=src.azure.AzureStorage(container='user'), upload_to='profiles'),
        ),
    ]
