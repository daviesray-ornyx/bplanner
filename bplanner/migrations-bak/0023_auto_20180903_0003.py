# Generated by Django 2.0.7 on 2018-09-02 21:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bplanner', '0022_auto_20180902_1955'),
    ]

    operations = [
        migrations.AddField(
            model_name='businessplan',
            name='rpt_amortization',
            field=models.TextField(blank=True, default='', null=True, verbose_name='Monthly Amortization'),
        ),
        migrations.AddField(
            model_name='businessplan',
            name='rpt_balance_sheet',
            field=models.TextField(blank=True, default='', null=True, verbose_name='Balance Sheet'),
        ),
        migrations.AddField(
            model_name='businessplan',
            name='rpt_cash_flow',
            field=models.TextField(blank=True, default='', null=True, verbose_name='Cash Flow'),
        ),
        migrations.AddField(
            model_name='businessplan',
            name='rpt_dashboard',
            field=models.TextField(blank=True, default='', null=True, verbose_name='Dashboard'),
        ),
        migrations.AddField(
            model_name='businessplan',
            name='rpt_pnl',
            field=models.TextField(blank=True, default='', null=True, verbose_name='Monthly P&L'),
        ),
    ]
