# Generated by Django 3.1.7 on 2021-03-08 14:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import src.azure


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='PiquedUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_of_birth', models.DateField(verbose_name='Date of Birth')),
                ('profile_picture', models.ImageField(blank=True, default=None, null=True, storage=src.azure.AzureStorage(container='user'), upload_to='profiles')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PiquedGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('group', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='auth.group')),
            ],
        ),
    ]
