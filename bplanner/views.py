import sys
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from bplanner.models import *
from bplanner.forms import (BusinessPlanForm, )

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
        bplans = BusinessPlan.objects.filter(owner=request.user).order_by('-date_created') # order by date_created desc
        user_profile = Profile.objects.get(user=request.user)
        return render(request, 'dashboard.html', {'user': request.user, 'user_profile': user_profile, 'bplans': bplans})


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
        # determine if new or edit form
        # check if id is set
        id = request.GET.get('id', None)
        bplan = BusinessPlan()
        form = BusinessPlanForm()
        sample_plan = BusinessPlan.objects.first()
        currencies = Currency.objects.all()
        months = Month.objects.all()
        mode = 'new'
        if id is not None:
            # this is a fresh get
            bplan = BusinessPlan.objects.get(id=id)
            mode = 'edit'
            if bplan is not None:
                form = BusinessPlanForm(instance=bplan)
        return render(request, 'business-plan.html', {
            'bplanner_form': form,
            'currencies': currencies,
            'months': months,
            'mode': mode
        })


    def post(self, request):
        bplanner_id = request.GET.get('id', None) # Be careful about this while doing a post!!
        if bplanner_id is not None:
            # Update
            bplan = BusinessPlan.objects.get(id=bplanner_id)
            form = BusinessPlanForm(request.POST, files=None, instance=bplan)
            if form.is_valid():
                model_instance = form.save(commit=False)
                model_instance.owner = request.user
                model_instance.date_modified = timezone.datetime.now();
                bplan_size = self.get_size(model_instance)
                model_instance.size = round(bplan_size/1000000, 2) # in Mbs # round to 2 dps
                model_instance.save()
                # get model size
                return JsonResponse({'status': 200, 'message': 'Business plan updated successfully!'})
            return JsonResponse({'status': 500, 'message': 'An error occurred while updating Business plan. Please try again or contact system admin.'})
        else:
            form = BusinessPlanForm(request.POST)
            if form.is_valid():
                model_instance = form.save(commit=False)
                model_instance.owner = request.user
                model_instance.date_created = timezone.datetime.now();
                bplan_size = round(self.get_size(model_instance) /1000000, 2)
                model_instance.size = bplan_size
                model_instance.save()
                # update profile usage size
                user_profile = Profile.objects.get(user=request.user)
                user_profile.usage += bplan_size
                user_profile.save()
                return JsonResponse({'status': 200, 'message': 'Business plan created successfully!'})
            return JsonResponse({'status': 500, 'message': 'An error occurred while creating Business plan. Please try again or contact system admin.'})

class BusinessPlanDeleteView(View):
    def get(self, request):
        # determine if new or edit form
        # check if id is set
        id = request.GET.get('id', None)
        BusinessPlan.objects.get(id=id).delete()
        return redirect('dashboard');


class BusinessPlanHelpView(View):
    """docstring for BusinessPlanHelpView."""

    def get(self, request):
        section = request.GET.get('section', None)
        # get find help model
        help_section = HelpSection.objects.get(ref_id=section) if section != None else HelpSection.objects.first()
        print(help_section)

        return render(request, 'help.html', {'help_section': help_section})


    def post(self, request):
        return render(request, 'help.html', {'name': "Post action"})
