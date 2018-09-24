from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from bplanner.choices import  *

# Create your models here.

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
    logo = models.ImageField(verbose_name='Logo', upload_to='imgs/', null=True, blank=True, default='logo_default.png')

    size = models.FloatField(verbose_name='Size', null=True, blank=True, default=0) # Store size of page
    bplan_size = models.FloatField(verbose_name='Size', null=True, blank=True, default=0) # Store size of the entire business plan

    date_created = models.DateTimeField(verbose_name='Date Created', blank=True, null=True)
    date_modified = models.DateTimeField(verbose_name='Date Modified', blank=True, null=True)
    owner = models.ForeignKey(User, verbose_name="Business Plan Owner", null=True, blank=True, on_delete=models.DO_NOTHING) # Ensure this is changed to False on deployment!!

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
    first_financial_year_month = models.CharField(verbose_name='Month of starting operations', max_length=500, null=True, blank=True)
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


    def __str__(self):
        return self.title_page.company_name + ' settings' if self.title_page is not None else 'Unnamed Business Plan settings'

    class Meta:
        verbose_name = "Business Plan Settings"
        verbose_name_plural = "Business Plans Settings"
        ordering = ['-id']

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



