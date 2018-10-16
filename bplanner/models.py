from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from bplanner.choices import  *
from Project import settings
import os

class Profile(models.Model):
    user = models.ForeignKey(User,related_name='user_profile', verbose_name="User", null=True, on_delete=models.DO_NOTHING)
    usage = models.FloatField(verbose_name='Space Used', null=True, blank=True, default=0)

    def get_usage(self):
        return round(self.usage/1000000, 4)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

class BusinessPlanTitlePage(models.Model):
    company_name = models.CharField(verbose_name='Company, Business, or Project name', max_length=500, null=True, blank=True, default="")
    tagline = models.CharField(verbose_name='Tagline', max_length=500, null=True, blank=True, default='')
    address = models.CharField(verbose_name='Business address', max_length=500, null=True, blank=True, default='')
    phone_number = models.CharField(verbose_name='Phone Number', max_length=15, null=True, blank=True, default='')
    email = models.CharField(verbose_name='Email', max_length=500, null=True, blank=True, default='')
    website = models.CharField(verbose_name='Website', max_length=500, null=True, blank=True, default='')
    presented_to = models.CharField(verbose_name='Presented to', max_length=500, null=True, blank=True, default='')
    logo = models.TextField(verbose_name='Logo', null=True, blank=True, default='data:image/png;base64,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')

    size = models.FloatField(verbose_name='Size', null=True, blank=True, default=0) # Store size of page
    bplan_size = models.FloatField(verbose_name='Size', null=True, blank=True, default=0) # Store size of the entire business plan

    date_created = models.DateTimeField(verbose_name='Date Created', blank=True, null=True)
    date_modified = models.DateTimeField(verbose_name='Date Modified', blank=True, null=True)
    owner = models.ForeignKey(User, verbose_name="Business Plan Owner", null=True, blank=True, on_delete=models.DO_NOTHING) # Ensure this is changed to False on deployment!!

    def get_static_root(self):
        print(settings.MEDIA_ROOT)
        print(self.logo.url)
        print(os.path.join(settings.MEDIA_ROOT, self.logo.name))
        return os.path.join(settings.MEDIA_ROOT, self.logo.name)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(BusinessPlanTitlePage, self).save(*args, **kwargs)

    def __str__(self):
        return self.company_name if self.company_name is not None else 'Missing name Business Plan'

    class Meta:
        verbose_name = "Business Plan Title Page"
        verbose_name_plural = "Business Plans Title Page"
        ordering = ['-date_modified', '-date_created']

class BusinessPlanMainContent(models.Model):
    title_page = models.ForeignKey(BusinessPlanTitlePage, verbose_name="Business Plan Title Page", null=True, on_delete=models.CASCADE)
    mission_vision = models.TextField(verbose_name='Mission and Vision', null=True, blank=True, default='')
    executive_summary = models.TextField(verbose_name='Executive Summary', null=True, blank=True, default='')
    company_description = models.TextField(verbose_name='Company Description', null=True, blank=True, default='')
    key_success_factors = models.TextField(verbose_name='Key Success Factors', null=True, blank=True, default='')
    objectives = models.TextField(verbose_name='Objectives', null=True, blank=True, default='')
    industry_analysis = models.TextField(verbose_name='Industry Analysis', null=True, blank=True, default='')
    tam_sam_som_analysis = models.TextField(verbose_name='TAM-SAM-SOM Analysis', null=True, blank=True, default='')
    swot_analysis = models.TextField(verbose_name='SWOT Analysis', null=True, blank=True, default='')
    insights = models.TextField(verbose_name='Insights', null=True, blank=True, default='')
    marketing_plan = models.TextField(verbose_name='Marketing Plan', null=True, blank=True, default='')
    ownership_and_management_plan = models.TextField(verbose_name='Ownership and Management Plan', null=True, blank=True, default='')
    milestones = models.TextField(verbose_name='Milestones', null=True, blank=True, default='')

    size = models.FloatField(verbose_name='Size', null=True, blank=True, default=0) # Store size of page

    date_created = models.DateTimeField(verbose_name='Date Created', blank=True, null=True)
    date_modified = models.DateTimeField(verbose_name='Date Modified', blank=True, null=True)
    owner = models.ForeignKey(User, verbose_name="Business Plan Owner", null=True, blank=True, on_delete=models.DO_NOTHING) # Ensure this is changed to False on deployment!!

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(BusinessPlanMainContent, self).save(*args, **kwargs)

    def __str__(self):
        return self.title_page.company_name if self.title_page is not None else 'Missing name Business Plan'

    class Meta:
        verbose_name = "Business Plan Main Content"
        verbose_name_plural = "Business Plans Main Content"
        ordering = ['-date_modified', '-date_created']

class BusinessPlanFinancialAssumptions(models.Model):
    title_page = models.ForeignKey(BusinessPlanTitlePage, verbose_name="Business Plan Title Page", null=True, on_delete=models.CASCADE)
    currency = models.IntegerField(choices=CURRENCY_CHOICES, verbose_name='Currency', default=0)
    first_financial_year = models.IntegerField(verbose_name='First Financial Year', null=True, blank=True)
    first_financial_year_month = models.IntegerField(verbose_name='Month Index of starting operations', null=False, blank=False, default=1)
    projection_years = models.IntegerField(verbose_name='Period of Projections in Years', null=True, blank=True)
    offerings_products_or_services = models.IntegerField(choices=OFFERING_CHOICES, verbose_name='Products/Services', default=0)
    number_of_products_or_services = models.IntegerField(verbose_name='Number of Products or Services Offered ', null=True, blank=True)
    product_services_table = models.TextField(verbose_name='Products or Services Offered Table', null=True, blank=True, default='')
    count_of_months_in_financial_year = models.IntegerField(verbose_name='Number of Months in Projection Year', null=True, blank=True, default=12)
    inflation_rate = models.IntegerField(verbose_name='Inflation Rate (Per Annum)', null=True, blank=True)
    salary_growth_rate = models.IntegerField(verbose_name='Salary Growth Rate (Per Annum)', null=True, blank=True)
    amortization_period = models.IntegerField(verbose_name='Startup Cost Amortization Period (in Years) ', null=True, blank=True)
    trade_receivables = models.IntegerField(verbose_name='Trade Receivables (period in months)', null=True, blank=True)
    trade_payables = models.IntegerField(verbose_name='Trade Payables (period in months)', null=True, blank=True)
    other_expenses_payables = models.IntegerField(verbose_name='Other Expenses Payable', null=True, blank=True)
    bad_debts = models.FloatField(verbose_name='Bad Debts (% of revenue)', null=True, blank=True, default=None)
    taxation_system = models.IntegerField(choices=TAXATION_SYSTEM_CHOICES, verbose_name='Taxation System', default=0)
    corporate_tax_rate = models.IntegerField(verbose_name='Corporate Tax Rate ', null=True, blank=True, default=20)
    tax_slabs_table = models.TextField(verbose_name='Tax Slabs', null=True, blank=True)


    size = models.FloatField(verbose_name='Size', null=True, blank=True, default=0) # Store size of page

    date_created = models.DateTimeField(verbose_name='Date Created', blank=True, null=True)
    date_modified = models.DateTimeField(verbose_name='Date Modified', blank=True, null=True)
    owner = models.ForeignKey(User, verbose_name="Business Plan Owner", null=True, on_delete=models.DO_NOTHING) # Ensure this is changed to False on deployment!!

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(BusinessPlanFinancialAssumptions, self).save(*args, **kwargs)

    def __str__(self):
        return self.title_page.company_name if self.title_page is not None else 'Missing name Business Plan'

    class Meta:
        verbose_name = "Business Plan FinancialAssumptions"
        verbose_name_plural = "Business Plans FinancialAssumptions"
        ordering = ['-date_modified', '-date_created']

class BusinessPlanFinancialDataInput(models.Model):
    title_page = models.ForeignKey(BusinessPlanTitlePage, verbose_name="Business Plan Title Page", null=True, on_delete=models.CASCADE)
    financial_input = models.TextField(verbose_name='Financial Input', null=True, blank=True, default='')

    size = models.FloatField(verbose_name='Size', null=True, blank=True, default=0) # Store size of page

    date_created = models.DateTimeField(verbose_name='Date Created', blank=True, null=True)
    date_modified = models.DateTimeField(verbose_name='Date Modified', blank=True, null=True)
    owner = models.ForeignKey(User, verbose_name="Business Plan Owner", null=True, on_delete=models.DO_NOTHING) # Ensure this is changed to False on deployment!!

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(BusinessPlanFinancialDataInput, self).save(*args, **kwargs)

    def __str__(self):
        return self.title_page.company_name if self.title_page is not None else 'Missing name Business Plan'

    class Meta:
        verbose_name = "Business Plan Financial Data Input"
        verbose_name_plural = "Business Plans Financial Data Input"
        ordering = ['-date_modified', '-date_created']

class BusinessPlanSettings(models.Model):
    title_page = models.ForeignKey(BusinessPlanTitlePage, verbose_name="Business Plan Title Page", null=True, on_delete=models.CASCADE)
    step_monitor = models.TextField(verbose_name='Step Monitor', null=True, blank=True, default='')

    calendar_months = models.TextField(verbose_name='Step Monitor', null=True, blank=True, default='')
    projection_months_list = models.TextField(verbose_name='Step Monitor', null=True, blank=True, default='')
    projection_years = models.IntegerField(verbose_name='Number of projection years', null=True, blank=True, default=0)
    first_financial_year = models.IntegerField(verbose_name='First Financial Year', null=True, blank=True, default=2018)
    last_financial_year = models.IntegerField(verbose_name='Last Financial Year', null=True, blank=True)
    count_of_months_in_financial_year = models.IntegerField(verbose_name='Count of months in a financial year', null=True, blank=True, default=12)
    projection_years_list = models.TextField(verbose_name='Projection years list', null=True, blank=True, default='[]')
    projection_years_list_display = models.TextField(verbose_name='Projection years list for Display', null=True, blank=True, default='[]')
    product_count = models.IntegerField(verbose_name='Products/Services count', null=True, blank=True)
    products = models.TextField(verbose_name='Step Monitor', null=True, blank=True, default='')
    theme = models.TextField(verbose_name='Theme', null=True, blank=True, default='')
    cost_appropriation_methods = models.TextField(verbose_name='Cost Appropriation Methods', null=True, blank=True, default='')
    operating_cost_list = models.TextField(verbose_name='Operating Costs List', null=True, blank=True, default='')
    employees_list = models.TextField(verbose_name='Employees List', null=True, blank=True, default='')
    capital_sources_list = models.TextField(verbose_name='Capital Sources List', null=True, blank=True, default='')
    tangible_assets_list = models.TextField(verbose_name='Tangible Assets List', null=True, blank=True, default='')
    intangible_assets_list = models.TextField(verbose_name='Intangible Assets List', null=True, blank=True, default='')
    deposit_item_list = models.TextField(verbose_name='Deposit Items List', null=True, blank=True, default='')
    startup_cost_item_list = models.TextField(verbose_name='Startup Cost Items List', null=True, blank=True, default='')
    total_assets = models.TextField(verbose_name='Total Assets', null=True, blank=True, default='')
    total_liabilities = models.TextField(verbose_name='Total Liabilities', null=True, blank=True, default='')
    tangible_assets_balance_total = models.TextField(verbose_name='Tangible Assets Balance Total', null=True, blank=True, default='')
    intangible_assets_balance_total = models.TextField(verbose_name='Intangible Assets Balance Total', null=True, blank=True, default='')
    cashFlow_changes_during_the_year_per_month = models.TextField(verbose_name='Cash Flow Changes During The Year Per Month', null=True, blank=True, default='')
    closing_cash_balance_per_month = models.TextField(verbose_name='Closing Cash Balance Per Month', null=True, blank=True, default='')
    revenue_totals_per_year = models.TextField(verbose_name='Revenue Totals Per Year', null=True, blank=True, default='')
    direct_cost_totals_per_year = models.TextField(verbose_name='Direct Cost Totals Per Year', null=True, blank=True, default='')
    gross_profit = models.TextField(verbose_name='Gross Profit', null=True, blank=True, default='')
    operating_cost_totals_per_year = models.TextField(verbose_name='Operating Cost Totals Per Year', null=True, blank=True, default='')
    eat = models.TextField(verbose_name='EAT', null=True, blank=True, default='')
    net_margin_per_month = models.TextField(verbose_name='Net Margin Per Month', null=True, blank=True, default='')
    month_list_initiated = models.BooleanField(verbose_name='Month List Initiated', null=False, blank=False, default=False)
    year_list_initiated = models.BooleanField(verbose_name='Year List Initiated', null=False, blank=False, default=False)

    def __str__(self):
        return self.title_page.company_name + ' settings' if self.title_page is not None else 'Unnamed Business Plan settings'

    class Meta:
        verbose_name = "Business Plan Settings"
        verbose_name_plural = "Business Plans Settings"
        ordering = ['-id']

class BusinessPlanSample(models.Model):
    title_page = models.ForeignKey(BusinessPlanTitlePage, verbose_name="Business Plan Title Page", null=True, on_delete=models.CASCADE)
    display_name = models.CharField(verbose_name='Display Name', max_length=500, null=True, blank=True)
    business_types = models.IntegerField(choices=BUSINESS_TYPES, verbose_name='Business Type', default=1)

    def ___str__(self):
        return self.display_name

    class Meta:
        verbose_name = "Business Plan Sample"
        verbose_name_plural = "Business Plans Samples"

class HelpSection(models.Model):
    ref_id = models.CharField(max_length=250, verbose_name='Ref Id', null=True, blank=True, default='')
    title = models.CharField(max_length=250, verbose_name='Help Section Title', null=True, blank=True, default='')
    description = models.TextField(verbose_name='Desription', null=True, blank=True, default='')
    # links_and_sources = models.TextField(verbose_name='Links and Sources', null=True, blank=True, default='')

    def __str__(self):
        return  self.title

    class Meta:
        verbose_name = 'Help Section'
        verbose_name_plural = 'Help Sections'
        ordering = ['ref_id']

class HelpSubSection(models.Model):
    help_section = models.ForeignKey(HelpSection, related_name='rel_help_sections', verbose_name='Help Section', null=True, blank=True, on_delete=models.CASCADE)
    title = models.CharField(max_length=250, verbose_name='Help Sub-Section Title', null=True, blank=True, default='')
    instruction = models.TextField(verbose_name='Instruction', null=True, blank=True, default='')


    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Help Sub-Section'
        verbose_name_plural = 'Help Sub-Sections'

class HelpSubSectionExample(models.Model):
    # Examples that can be classified for NGO and Business categories
    help_sub_section = models.ForeignKey(HelpSubSection, related_name='rel_help_sub_section_examples', verbose_name='Help Sub-Section', null=True, blank=True, on_delete=models.CASCADE)
    title = models.CharField(max_length=250, verbose_name='Example Title', null=True, blank=True, default='')
    example = models.TextField(verbose_name='Example', null=True, blank=True, default='')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Help Sub-Section Example'
        verbose_name_plural = 'Help Sub-Section Examples'

class Currency(models.Model):
    # Examples that can be classified for NGO and Business categories
    code = models.CharField(max_length=150, verbose_name='Codes', null=True, blank=True, default='')
    full_name = models.CharField(max_length=250, null=True, blank=True, default='')
    rate_to_dollar = models.FloatField(verbose_name='Rate to Dollar', null=True, blank=True, default=0.00)

    def __str__(self):
        return self.code

    class Meta:
        verbose_name = 'Currency'
        verbose_name_plural = 'Currencies'

class Month(models.Model):
    # Examples that can be classified for NGO and Business categories
    code = models.CharField(max_length=150, verbose_name='Codes', null=True, blank=True, default='')
    full_name = models.CharField(max_length=250, null=True, blank=True, default='')
    order = models.FloatField(verbose_name='Month order', null=True, blank=True, default=0)

    def __str__(self):
        return self.code

    class Meta:
        verbose_name = 'Month'
        verbose_name_plural = 'Months'



