# Generated by Django 3.1.7 on 2021-04-20 08:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0011_auto_20210418_1609'),
    ]

    operations = [
        migrations.AlterField(
            model_name='piqueduser',
            name='shortcuts',
            field=models.CharField(blank=True, default='[["", "", ""]]', max_length=2000),
        ),
    ]
