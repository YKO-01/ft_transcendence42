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
        # try:
        #     validate_password(attrs['password'])
        # except serializers.ValidationError as e:
        #     raise serializers.ValidationError({"password": list(e.messages)})

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

class UserDataSerializer(serializers.ModelSerializer):
    # img_url = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'state_2fa' , 'first_name', 'last_name','first_name', 'email', 'level', 'img_url', 'full_name', 'username']

    
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

    


class UserUpdateSerializer(serializers.ModelSerializer):
    img_url = serializers.ImageField(required=False)  # Add this to handle file uploads
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'state_2fa', 'level', 'img_url', 'username']
    def update(self, instance, validated_data):
        img_file = validated_data.pop('img_url', None)
        if img_file:
            # print('base dir', settings.BASE_DIR)
            # print('instance.img_url:', instance.img_url)
            # print('full path:', os.path.join(settings.BASE_DIR, instance.img_url.lstrip('/')))
            if instance.img_url != 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png':
                if instance.img_url :
                    # print('media_root:', settings.MEDIA_ROOT)
                    # print('instance.img_url:', instance.img_url)
                    # print('deleting:', os.path.join('/app/', instance.img_url.lstrip('/')))
                    os.remove(os.path.join('/app/', instance.img_url.lstrip('/')))
            img_url = default_storage.save(f'profile_pics/{img_file.name}', img_file)
            img_url = default_storage.url(img_url)
            instance.img_url = img_url

        else:
            instance.img_url = validated_data.get('img_url', instance.img_url)

        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.level = validated_data.get('level', instance.level)
        instance.username = validated_data.get('full_name', instance.username)
        instance.state_2fa = validated_data.get('state_2fa', instance.state_2fa)
        if(instance.state_2fa == True):
            instance.otp_secret = pyotp.random_base32()
            instance.totp = pyotp.totp.TOTP(instance.otp_secret).now()
            uri = pyotp.totp.TOTP(instance.otp_secret).provisioning_uri(name=instance.email, issuer_name="MyCompany")
            qr_image = qrcode.make(uri)
        
            qr_io = BytesIO()
            qr_image.save(qr_io, format='PNG')
            qr_io.seek(0)
            instance.img_qr.save(f'{instance.email}_qr.png', qr_io)
            print(instance.img_qr)
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
            data['qr_img'] = instance.img_qr.url 
        print('data:', data)
        return data
    

class FriendUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'img_url']
# for jwt:


# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

#     @classmethod
#     def get_token(cls, user):
#         token = super(MyTokenObtainPairSerializer, cls).get_token(user)

#         # Add custom claims
#         token['username'] = 'hamza'
#         return token