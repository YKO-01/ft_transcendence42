from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
import pyotp
import qrcode
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from io import BytesIO
import os
from django.conf import settings
from django.db import models
from .tests import generate_new_username
from .models import Friend


class UserSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['id','username', 'email', 'password', 'password1']
        extra_kwargs = {
            'password': {'write_only': True},
            'password1': {'write_only': True},
        }
    def validate(self, attrs):
        username = attrs['username']
        email = attrs['email']
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "username is already taken"})
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "email is already taken"})
        # !to check if password is valid(mean password is not too common)
        try:
            validate_password(attrs['password'])
        except serializers.ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        if attrs['password'] != attrs['password1']:
            raise serializers.ValidationError({"password": "Password fields didn't match"})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'img_url', 'full_name', 'level' ]

class FriendUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User 
        fields = ['id', 'username', 'img_url'] 

class UserDataSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'state_2fa', 'first_name', 'last_name', 'img_url', 'username', 'friends','win_stats', 'loss_stats','img_qr']

    def get_friends(self, obj):
        friend_instance = Friend.objects.filter(user=obj).first()
        if friend_instance:
            return FriendUserSerializer(friend_instance.friends.all(), many=True).data
        return []

class FriendOnlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'img_url', 'is_online']
class User42Login(serializers.ModelSerializer):
    class Meta:
        model = User  # Make sure User model has the fields 'email', etc.
        fields = ['id','username', 'email', 'first_name', 'last_name', 'img_url', 'full_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username= validated_data['username'],
            email= validated_data['email'],
            img_url= validated_data['img_url'],
            full_name= validated_data['full_name']
        )
        return user
    def validate_username(self, username):
        if User.objects.filter(username=username).exists():
            username = generate_new_username(username)
        return username



class LoginUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    def validate(self, data):
        user = authenticate(**data)
        if user is None:
            raise serializers.ValidationError("Incorrect username or password")
        return data

    

from django.core.exceptions import ValidationError as DjangoValidationError

class UserUpdateSerializer(serializers.ModelSerializer):
    img_url = serializers.ImageField(required=False)  # Add this to handle file uploads
    password = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'state_2fa', 'level', 'img_url', 'username', 'password']
    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def update(self, instance, validated_data):
        img_file = validated_data.pop('img_url', None)
        
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        # !password
        # if 'password' in validated_data:
        #     try:
        #         validate_password(validated_data['password'])
        #         instance.set_password(validated_data['password'])
        #     except serializers.ValidationError as e:
        #         raise serializers.ValidationError({"password": 'password is weak'})
        if 'username' in validated_data:
            username = validated_data['username']
            if User.objects.filter(username=validated_data['username']).exists():
                raise serializers.ValidationError({"username": "username is already taken"})
            instance.username = validated_data.get('username', instance.username)
        
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.level = validated_data.get('level', instance.level)
        instance.state_2fa = validated_data.get('state_2fa', instance.state_2fa)
        if img_file:
            # #print('base dir', settings.BASE_DIR)
            # #print('instance.img_url:', instance.img_url)
            # #print('full path:', os.path.join(settings.BASE_DIR, instance.img_url.lstrip('/')))
            if not instance.img_url.startswith('http://') and not instance.img_url.startswith('https://'):
                if instance.img_url :
                    #  print('instance.img_url:', instance.img_url)
                    #  print('os.path.join:',os.path.join('/main/core/', instance.img_url.lstrip('/'))
                    os.remove(os.path.join('/main/core/', instance.img_url.lstrip('/'))
)
            img_url = default_storage.save(f'profile_pics/{instance.username}', img_file)
            print('img_url:', img_url)
            img_url = default_storage.url(img_url)
            instance.img_url = img_url

        else:
            instance.img_url = validated_data.get('img_url', instance.img_url)
        if(instance.state_2fa == True):
            instance.otp_secret = pyotp.random_base32()
            instance.totp = pyotp.totp.TOTP(instance.otp_secret).now()
            uri = pyotp.totp.TOTP(instance.otp_secret).provisioning_uri(name=instance.email, issuer_name="MyCompany")
            qr_image = qrcode.make(uri)
        
            qr_io = BytesIO()
            qr_image.save(qr_io, format='PNG')
            qr_io.seek(0)
            instance.img_qr.save(f'{instance.email}_qr.png', qr_io)
            #print('instance.otp_secret',instance.otp_secret)
            #print('instance.totp',instance.totp)
            #print('uri:', uri)
        else:
            if instance.img_qr:
                instance.img_qr.delete()
            instance.otp_secret = None
            instance.img_qr = None
        instance.save()
        return instance
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['img_url'] = instance.img_url
        if instance.img_qr:
            data['img_qr'] = instance.img_qr.url 
        #print('data:', data)
        return data

# class FriendUserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'img_url']
# for jwt:


# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

#     @classmethod
#     def get_token(cls, user):
#         token = super(MyTokenObtainPairSerializer, cls).get_token(user)

#         # Add custom claims
#         token['username'] = 'hamza'
#         return token