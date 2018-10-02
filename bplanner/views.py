import sys, os
from io import BytesIO
import xhtml2pdf.pisa as pisa
from django.template.loader import get_template
from MySQLdb.converters import NoneType
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.views import View
from bplanner.models import *
from bplanner.forms import (BusinessPlanTitlePageForm, BusinessPlanMainContentForm,
                            BusinessPlanFinancialAssumptionsForm, BusinessPlanFinancialDataInputForm, BusinessPlanSettingsForm,
                            )


# common functions
def get_size(obj, seen=None):
    """Recursively finds size of objects"""
    size = sys.getsizeof(obj)
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return 0
    # Important mark as seen *before* entering recursion to gracefully handle
    # self-referential objects
    seen.add(obj_id)
    if isinstance(obj, dict):
        size += sum([get_size(v, seen) for v in obj.values()])
        size += sum([get_size(k, seen) for k in obj.keys()])
    elif hasattr(obj, '__dict__'):
        size += get_size(obj.__dict__, seen)
    elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
        size += sum([get_size(i, seen) for i in obj])
    return size

def compose_default_settings():
    bplan_settings = BusinessPlanSettings()
    bplan_settings.step_monitor = """{
            '#step-1': {
                'passed' : false,
                'auto_generate': false,
                'validate_steps': [],
                'friendly_name': 'Title page'
            },
            '#step-2': {
                'passed' : false,
                'auto_generate': false,
                'validate_steps': ['#page_title', ],
                'friendly_name': 'Main content page'
            },
            '#step-3': {
                'passed' : false,
                'auto_generate': false,
                'validate_steps': ['#page_title', ],
                'friendly_name': 'Financial assumptions page'
            },
            '#step-4': {
                'passed' : false,
                'auto_generate': true,
                'validate_steps': ['#page_title', '#financial_assumptions'],
                'friendly_name': 'Financial data input page'
            },
            '#step-5': {
                'passed' : false,
                'auto_generate': true,
                'validate_steps': ['#page_title', '#financial_assumptions', '#financial_data_input'],
                'friendly_name': 'Reporting page'
            }
        }"""
    bplan_settings.calendar_months = """{
            'January': {'name': 'January', 'order': 1, 'code': 'Jan', 'next': 'February','previous': 'December' },
            'February': {'name': 'February', 'order': 2, 'code': 'Feb', 'next': 'March', 'previous': 'January'},
            'March': {'name': 'March', 'order': 3, 'code': 'Mar', 'next': 'April', 'previous': 'February'},
            'April': {'name': 'April', 'order': 4, 'code': 'Apr', 'next': 'May', 'previous': 'March'},
            'May': {'name': 'May', 'order': 5, 'code': 'May', 'next': 'June', 'previous': 'April'},
            'June': {'name': 'June', 'order': 6, 'code': 'Jun', 'next': 'July', 'previous': 'May'},
            'July': {'name': 'July', 'order': 7, 'code': 'Jul', 'next': 'August', 'previous': 'June'},
            'August': {'name': 'August', 'order': 8, 'code': 'Aug', 'next': 'September', 'previous': 'July'},
            'September': {'name': 'September', 'order': 9, 'code': 'Sep', 'next': 'October', 'previous': 'August'},
            'October': {'name': 'October', 'order': 10, 'code': 'Oct', 'next': 'November', 'previous': 'September'},
            'November': {'name': 'November', 'order': 11, 'code': 'Nov', 'next': 'December', 'previous': 'October'},
            'December': {'name': 'December', 'order': 12, 'code': 'Dec', 'next': 'January', 'previous': 'November'}
        }"""
    bplan_settings.projection_months_list = """{}"""
    bplan_settings.projection_years = None
    bplan_settings.first_financial_year = 2018
    bplan_settings.last_financial_year = None
    bplan_settings.count_of_months_in_financial_year = 12
    bplan_settings.projection_years_list = """[]"""
    bplan_settings.product_count = None
    bplan_settings.products = """{}"""
    bplan_settings.theme = """{}"""
    bplan_settings.cost_appropriation_methods = """['Per Month', 'Per Annum', '% of Revenue', '% of Employee Salary']"""
    bplan_settings.operating_cost_list = """[
            'Rent and Rates', 'Heat and Light', 'Insurances', 'Marketing/Advertisement', 'Printing & Stationary',
            'Misc. Expenses'
        ]"""
    bplan_settings.employees_list = """[
            'Director', 'Account Manager', 'Additional Account Manager', 'Coordinator', 'Additional Coordinator',
            'Quality Control Manager', 'Marketing Officer', 'Receptionist', 'Human Resource Manager', 'Secretary'
        ]"""
    bplan_settings.capital_sources_list = """['Share Capital', 'Debt', 'Annual Interest Rate', 'Loan Period (In months)']"""
    bplan_settings.tangible_assets_list = """['Computers', 'Printers', 'Furniture and Fixtures', 'Office Equipment', 'Fit Outs']"""
    bplan_settings.intangible_assets_list = """['Website Development', 'Patents & Trademarks']"""
    bplan_settings.deposit_item_list = """['Rental Deposits', 'Other Deposits']"""
    bplan_settings.startup_cost_item_list = """[
            'Legal Expenses', 'Formation Expenses', 'Marketing Costs', 'Utility',
            'Stationery', 'Business Name Registration Cost'
        ]"""
    bplan_settings.total_assets = """{}"""
    bplan_settings.total_liabilities = """{}"""
    bplan_settings.tangible_assets_balance_total = """{}"""
    bplan_settings.intangible_assets_balance_total = """{}"""
    bplan_settings.cashFlow_changes_during_the_year_per_month = """{}"""
    bplan_settings.closing_cash_balance_per_month = """{}"""
    bplan_settings.revenue_totals_per_year = """{}"""
    bplan_settings.direct_cost_totals_per_year = """{}"""
    bplan_settings.gross_profit = """{}"""
    bplan_settings.operating_cost_totals_per_year = """{}"""
    bplan_settings.eat = """{}"""
    bplan_settings.net_margin_per_month = """{}"""
    return bplan_settings

# Create your views here.
class LandingPageView(View):
    """docstring for LandingPageView."""

    def get(self, request):
        return render(request, 'index.html', {'name': "Davies Ray"})


    def post(self, request):
        return render(request, 'index.html', {'name': "Post action"})

class RegisterView(View):
    """docstring for Register."""

    def is_null_or_empty(self, val):
        return val is None or val == ''

    def get(self, request):
        return render(request, 'sign-up.html', {'name': "Davies Ray"})


    def post(self, request):
        email = request.POST.get('email', None)
        password = request.POST.get('password', None)
        confirm_password = request.POST.get('confirmPasswordInput', None)
        if self.is_null_or_empty(email) or self.is_null_or_empty(password) or self.is_null_or_empty(confirm_password):
            return render(request, 'sign-up.html', {'status': 'ERR', 'message': 'Missing required sign up details.'})
        if password != confirm_password:
            return render(request, 'sign-up.html', {'status': 'ERR', 'message': 'Passwords provided do not match.'})
        # everything is good so far.
        # create user
        user, created = User.objects.get_or_create(username=email, email=email)
        if not created: #user exists... show message
            return render(request, 'sign-up.html', {'status': 'ERR', 'message': 'User with {} exists. Login or use a different email.'.format(email)})
        else: # user created.. Set password, remember to use a hashing function
            user.set_password(password) # This line will hash the password
            user.save() #DO NOT FORGET THIS LINE
        return render(request, 'sign-in.html', {'status': 'SUCCESS', 'message': 'Sign in to your account using email: {} and the password used for registration'.format(email)})

class LoginView(View):
    """docstring for LandingPageView."""

    def get(self, request):
        return render(request, 'sign-in.html', {'status': 'NEW', 'message': 'Enter email and password to sign in.'})


    def post(self, request):
        # retrieve email and password
        #email = request.data.get('email');
        email = request.POST.get('email', None)
        password = request.POST.get('password', None)

        if email is None  or password is None: # confirm all details passed
            return render(request, 'sign-in.html', {'status': 'ERR', 'message': 'Missing details'})

        # check if user matches these details
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            # Create a corresponding Profile id does not exist
            user_profile_list = Profile.objects.filter(user=user)

            if user_profile_list.count() < 1:
                profile = Profile.objects.create(user=user,usage=0.00)
                profile.save()
            return redirect('dashboard')
            # Redirect to a success page.
        else:
            # Return an 'invalid login' error message.
            return render(request, 'sign-in.html', {'status': 'ERR', 'message': 'Invalid username/password.'})

class LogoutView(View):
    """docstring for LandingPageView."""

    def get(self, request):
        logout(request);
        return redirect('landing-page')


    def post(self, request):
        logout(request);
        return redirect('landing-page')

class PasswordResetView(View):
    """docstring for LandingPageView."""

    def get(self, request):
        return render(request, 'reset-password.html', {'name': "Davies Ray"})


    def post(self, request):
        return render(request, 'reset-password.html', {'name': "Post action"})

class PasswordChangeView(View):
    """docstring for LandingPageView."""

    def get(self, request):
        return render(request, 'index.html', {'name': "Davies Ray"})


    def post(self, request):
        return render(request, 'index.html', {'name': "Post action"})

class DashboardView(View):
    """docstring for DashboardView."""

    def get(self, request):
        # get business plans
        # get current user
        if not request.user.is_authenticated: # check if user is authenticated
            return redirect('landing-page');
        bplans = BusinessPlanTitlePage.objects.filter(owner=request.user).order_by('-date_created') # order by date_created desc
        user_profile = Profile.objects.get(user=request.user)
        bplan_samples =  BusinessPlanSample.objects.all();  # get's all business plan samples
        return render(request, 'dashboard.html', {'user': request.user, 'user_profile': user_profile, 'bplans': bplans, 'bplan_samples': bplan_samples })


    def post(self, request):
        if not request.user.is_authenticated: # check if user is authenticated
            return redirect('landing-page');
        return render(request, 'dashboard.html', {'user': request.user})

class BusinessPlanDetailView(View):
    """docstring for BusinessPlanDetailView."""
    def get_size(self, obj, seen=None):
        """Recursively finds size of objects"""
        size = sys.getsizeof(obj)
        if seen is None:
            seen = set()
        obj_id = id(obj)
        if obj_id in seen:
            return 0
        # Important mark as seen *before* entering recursion to gracefully handle
        # self-referential objects
        seen.add(obj_id)
        if isinstance(obj, dict):
            size += sum([self.get_size(v, seen) for v in obj.values()])
            size += sum([self.get_size(k, seen) for k in obj.keys()])
        elif hasattr(obj, '__dict__'):
            size += self.get_size(obj.__dict__, seen)
        elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
            size += sum([self.get_size(i, seen) for i in obj])
        return size



    def get(self, request):
        id = request.GET.get('id', None)
        mode = 'edit' if id else 'new'
        bplan_title_page = None
        bplan_settings = BusinessPlanTitlePage()

        if id is not None:
            # this is a fresh get
            bplan_title_page = BusinessPlanTitlePage.objects.get(id=id)
            bplan_title_page_form = BusinessPlanTitlePageForm(instance=bplan_title_page)
            try:
                bplan_settings = BusinessPlanSettings.objects.get(title_page=bplan_title_page)
            except:
                bplan_settings = compose_default_settings()
                bplan_settings.title_page = bplan_title_page
                bplan_settings.save()
        else:
            bplan_title_page_form = BusinessPlanTitlePageForm()
            bplan_settings = compose_default_settings()
            # Get remaining models and their corresponding forms


        bplan_main_content_page = None
        bplan_main_content_page_form = None
        try:
            bplan_main_content_page = BusinessPlanMainContent.objects.get(title_page=bplan_title_page)
            bplan_main_content_page_form = BusinessPlanMainContentForm(instance=bplan_main_content_page)
        except:
            bplan_main_content_page = BusinessPlanMainContent()
            bplan_main_content_page_form = BusinessPlanMainContentForm()


        bplan_financial_assumptions_page = None
        bplan_financial_assumptions_page_form = None
        try:
            bplan_financial_assumptions_page = BusinessPlanFinancialAssumptions.objects.get(title_page=bplan_title_page)
            bplan_financial_assumptions_page_form = BusinessPlanFinancialAssumptionsForm(instance=bplan_financial_assumptions_page)
        except:
            bplan_financial_assumptions_page = BusinessPlanFinancialAssumptions()
            bplan_financial_assumptions_page_form = BusinessPlanFinancialAssumptionsForm()

        bplan_financial_data_input_page = None
        bplan_financial_data_input_page_form = None
        try:
            bplan_financial_data_input_page = BusinessPlanFinancialDataInput.objects.get(title_page=bplan_title_page)
            bplan_financial_data_input_page_form = BusinessPlanFinancialDataInputForm(instance=bplan_financial_data_input_page)
        except:
            bplan_financial_data_input_page = BusinessPlanFinancialDataInput()
            bplan_financial_data_input_page_form = BusinessPlanFinancialDataInputForm()


        currencies = Currency.objects.all()
        months = Month.objects.all()
        bplan_samples =  BusinessPlanSample.objects.all();  # get's all business plan samples
        return render(request, 'business-plan.html', {
            'id': id,
            'bplan_title_page_form': bplan_title_page_form,
            'bplan_main_content_page_form': bplan_main_content_page_form,
            'bplan_financial_assumptions_page_form': bplan_financial_assumptions_page_form,
            'bplan_financial_data_input_page_form': bplan_financial_data_input_page_form,
            'bplan_settings': bplan_settings,
            'currencies': currencies,
            'months': months,
            'mode': mode,
            'bplan_samples': bplan_samples
        })

class BusinessPlanDeleteView(View):
    def get(self, request):
        # determine if new or edit form
        # check if id is set
        id = request.GET.get('id', None)
        business_plan_title_page = None
        try:
            business_plan_title_page = BusinessPlanTitlePage.objects.get(id=id)
        except:
            # unable to get business plan with id. Redirect to dashboard
            return redirect('dashboard');

        try:
            BusinessPlanMainContent.objects.get(title_page=business_plan_title_page).delete()
        except:
            pass

        try:
            BusinessPlanFinancialAssumptions.objects.get(title_page=business_plan_title_page).delete()
        except:
            pass

        try:
           BusinessPlanFinancialDataInput.objects.get(title_page=business_plan_title_page).delete()
        except:
            pass

        try:
           BusinessPlanSettings.objects.get(title_page=business_plan_title_page).delete()
        except:
            pass

        try:
            # adjust usage size
            profile = Profile.objects.get(user=request.user)
            profile.usage -=  business_plan_title_page.bplan_size
            profile.save()
            business_plan_title_page.delete()
        except Exception as err:
            pass

        return redirect('dashboard');


def save_title_page(request):
    if request.method == 'GET':
        return JsonResponse({'status':500, 'message': 'Save action does not allow GET'})
    bplanner_id = request.POST.get('id', None) # Be careful about this while doing a post!!
    if bplanner_id is not None and bplanner_id != '':
        # Update
        bplan = BusinessPlanTitlePage.objects.get(id=bplanner_id)
        form = BusinessPlanTitlePageForm(request.POST, files=None, instance=bplan)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.owner = request.user
            model_instance.date_modified = timezone.datetime.now();
            bplan_size = get_size(model_instance)
            model_instance.bplan_size = bplan_size - bplan.size  # Overall change in size in Mbs # round to 2 dps..
            model_instance.size = bplan_size
            model_instance.save()
            # get model size
            # update profile usage size
            user_profile = Profile.objects.get(user=request.user)
            user_profile.usage += bplan_size - bplan.size
            user_profile.save()
            return JsonResponse({'status': 200, 'message': 'Title page updated!', 'id': model_instance.id})
        else:
            pass
        return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
    else:
        form = BusinessPlanTitlePageForm(request.POST)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.owner = request.user
            model_instance.date_created = timezone.datetime.now();
            bplan_size = get_size(model_instance)
            model_instance.bplan_size += (bplan_size - model_instance.size)

            model_instance.size = bplan_size

            model_instance.save()
            # update profile usage size
            user_profile = Profile.objects.get(user=request.user)
            user_profile.usage += bplan_size
            user_profile.save()
            return JsonResponse({'status': 200, 'message': 'Title page save!',  'id': model_instance.id})
        return JsonResponse({'status': 500, 'message': 'An error occurred while creating Business plan. Please try again or contact system admin.'})

def save_main_content_page(request):
    if request.method == 'GET':
        return JsonResponse({'status':500, 'message': 'Save action does not allow GET'})

    # get business plan id:- you cannot proceed if this is not retrieved
    title_page_id = request.POST.get('title_page_id', None)
    if title_page_id is None or title_page_id == '':
        return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
    title_page = BusinessPlanTitlePage.objects.filter(id=title_page_id).first()
    content_page = None
    try:
        content_page = BusinessPlanMainContent.objects.get(title_page_id=title_page_id)
    except Exception as err:
        content_page = None

    if content_page is not None:
        form = BusinessPlanMainContentForm(request.POST, files=None, instance=content_page)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.title_page = title_page
            model_instance.owner = request.user
            model_instance.date_modified = timezone.datetime.now();
            content_page_size = get_size(model_instance)

            # update title page size
            title_page.bplan_size += content_page_size - content_page.size  # Overall change in size in Mbs # round to 2 dps..
            title_page.save()
            # update profile usage size
            user_profile = Profile.objects.get(user=request.user)
            user_profile.usage += content_page_size - content_page.size
            user_profile.save()

            model_instance.size = content_page_size
            model_instance.save()

            # get model size

            return JsonResponse({'status': 200, 'message': 'Main content updated successfully!', 'id': model_instance.id})
        return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
    else:
        form = BusinessPlanMainContentForm(request.POST)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.title_page = title_page
            model_instance.owner = request.user
            model_instance.date_created = timezone.datetime.now();
            content_page_size = get_size(model_instance)
            model_instance.size = content_page_size
            model_instance.save()
            title_page.bplan_size += content_page_size
            # update profile usage size
            user_profile = Profile.objects.get(user=request.user)
            user_profile.usage += content_page_size
            user_profile.save()
            return JsonResponse({'status': 200, 'message': 'Main content saved successfully!', 'id': model_instance.id})
        return JsonResponse({'status': 500, 'message': 'An error occurred while creating Business plan. Please try again or contact system admin.'})

def save_financial_assumptions_page(request):
    if request.method == 'GET':
        return JsonResponse({'status':500, 'message': 'Save action does not allow GET'})

    # get business plan id:- you cannot proceed if this is not retrieved
    title_page_id = request.POST.get('title_page_id', None)
    if title_page_id is None or title_page_id == '':
        return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
    title_page = BusinessPlanTitlePage.objects.get(id=title_page_id)

    try:
        assumptions_page = BusinessPlanFinancialAssumptions.objects.get(title_page=title_page)
    except:
        assumptions_page = None

    if assumptions_page is not None:
        form = BusinessPlanFinancialAssumptionsForm(request.POST, files=None, instance=assumptions_page)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.title_page = title_page
            model_instance.owner = request.user
            model_instance.date_modified = timezone.datetime.now();
            assumptions_page_size = get_size(model_instance)

            title_page.bplan_size += assumptions_page_size - assumptions_page.size
            title_page.save()

            # update profile usage size
            user_profile = Profile.objects.get(user=request.user)
            user_profile.usage += assumptions_page_size - assumptions_page.size
            user_profile.save()

            model_instance.size = assumptions_page_size
            model_instance.save()

            # get model size

            return JsonResponse({'status': 200, 'message': 'Financial assumptions data updated successfully!', 'id': model_instance.id})
        return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
    else:
        form = BusinessPlanFinancialAssumptionsForm(request.POST)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.title_page = title_page
            model_instance.owner = request.user
            model_instance.date_created = timezone.datetime.now();
            assumptions_page_size = get_size(model_instance)

            title_page.bplan_size += assumptions_page_size
            title_page.save()

            # update profile usage size
            user_profile = Profile.objects.get(user=request.user)
            user_profile.usage += assumptions_page_size
            user_profile.save()

            model_instance.size = assumptions_page_size
            model_instance.save()
            return JsonResponse({'status': 200, 'message': 'Financial assumptions data saved successfully!', 'id': model_instance.id})
        return JsonResponse({'status': 500, 'message': 'An error occurred while creating Business plan. Please try again or contact system admin.'})

def save_financial_data_input_page(request):
    if request.method == 'GET':
        return JsonResponse({'status':500, 'message': 'Save action does not allow GET'})

    # get business plan id:- you cannot proceed if this is not retrieved
    title_page_id = request.POST.get('title_page_id', None)
    if title_page_id is None or title_page_id == '':
        return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
    title_page = BusinessPlanTitlePage.objects.filter(id=title_page_id).first()

    try:
        data_input_page = BusinessPlanFinancialDataInput.objects.get(title_page=title_page)
    except:
        data_input_page = None

    if data_input_page is not None:
        # Update
        form = BusinessPlanFinancialDataInputForm(request.POST, files=None, instance=data_input_page)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.title_page = title_page
            model_instance.owner = request.user
            model_instance.date_modified = timezone.datetime.now();
            data_input_page_size = get_size(model_instance)

            title_page.bplan_size += data_input_page_size - data_input_page.size  # Overall change in size in Mbs # round to 2 dps..
            title_page.save()

            # update profile usage size
            user_profile = Profile.objects.get(user=request.user)
            user_profile.usage += data_input_page_size - data_input_page.size
            user_profile.save()

            model_instance.size = data_input_page_size
            model_instance.save()

            # get model size

            return JsonResponse({'status': 200, 'message': 'Business plan updated successfully!', 'id': model_instance.id})
        return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
    else:
        form = BusinessPlanFinancialDataInputForm(request.POST)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.title_page = title_page
            model_instance.owner = request.user
            model_instance.date_created = timezone.datetime.now();
            data_input_page_size = get_size(model_instance)

            title_page.bplan_size += data_input_page_size
            title_page.save()

            model_instance.size = data_input_page_size
            model_instance.save()

            # update profile usage size
            user_profile = Profile.objects.get(user=request.user)
            user_profile.usage += data_input_page_size
            user_profile.save()
            return JsonResponse({'status': 200, 'message': 'Business plan created successfully!', 'id': model_instance.id})
        return JsonResponse({'status': 500, 'message': 'An error occurred while creating Business plan. Please try again or contact system admin.'})

def save_bplanner_settings(request):
    if request.method == 'GET':
        return JsonResponse({'status':500, 'message': 'Save action does not allow GET'})

    # get business plan id:- you cannot proceed if this is not retrieved
    title_page_id = request.POST.get('title_page_id', None)
    if title_page_id is None or title_page_id == '':
        return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
    title_page = BusinessPlanTitlePage.objects.filter(id=title_page_id).first()

    try:
        bplanner_settings = BusinessPlanSettings.objects.get(title_page=title_page)
    except:
        bplanner_settings = None
    if bplanner_settings is not None :
        form = BusinessPlanSettingsForm(request.POST, files=None, instance=bplanner_settings)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.title_page = title_page
            model_instance.save()
            return JsonResponse({'status': 200, 'message': 'Business plan updated successfully!', 'id': model_instance.id})
        return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
    else:
        form = BusinessPlanSettingsForm(request.POST)
        if form.is_valid():
            model_instance = form.save(commit=False)
            model_instance.title_page = title_page
            model_instance.save()
            return JsonResponse({'status': 200, 'message': 'Business plan created successfully!', 'id': model_instance.id})
        return JsonResponse({'status': 500, 'message': 'An error occurred while creating Business plan. Please try again or contact system admin.'})

class BusinessPlanHelpView(View):
    """docstring for BusinessPlanHelpView."""

    def get(self, request):
        section = request.GET.get('section', None)
        # get find help model
        help_section = HelpSection.objects.get(ref_id=section) if section is not None else HelpSection.objects.first()
        bplan_samples =  BusinessPlanSample.objects.all();  # get's all business plan samples
        return render(request, 'help.html', {'help_section': help_section, 'bplan_samples': bplan_samples})


    def post(self, request):
        bplan_samples =  BusinessPlanSample.objects.all();  # get's all business plan samples
        return render(request, 'help.html', {'name': "Post action", 'bplan_samples': bplan_samples})

def view_bplan(request):
    if request.method == 'POST':
        return JsonResponse({'status':500, 'message': 'Get action does not allow POST'})
    # check if sample
    sample = request.GET.get('sample', None)
    sample_id = request.GET.get('id', None)
    if sample_id == None:
        return JsonResponse({'status': 500, 'message': 'Could not process request...'})

    bplan_samples =  BusinessPlanSample.objects.all();  # get's all business plan samples
    # we have a valid id. get sample
    if sample:
        sample = BusinessPlanSample.objects.get(id=sample_id);
        bplan_main_content_page = BusinessPlanMainContent.objects.get(title_page=sample.title_page)
        # data = jsonpickle.encode(sample)
        return render(request, 'view-business-plan.html', {'view': True, 'sample': sample, 'bplan_main_content_page': bplan_main_content_page, 'title_page': sample.title_page})
    else:
        # actual business pla
        title_page = BusinessPlanTitlePage.objects.get(id=sample_id)
        try:
            bplan_main_content_page = BusinessPlanMainContent.objects.get(title_page=title_page)
        except:
            # data = jsonpickle.encode(sample)
            bplan_main_content_page = None
        return render(request, 'view-business-plan.html', {'sample': sample, 'bplan_samples': bplan_samples, 'view': True, 'sample': None, 'bplan_main_content_page': bplan_main_content_page, 'title_page': title_page})


def link_callback(uri, rel):
    # use short variable names
    sUrl = settings.STATIC_URL      # Typically /static/
    sRoot = settings.STATIC_ROOT    # Typically /home/userX/project_static/
    mUrl = settings.MEDIA_URL       # Typically /static/media/
    mRoot = settings.MEDIA_ROOT     # Typically /home/userX/project_static/media/

    # convert URIs to absolute system paths
    if uri.startswith(mUrl):
        path = os.path.join(mRoot, uri.replace(mUrl, ""))
    elif uri.startswith(sUrl):
        path = os.path.join(sRoot, uri.replace(sUrl, ""))

    print("Resulting path")
    print(path)
    # make sure that file exists
    if not os.path.isfile(path):
        raise Exception('media URI must start with %s or %s' % (sUrl, mUrl))
    return path

def download_pdf(request):
    if request.method == 'POST':
        return JsonResponse({'status':500, 'message': 'Get action does not allow POST'})
    bplan_id = request.GET.get('id', None)
    if bplan_id == None:
        return JsonResponse({'status': 500, 'message': 'Could not process request...'})

    # we have a valid id. get sample
    bplan = BusinessPlanTitlePage.objects.get(id=bplan_id);
    bplan_main_content_page = BusinessPlanMainContent.objects.get(title_page=bplan)
    # data = jsonpickle.encode(sample)
    context = {'view': False, 'sample': None, 'bplan_main_content_page': bplan_main_content_page, 'title_page': bplan}

    template = get_template('download-template.html')
    html = template.render(context)
    # print(html); # print pred before
    # return HttpResponse(html);
    response = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), response, link_callback=link_callback)
    if not pdf.err:
        return HttpResponse(response.getvalue(), content_type='application/pdf')
    else:
        return HttpResponse("Error Rendering PDF", status=400)

    # return render(request, 'sample-business-plan.html', )

