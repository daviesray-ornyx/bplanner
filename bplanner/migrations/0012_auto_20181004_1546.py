# Generated by Django 2.0.7 on 2018-10-04 12:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bplanner', '0011_auto_20181002_1818'),
    ]

    operations = [
        migrations.AlterField(
            model_name='businessplantitlepage',
            name='logo',
            field=models.TextField(blank=True, default='', null=True, verbose_name='Logo'),
        ),
    ]
