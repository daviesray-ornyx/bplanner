__author__ = 'Davies Ray'
from django.forms import ModelForm
from django_summernote.widgets import SummernoteWidget, SummernoteInplaceWidget
from .models import (BusinessPlanTitlePage, BusinessPlanMainContent, BusinessPlanFinancialAssumptions,
                     BusinessPlanFinancialDataInput, BusinessPlanSettings)

class BusinessPlanTitlePageForm(ModelForm):
    class Meta:
        model = BusinessPlanTitlePage
        fields = '__all__'
        exclude = ('date_created', 'date_modified', 'owner', 'title_page')

class BusinessPlanMainContentForm(ModelForm):
    class Meta:
        model = BusinessPlanMainContent
        fields = '__all__'
        exclude = ('date_created', 'date_modified', 'owner', 'title_page')


class BusinessPlanFinancialAssumptionsForm(ModelForm):
    class Meta:
        model = BusinessPlanFinancialAssumptions
        fields = '__all__'
        exclude = ('date_created', 'date_modified', 'owner', 'title_page')

class BusinessPlanFinancialDataInputForm(ModelForm):
    class Meta:
        model = BusinessPlanFinancialDataInput
        fields = '__all__'
        exclude = ('date_created', 'date_modified', 'owner', 'title_page')

class BusinessPlanSettingsForm(ModelForm):
    class Meta:
        model = BusinessPlanSettings
        fields = '__all__'
        exclude = ('date_created', 'date_modified', 'owner', 'title_page')
