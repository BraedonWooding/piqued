# Generated by Django 3.1.7 on 2021-04-21 23:33

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('groups', '0009_auto_20210415_1316'),
    ]

    operations = [
        migrations.CreateModel(
            name='Feed',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('feed_id', models.CharField(db_index=True, max_length=2000)),
                ('last_updated_at', models.DateTimeField()),
                ('groups', models.ManyToManyField(related_name='feeds', to='groups.PiquedGroup')),
            ],
        ),
    ]