# Generated by Django 3.1.7 on 2021-04-22 00:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messaging', '0002_feed_image_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='feed',
            name='name',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
