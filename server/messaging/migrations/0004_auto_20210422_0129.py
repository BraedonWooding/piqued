# Generated by Django 3.1.7 on 2021-04-22 01:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messaging', '0003_feed_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feed',
            name='last_updated_at',
            field=models.CharField(max_length=50),
        ),
    ]
