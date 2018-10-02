from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin

# Register your models here.

from .models import (
    Profile, HelpSection, HelpSubSection, HelpSubSectionExample,
    BusinessPlanTitlePage, BusinessPlanMainContent, BusinessPlanFinancialAssumptions, BusinessPlanFinancialDataInput,
    BusinessPlanSettings, BusinessPlanSample,
    Currency, Month
)

class ProfileAdmin(admin.ModelAdmin):
    pass

class HelpSectionAdmin(admin.ModelAdmin):
    list_display = ('ref_id', 'title')

class HelpSubSectionExampleInline(admin.StackedInline):
    model = HelpSubSectionExample
    extra = 1

class HelpSubSectionAdmin(SummernoteModelAdmin):  # instead of ModelAdmin
    inlines = [HelpSubSectionExampleInline,]

# class HelpSubSectionAdmin(admin.ModelAdmin):
#     inlines = [HelpSubSectionExampleInline,]

class HelpSubSectionExampleAdmin(SummernoteModelAdmin):
    pass

class BusinessPlanTitlePageAdmin(SummernoteModelAdmin):
    pass

class BusinessPlanMainContentAdmin(SummernoteModelAdmin):
    pass

class BusinessPlanFinancialAssumptionsAdmin(SummernoteModelAdmin):
    pass

class BusinessPlanFinancialDataInputAdmin(SummernoteModelAdmin):
    pass

class BusinessPlanSettingsAdmin(SummernoteModelAdmin):
    pass

class BusinessPlanSampleAdmin(SummernoteModelAdmin):
    pass


# class HelpSubSectionExampleAdmin(admin.ModelAdmin):
#     pass

class CurrencyAdmin(admin.ModelAdmin):
    pass

class MonthAdmin(admin.ModelAdmin):
    pass

admin.site.register(Profile, ProfileAdmin)
admin.site.register(HelpSection, HelpSectionAdmin)
admin.site.register(HelpSubSection, HelpSubSectionAdmin)
admin.site.register(HelpSubSectionExample, HelpSubSectionExampleAdmin)
admin.site.register(BusinessPlanTitlePage, BusinessPlanTitlePageAdmin)
admin.site.register(BusinessPlanMainContent, BusinessPlanMainContentAdmin)
admin.site.register(BusinessPlanFinancialAssumptions, BusinessPlanFinancialAssumptionsAdmin)
admin.site.register(BusinessPlanFinancialDataInput, BusinessPlanFinancialDataInputAdmin)
admin.site.register(BusinessPlanSettings, BusinessPlanSettingsAdmin)
admin.site.register(BusinessPlanSample, BusinessPlanSampleAdmin)
admin.site.register(Currency, CurrencyAdmin)
admin.site.register(Month, MonthAdmin)