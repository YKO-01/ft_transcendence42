from django.shortcuts import render,redirect
from django.http import JsonResponse,HttpResponse,HttpResponseRedirect
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view,authentication_classes, permission_classes
from .serializers import UserSerializer,LoginUserSerializer,User42Login,UserDataSerializer,UserUpdateSerializer
from .models import User,Friend
from .tests import save_user42
from django.conf import settings
import requests

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError
from urllib.parse import urlencode
import pyotp
import jwt
from rest_framework.permissions import AllowAny


def generetToekn2fa(user):
    payload = {
        'email': user.email,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token
# function to regenret access token
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
def register(request):
    user = UserSerializer(data=request.data)
    if user.is_valid():
        print('User is valid')
        user.save()
        return Response(user.data)
    return Response(user.errors)

@api_view(['POST'])
def loginView(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = User.objects.filter(email=email).first()
    if user is None:
        raise AuthenticationFailed('User not found!')
    print('pass::',user.password)
    if not user.check_password(password):
        raise AuthenticationFailed('Incorrect password!')
    if user.state_2fa == True:
        
        return Response({'2fa': user.state_2fa, 'token': generetToekn2fa(user)})
    token = get_tokens_for_user(user)

    response = Response()
    response.set_cookie(
        key='refresh_token',
        value=token['refresh'],
        httponly=True,
        secure=True,
    )
    response.data = {
        '2fa': user.state_2fa,
        'message': 'success',
        'access_token': token['access'],
    }
    print('access_token::',str(token['access']))
    print('refresh_token::',str(token['refresh']))
    return response

# check if user is authenticated
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkAuth(request):
    user = request.user
    serializer = UserSerializer(user, context={'request': request})
    return Response(UserDataSerializer(user).data)

@api_view(['POST'])
def refresh_token(request):
    refresh_token = request.COOKIES.get('refresh_token')
    acc_tkn = request.COOKIES.get('access_token')
    if not refresh_token:
        return Response({'detail': 'Refresh token not found'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        refresh_token_obj = RefreshToken(refresh_token)
        new_access_token = refresh_token_obj.access_token
        response = Response({
            'message': 'Token refreshed',
            'access_token': str(new_access_token),
        })
        return response

    except TokenError:
        return Response({'detail': 'Refresh token is invalid or expired!'}, status=status.HTTP_401_UNAUTHORIZED)


# 42 api
@api_view(["GET"])
def login42(request):
    redirect_uri = urlencode({"redirect_uri": settings.FORTYTWO_REDIRECT_URI})
    print("Redirect URI:", redirect_uri)
    authorization_url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.FORTYTWO_CLIENT_ID}&{redirect_uri}&response_type=code&scope=public"
    print("Authorization URL:", authorization_url)
    return redirect(authorization_url)


def redirect42(user):
    if user.state_2fa == False:
        return HttpResponseRedirect('http://127.0.0.1:5501/frontend/profile.html')
    return HttpResponseRedirect('http://127.0.0.1:5501/frontend/2fa.html')
@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def callback42(request):
    code = request.GET.get("code")
    error = request.GET.get("error")
    scope = request.GET.get("scope")
    
    print("Code:", code)
    print("Error:", error)
    print("Scope:", scope)

    if error:
        return Response({"error": error})
    
    if not code:
        return Response({"error": "No code provided"})
    
    token_url = "https://api.intra.42.fr/oauth/token"
    payload = {
        "grant_type": "authorization_code",
        "client_id": settings.FORTYTWO_CLIENT_ID,
        "client_secret": settings.FORTYTWO_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.FORTYTWO_REDIRECT_URI,
    }
    token_response = requests.post(token_url, data=payload)
    print("Token Response:", token_response.json())
    print("Token Response Status Code:", token_response.status_code)
    if token_response.status_code == 200:
        access_token = token_response.json().get("access_token")
        user_info_url = "https://api.intra.42.fr/v2/me"
        user_response = requests.get(user_info_url, headers={"Authorization": f"Bearer {access_token}"})
        if user_response.status_code == 200:
            user_info = user_response.json()
            
            user_profile = {
                'username': user_info['login'],
                'email': user_info['email'],
                'first_name': user_info['first_name'],
                'last_name': user_info['last_name'],
                'img_url': user_info['image']['link'],
                'full_name': user_info['displayname'],
            }
            if User.objects.filter(email=user_profile['email']).exists():
                
                user = User.objects.get(email=user_profile['email'])
                
                response = redirect42(user)
                if user.state_2fa == True:
                    return response(data={'2fa': user.state_2fa, 'token': generetToekn2fa(user)})
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    secure=True,
                    samesite='None',
                )
                response.data = {
                    'message': 'success',
                    '2fa': user.state_2fa,
                    'access_token': access_token,
                }
                return response
            user_serializer = User42Login(data=user_profile)
            if user_serializer.is_valid():
                response = HttpResponseRedirect('http://127.0.0.1:5501/frontend/profile.html')
                user = user_serializer.save()
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    secure=True,
                    samesite='None',
                )
                response.data = {
                    'message': 'success',
                    'access_token': access_token,
                }
                return response
            else:
                print(user.errors)
            return Response(user_info)
        else:
            return HttpResponse(f"An error occurred while trying to log you in. Status Code: {token_response.status_code}. Response: {token_response.text}")
    return Response(token_response.json())

@api_view(['POST'])
def logoutView(request):
    response = Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteUser(request):
    # print('request.user::',request.user)
    # return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
    try:
        user = User.objects.get(id=request.user.id)
        user.delete()
        response = Response()
        response.delete_cookie('refresh_token')
        response.data = {
            'message': 'User deleted successfully',
        }
        return response
    except User.DoesNotExist:
        return Response({'message': 'User does not exist!'}, status=status.HTTP_404_NOT_FOUND)
# Access to fetch at '' (redirected from '') from origin 'http://127.0.0.1:5501' has been blocked by CORS policy: No 'Access-Control-Allow-Origin'

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def updateUser(request):
    user = request.user
    print('request.data::',request.data)
    serializer = UserUpdateSerializer(user, data=request.data)
    if(serializer.is_valid()):
        serializer.save()
        return Response({'message': 'User updated successfully'}, status=status.HTTP_200_OK)
    print('errors::',serializer.errors)
    return Response({'message': 'User not updated'}, status=status.HTTP_400_BAD_REQUEST)
    # if serializer.is_valid():
    #     serializer.save()
    #     print('Update serializer.data::',serializer.data)
    #     return Response(serializer.data)
    # print('serializer.errors::',serializer.errors)
    # return Response(serializer.errors)

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def validate2fa(request):
    print(request.data['token'])
    email = jwt.decode(request.data['token'], settings.SECRET_KEY, algorithms=['HS256'])['email']
    user = User.objects.get(email=email)
    totp = pyotp.TOTP(user.otp_secret)
    print('correct code',totp.now())
    print('your code',request.data['code'])
    if totp.verify(request.data['code']):
        token = get_tokens_for_user(user)
        response = Response()
        response.set_cookie(
            key='refresh_token',
            value=token['refresh'],
            httponly=True,
            secure=True,
        )
        response.data = {
            'message': 'success',
            'access_token': token['access'],
        }
        return response
    return Response({'message': 'Invalid 2fa code'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    user = request.user
    query = request.GET.get('q', '')  
    users = User.objects.filter(username__icontains=query).exclude(id=user.id)[:3]
    response = Response()
    response.data = {
        'results': UserDataSerializer(users, many=True).data
    }
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addFriend(request):
    user = request.user
    id = request.data.get('id')
    if id is None:
        return Response({'message': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    if user.id == id:
        return Response({'message': 'You cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(id=id).exists() == False:
        return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    if Friend.objects.filter(user=user, friends=id).exists():
        return Response({'message': 'Friend already added'}, status=status.HTTP_400_BAD_REQUEST)
    friend = Friend(user=user)
    friend.save()
    friend.friends.add(User.objects.get(id=id))
    friend.save()
    return Response({'message': 'Friend added successfully'}, status=status.HTTP_200_OK)


# !this need to test bc i dont know how to use it like this localhost:8000/api/Profile/admin/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getProfile(request, username):
    user = User.objects.get(username=username)
    response = Response()
    response.data = {
        'results': UserDataSerializer(user).data
    }
    return response
