from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class Profile(models.Model):
    user = models.ForeignKey(User,related_name='user_profile', verbose_name="User", null=True, on_delete=models.DO_NOTHING)
    usage = models.FloatField(verbose_name='Space Used', null=True, blank=True, default=0)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

class BusinessPlan(models.Model):
    company_name = models.CharField(verbose_name='Company, Business, or Project name', max_length=500, null=False, blank=False, default="")
    tagline = models.CharField(verbose_name='Tagline', max_length=500, null=True, blank=True, default='')
    address = models.CharField(verbose_name='Business address', max_length=500, null=True, blank=True, default='')
    phone_number = models.CharField(verbose_name='Phone Number', max_length=15, null=True, blank=True, default='')
    email = models.CharField(verbose_name='Email', max_length=500, null=True, blank=True, default='')
    website = models.CharField(verbose_name='Website', max_length=500, null=True, blank=True, default='')
    presented_to = models.CharField(verbose_name='Presented to', max_length=500, null=True, blank=True, default='')
    logo = models.ImageField(verbose_name='Logo', upload_to='imgs/', null=True, default='logo_default.png')
    main_content = models.TextField(verbose_name='Main Content', null=True, blank=True, default='')
    financial_assumptions = models.TextField(verbose_name='Financial Assumptions', null=True, blank=True, default='')
    financial_input = models.TextField(verbose_name='Financial Input', null=True, blank=True, default='')

    rpt_pnl = models.TextField(verbose_name='Monthly P&L', null=True, blank=True, default='')
    rpt_amortization = models.TextField(verbose_name='Monthly Amortization', null=True, blank=True, default='')
    rpt_cash_flow = models.TextField(verbose_name='Cash Flow', null=True, blank=True, default='')
    rpt_balance_sheet = models.TextField(verbose_name='Balance Sheet', null=True, blank=True, default='')
    rpt_dashboard = models.TextField(verbose_name='Dashboard', null=True, blank=True, default='')

    size = models.FloatField(verbose_name='Size', null=True, blank=True, default=0)

    date_created = models.DateTimeField(verbose_name='Date Created', blank=True, null=True)
    date_modified = models.DateTimeField(verbose_name='Date Modified', blank=True, null=True)
    owner = models.ForeignKey(User, verbose_name="Business Plan Owner", null=True, on_delete=models.DO_NOTHING) # Ensure this is changed to False on deployment!!

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(BusinessPlan, self).save(*args, **kwargs)

    def __str__(self):
        return self.company_name if self.company_name is not None else 'Missing name Business Plan'

    class Meta:
        verbose_name = "Business Plan"
        verbose_name_plural = "Business Plans"
        ordering = ['-date_modified', '-date_created']


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



