# Generated by Django 2.0.7 on 2018-10-04 21:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bplanner', '0015_auto_20181004_2351'),
    ]

    operations = [
        migrations.AddField(
            model_name='businessplansettings',
            name='projection_years_list_display',
            field=models.TextField(blank=True, default='[]', null=True, verbose_name='Projection years list for Display'),
        ),
    ]
