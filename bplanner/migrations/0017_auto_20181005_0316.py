# Generated by Django 2.0.7 on 2018-10-05 00:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bplanner', '0016_businessplansettings_projection_years_list_display'),
    ]

    operations = [
        migrations.AlterField(
            model_name='businessplanfinancialassumptions',
            name='first_financial_year_month',
            field=models.IntegerField(blank=True, default=1, null=True, verbose_name='Month Index of starting operations'),
        ),
    ]
