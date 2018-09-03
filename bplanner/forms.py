__author__ = 'Davies Ray'
from django.forms import ModelForm
from django_summernote.widgets import SummernoteWidget, SummernoteInplaceWidget
from .models import (BusinessPlan,)

class BusinessPlanForm(ModelForm):
    class Meta:
        model = BusinessPlan
        fields = ('company_name', 'tagline', 'address', 'phone_number', 'email', 'website', 'presented_to', 'logo',
                  'main_content', 'financial_assumptions', 'financial_input',
                  'rpt_pnl', 'rpt_amortization', 'rpt_cash_flow', 'rpt_balance_sheet', 'rpt_dashboard')




