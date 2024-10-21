from django.test import TestCase
from .models import User
import random
# Create your tests here.

# def generate_token(user,req):
#     refresh = RefreshToken.for_user(user)

def generate_new_username(username):
    strting = 'abcdefghijklmnopqrstuvwxyz1234567890'
    while User.objects.filter(username=username).exists():
        rand = random.randint(0, 36)
        username += strting[rand]
    return username



def save_user42(user):
    nuser = user.validated_data
    if User.objects.filter(username=nuser['username']).exists():
        nuser['username'] = generate_new_username(nuser['username'])
    user = User.objects.create_user(**nuser)
    user.save()

    