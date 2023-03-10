# Generated by Django 3.1.7 on 2021-03-12 06:02

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course_code', models.CharField(db_index=True, max_length=255)),
                ('course_name', models.CharField(db_index=True, max_length=255)),
                ('faculty', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('school', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('course_level', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('terms', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('desc', models.TextField(blank=True, default=None, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Program',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('program_code', models.CharField(db_index=True, max_length=255)),
                ('name', models.CharField(db_index=True, max_length=255)),
                ('faculty', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('duration_years', models.CharField(blank=True, default=None, max_length=10, null=True)),
                ('desc', models.TextField(blank=True, default=None, null=True)),
            ],
        ),
    ]
