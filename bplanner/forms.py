__author__ = 'Davies Ray'
from django.forms import ModelForm
from django_summernote.widgets import SummernoteWidget, SummernoteInplaceWidget
from .models import (BusinessPlanTitlePage, BusinessPlanMainContent, BusinessPlanFinancialAssumptions,
                     BusinessPlanFinancialDataInput, BusinessPlanSettings)

class BusinessPlanTitlePageForm(ModelForm):
    class Meta:
        model = BusinessPlanTitlePage
        fields = ('id', 'company_name', 'tagline', 'address', 'phone_number', 'email', 'website', 'presented_to', 'logo')

class BusinessPlanMainContentForm(ModelForm):
    class Meta:
        model = BusinessPlanMainContent
        fields = ('main_content',)


class BusinessPlanFinancialAssumptionsForm(ModelForm):
    class Meta:
        model = BusinessPlanFinancialAssumptions
        fields = ('currency', 'first_financial_year', 'first_financial_year_month', 'projection_years', 'offerings_products_or_services',
                  'number_of_products_or_services', 'product_services_table', 'count_of_months_in_financial_year', 'inflation_rate',
                  'salary_growth_rate', 'amortization_period', 'trade_receivables','trade_payables', 'other_expenses_payables', 'bad_debts',
                  'taxation_system', 'corporate_tax_rate', 'tax_slabs_table')

class BusinessPlanFinancialDataInputForm(ModelForm):
    class Meta:
        model = BusinessPlanFinancialDataInput
        fields = ('financial_input',)

class BusinessPlanSettingsForm(ModelForm):
    class Meta:
        model = BusinessPlanSettings
        fields = ('step_monitor', 'calendar_months', 'projection_months_list', 'projection_years', 'first_financial_year',
                  'last_financial_year', 'count_of_months_in_financial_year', 'projection_years_list', 'product_count',
                  'products', 'theme', 'cost_appropriation_methods', 'operating_cost_list', 'employees_list', 'capital_sources_list',
                  'tangible_assets_list', 'intangible_assets_list', 'deposit_item_list', 'startup_cost_item_list', 'total_assets',
                  'total_liabilities', 'tangible_assets_balance_total', 'intangible_assets_balance_total', 'cashFlow_changes_during_the_year_per_month',
                  'closing_cash_balance_per_month', 'revenue_totals_per_year', 'direct_cost_totals_per_year', 'gross_profit', 'operating_cost_totals_per_year', 'eat', 'net_margin_per_month')
