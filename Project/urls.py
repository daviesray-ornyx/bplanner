"""Project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls import url, include
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from bplanner.views import (
    LandingPageView, RegisterView, LoginView, LogoutView, PasswordResetView,
    PasswordChangeView, DashboardView, BusinessPlanDetailView, BusinessPlanHelpView, BusinessPlanDeleteView,
    save_title_page, save_main_content_page, save_financial_assumptions_page, save_financial_data_input_page,
    save_bplanner_settings)


urlpatterns = [
    path('admin/', admin.site.urls),
    url(r'^summernote/', include('django_summernote.urls')),
    path('auth/', include('api.urls')),
    url(r'-/register$', RegisterView.as_view(), name='register-page'),
    url(r'-/login$', LoginView.as_view(), name='login-page'),
    url(r'-/password/reset$', PasswordResetView.as_view(), name='password-reset-page'),
    url(r'-/logout$', LogoutView.as_view(), name='logout-page'),
    url(r'-/password/change$', PasswordChangeView.as_view(), name='password-change-page'),
    url(r'-/help', BusinessPlanHelpView.as_view(), name='business-plan-help'),
    url(r'dashboard/new/business-plan/title_page$', save_title_page, name='save-title-page'),
    url(r'dashboard/new/business-plan/main_content_page$', save_main_content_page, name='save-main-content-page'),
    url(r'dashboard/new/business-plan/financial_assumptions_page$', save_financial_assumptions_page, name='save-financial-assumptions-page'),
    url(r'dashboard/new/business-plan/financial_data_input_page$', save_financial_data_input_page, name='save-financial-data-input-page'),
    url(r'dashboard/new/business-plan$', BusinessPlanDetailView.as_view(), name='business-plan-detail'),
    url(r'dashboard/view/business-plan$', BusinessPlanDetailView.as_view(), name='business-plan-view-detail'),
    url(r'dashboard/edit/business-plan$', BusinessPlanDetailView.as_view(), name='business-plan-edit-detail'),
    url(r'dashboard/save/business-plan/settings$', save_bplanner_settings, name='business-plan-save-settings'),
    url(r'dashboard/delete/business-plan$', BusinessPlanDeleteView.as_view(), name='business-plan-delete-detail'),
    url(r'dashboard$', DashboardView.as_view(), name='dashboard'),
    url(r'', LandingPageView.as_view(), name='landing-page'),

]

if settings.DEBUG:
     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
     urlpatterns += staticfiles_urlpatterns()