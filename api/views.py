from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate, login

# Create your views here.

@csrf_exempt
@api_view(['GET', 'POST'])
def sign_up(request):
    """
    Attempts login and returns status
    """
    # retrieve email and password
    #email = request.data.get('email');
    email = request.POST.get('email', None)
    password = request.POST.get('password', None)
    if email is None  or password is None: # confirm all details passed
        return Response({'status': 'ERR', 'message': 'Missing details'}, status=status.HTTP_201_CREATED)

    # check if user matches these details
    user = authenticate(request, username=email, password=password)
    if user is not None:
        login(request, user)
        # Redirect to a success page.
    else:
        # Return an 'invalid login' error message.
        return Response({'status': 'ERR', 'message': 'Invalid credentials.'}, status=status.HTTP_201_CREATED)
    # finally return success message
    return Response({'status': 'SUCCESS', 'message': 'Sign up successful.'}, status=status.HTTP_201_CREATED)