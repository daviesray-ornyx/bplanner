# Generated by Django 2.0.7 on 2018-07-23 16:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bplanner', '0002_auto_20180723_1730'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='help',
            options={'ordering': ['ref_id'], 'verbose_name': 'Help Content', 'verbose_name_plural': 'Help Contents'},
        ),
        migrations.AddField(
            model_name='helpsubsection',
            name='help',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='bplanner.Help', verbose_name='Help'),
        ),
    ]
