# Generated by Django 2.0.7 on 2018-07-25 20:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bplanner', '0014_auto_20180725_1421'),
    ]

    operations = [
        migrations.AlterField(
            model_name='businessplan',
            name='name',
            field=models.CharField(blank=True, max_length=500, null=True, verbose_name='Name'),
        ),
    ]
