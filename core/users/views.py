from django.shortcuts import render,redirect
from django.http import JsonResponse,HttpResponse,HttpResponseRedirect
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view,authentication_classes, permission_classes
from .serializers import UserSerializer,LoginUserSerializer,User42Login,UserDataSerializer,UserUpdateSerializer,FriendOnlineSerializer
from .models import User,Friend,FriendRequest,BlockFriend
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

from notifications.serializers import NotificationSerializer
from chat.models import Conversation
from django.db.models import Q


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getFriendsOnline(request):
    user = request.user
    if not Friend.objects.all().count():
        return Response([], status=status.HTTP_200_OK)
    if not Friend.objects.filter(user=user).count():
        return Response([], status=status.HTTP_200_OK)
    friends = Friend.objects.get(user=user).friends.all()
    online_friends = friends.filter(is_online__gt=0)
    serialized_friends = FriendOnlineSerializer(online_friends, many=True)
    print('serialized_friends::',serialized_friends.data)
    return Response(serialized_friends.data, status=status.HTTP_200_OK)

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
    print('request.data::',request.data)
    user = UserSerializer(data=request.data)
    if user.is_valid():
        user.save()
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
    for key in user.errors:
        error = user.errors[key]
    return Response({'message': error[0]}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def loginView(request):
    email = request.data.get('email')
    password = request.data.get('password')
    print('email::',email)
    user = User.objects.filter(email=email).first()
    if user is None:
        raise AuthenticationFailed('User not found!')
    if user.username == 'admin':
        return Response({'message': 'You are not allowed to login here'}, status=status.HTTP_400_BAD)
    if not user.check_password(password):
        raise AuthenticationFailed('Incorrect password!')
    if user.state_2fa == True:
        
        return Response({'2fa': user.state_2fa, 'token': generetToekn2fa(user)})
    token = get_tokens_for_user(user)
    print('dfgdfgdfgdfgdfg')
    response = Response()
    response.set_cookie(
        key='refresh_token',
        value=token['refresh'],
        httponly=True,
        secure=True,
        samesite='none',
    )

    response.data = {
        '2fa': user.state_2fa,
        'detail': 'User logged in successfully',
        'access_token': token['access'],
    }
    print('response::',response)
    return response

# check if user is authenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkAuth(request):
    print('cookies',request.COOKIES)
    user = request.user
    
    serializer = UserSerializer(user, context={'request': request})
    print('user',UserDataSerializer(user).data)
    return Response(UserDataSerializer(user).data)

@api_view(['POST'])
def refresh_token(request):
    print('request.COOKIES::',request.COOKIES)
    refresh_token = request.COOKIES.get('refresh_token')
    acc_tkn = request.COOKIES.get('access_token')
    if not refresh_token:
        return Response({'detail': 'Refresh token not found'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        refresh_token_obj = RefreshToken(refresh_token)
        userId = refresh_token_obj['user_id']
        try:
            user = User.objects.get(id=userId)
            print('userId::',user.email)
        except User.DoesNotExist:
            print('User no longer exists')
            return Response({'detail': 'User no longer exists'}, status=status.HTTP_404_NOT_FOUND)


        new_access_token = refresh_token_obj.access_token
        response = Response({
            'message': 'Token refreshed',
            'access_token': str(new_access_token),
        })
        print('new_access_token::')
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
        return HttpResponseRedirect('https://127.0.0.1/profile')
    response = HttpResponseRedirect(f'https://127.0.0.1/2fa?token={generetToekn2fa(user)}')
    return response
@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def callback42(request):
    code = request.GET.get("code")
    error = request.GET.get("error")
    scope = request.GET.get("scope")
    responseFailed = HttpResponseRedirect('https://127.0.0.1/signin')
    
    if error:
        # response = HttpResponseRedirect('https://127.0.0.1/signin')
        responseFailed.data = {'error': error,'scope': scope}
        return responseFailed
    
    if not code:
        # response = HttpResponseRedirect('https://127.0.0.1/signin')
        responseFailed.data = {'error': 'Code not found'}
        return responseFailed
    
    token_url = "https://api.intra.42.fr/oauth/token"
    payload = {
        "grant_type": "authorization_code",
        "client_id": settings.FORTYTWO_CLIENT_ID,
        "client_secret": settings.FORTYTWO_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.FORTYTWO_REDIRECT_URI,
    }
    token_response = requests.post(token_url, data=payload)
    
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
                    return response
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
                print('response::',response)
                return response
            user_serializer = User42Login(data=user_profile)
            if user_serializer.is_valid():
                response = HttpResponseRedirect('https://127.0.0.1/profile')
                user = user_serializer.save()
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    secure=True,
                    samesite='none',
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
            return responseFailed(data={'error': 'Failed to get user info'})
    return responseFailed(data={'error': 'Failed to get access token'})
    

@api_view(['POST'])
def logoutView(request):
    response = Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    # Ensure that the cookie deletion matches the attributes of the cookie set in loginView
    response.delete_cookie('refresh_token', samesite='none')
    return response


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteUser(request):
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
        data = UserUpdateSerializer(user).data
        print('data update::',data)
        return Response({'message': 'User updated successfully','data':data}, status=status.HTTP_200_OK)
    
    return Response({'message': 'User not updated'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def validate2fa(request):
    code  = request.data['code']
    if not len(code) == 6 :
        return Response({'message': 'lenght must be 6 '}, status=status.HTTP_400_BAD_REQUEST)
    if code.isdigit() == False:
        return Response({'message': 'only numeriques'}, status=status.HTTP_400_BAD_REQUEST)
    email = jwt.decode(request.data['token'], settings.SECRET_KEY, algorithms=['HS256'])['email']
    print('request.data::',request.data)
    print('email::',email)
    user = User.objects.get(email=email)
    totp = pyotp.TOTP(user.otp_secret)
    # print('correct code',totp.now())
    # print('your code',request.data['code'])
    if totp.verify(request.data['code']):
        token = get_tokens_for_user(user)
        response = Response()
        response.set_cookie(
            key='refresh_token',
            value=token['refresh'],
            httponly=True,
            secure=True,
            samesite='none',
        )
        response.data = {
            'message': 'success',
            'access_token': token['access'],
        }
        return response
    return Response({'message': 'Invalid 2fa code'}, status=status.HTTP_400_BAD_REQUEST)
# *this for friend part
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sendRequestFriend(request):
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
    if FriendRequest.objects.filter(from_user=user, to_user=id).exists():
        print('Friend request already sent')
        return Response({'message': 'Friend request already sent'}, status=status.HTTP_400_BAD_REQUEST)
    to_user = User.objects.get(id=id)
    friend =  FriendRequest.objects.create(from_user=user, to_user=to_user)
    friend.save()
    notification_data = {'user': to_user.id, 'sender' : user.id, 'content': f"{user.username} sent you a friend request",'fulfill_link':"http://127.0.0.1:8000/api/acceptFriendRequest/",'reject_link':"http://127.0.0.1:8000/api/rejectFriendRequest/"}
    notification_serializer = NotificationSerializer(data=notification_data)
    if notification_serializer.is_valid():
        print("Hello")
        notification_serializer.save()
    else:
        print(notification_serializer.errors)

    # send_notification_to_user({'username': to_user.username, 'sender' : user, 'content': f"{user.username} sent you a friend request",'fulfill_link':"http://127.0.0.1:8000/api/acceptFriendRequest/",'reject_link':"http://127.0.0.1:8000/api/rejectFriendRequest/"})
    return Response({'message': 'Friend request sent successfully'}, status=status.HTTP_200_OK)

# ! get friend requests
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getFriendRequests(request):
    user = request.user
    friend_requests = FriendRequest.objects.filter(to_user=user).all()
    fromUser = []
    for request in friend_requests:
        fromUser.append(request.from_user)
    serializer = UserSerializer(fromUser, many=True)
    return Response({'results': serializer.data}, status=status.HTTP_200_OK)
# !accept friend request
def get_or_create_friend_list(user):
    user_friend_list = None
    if Friend.objects.filter(user=user).exists():
        user_friend_list = Friend.objects.get(user=user)
    else:
        user_friend_list = Friend.objects.create(user=user)
    return user_friend_list
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def acceptFriendRequest(request, sender):
    print('sdfsdfsfsdfsdfsfsdfsdfs')
    user = request.user
    id = sender
    print('id::',id)
    
    if id is None:
        return Response({'message': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    if FriendRequest.objects.filter(from_user=id, to_user=user).exists() == False:
        return Response({'message': 'Friend request does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    if Friend.objects.filter(user=user, friends=id).exists():
        print('Friend already added')
        return Response({'message': 'Friend already added'}, status=status.HTTP_400_BAD_REQUEST)
    # Add the user to the friend list
    to_user = User.objects.get(id=id)
    print('to_user::',to_user.username)
    user_friend_list = get_or_create_friend_list(user)
    user_friend_list.friends.add(User.objects.get(id=id))
    # Add the friend to the user's friend list
    friend_friend_list = get_or_create_friend_list(User.objects.get(id=id))
    friend_friend_list.friends.add(user)
    FriendRequest.objects.filter(from_user=id, to_user=user).delete()
    conversation = Conversation.objects.filter(
        Q(user=user, target=to_user) | Q(user=to_user, target=user)
    ).first()
    if not conversation:
        conversation = Conversation.objects.create(user=user, target=to_user)
    return Response({'message': 'Friend request accepted successfully','data':UserDataSerializer(user).data}, status=status.HTTP_200_OK)

# !reject friend request
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rejectFriendRequest(request, sender):
    user = request.user
    id = sender
    if id is None:
        return Response({'message': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    if FriendRequest.objects.filter(from_user=id, to_user=user).exists() == False:
        return Response({'message': 'Friend request does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    FriendRequest.objects.filter(from_user=id, to_user=user).delete()
    return Response({'message': 'Friend request rejected successfully'}, status=status.HTTP_200_OK)

# ! Unfriend a user from the friend list
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unfriend(request):
    user = request.user
    id = request.data.get('id')
    if id is None:
        return Response({'message': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    if Friend.objects.filter(user=user, friends=id).exists() == False:
        return Response({'message': 'Friend does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    Friend.objects.get(user=user).friends.remove(User.objects.get(id=id))
    Friend.objects.get(user=User.objects.get(id=id)).friends.remove(user)
    return Response({'message': 'Friend removed successfully'}, status=status.HTTP_200_OK)

# !search for users from the search bar and return first 3 results
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
# !get friends list
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getFriendsList(request):
    user = request.user
    try:
        friend_list = Friend.objects.get(user=user).friends.all()  # Fetch the user's friends
        serialized_friends = UserSerializer(friend_list, many=True)  # Serialize the friends data
        return Response({'results': serialized_friends.data}, status=status.HTTP_200_OK)
    except Friend.DoesNotExist:
        return Response({'results': []}, status=status.HTTP_200_OK)  

# !this need to test bc i dont know how to use it like this localhost:8000/api/Profile/admin/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def viewUser(request, username):
    user = User.objects.get(username=username)
    response = Response()
    response.data = {
        'results': UserDataSerializer(user).data
    }
    return response
# ! -------------------------------!
# ! -------------------------------!
# ** this for Block friend **

def get_or_create_blockUser(user):
    user_block = None
    if BlockFriend.objects.filter(user=user).exists():
        user_block = BlockFriend.objects.get(user=user)
    else:
        user_block = BlockFriend.objects.create(user=user)
    return user_block


@permission_classes([IsAuthenticated])
@api_view(['POST'])
def blockFriend(request):
    user = request.user
    id = request.data.get('id')
    print('id::',id)
    print('user::',user)
    if id is None:
        return Response({'message': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    if BlockFriend.objects.filter(user=user, block_friends=id).exists():
        return Response({'message': 'Friend already blocked'}, status=status.HTTP_400_BAD_REQUEST)
    user_block = get_or_create_blockUser(user)
    user_block.block_friends.add(User.objects.get(id=id))
    user_block.save()
    return Response({'message': 'Friend blocked successfully'}, status=status.HTTP_200_OK)

@permission_classes([IsAuthenticated])
@api_view(['POST'])
def unblockFriend(request):
    user = request.user
    id = request.data.get('id')
    if id is None:
        return Response({'message': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    if BlockFriend.objects.filter(user=user, block_friends=id).exists() == False:
        return Response({'message': 'Friend does not exist in block list'}, status=status.HTTP_400_BAD_REQUEST)
    BlockFriend.objects.get(user=user).block_friends.remove(User.objects.get(id=id))
    return Response({'message': 'Friend unblocked successfully'}, status=status.HTTP_200_OK)