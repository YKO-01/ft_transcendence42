from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='ulogin_user_set',  # Unique related name
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='ulogin_user_permissions_set',  # Unique related name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )
    level = models.IntegerField(default=1)
    img_url = models.CharField(max_length=255, default="https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png")
    # img_url = models.ImageField(upload_to='profile_pics', default='profile_pics/1177568.png')
    full_name = models.CharField(max_length=255, default="", blank=True, null=True)
    email = models.EmailField(unique=True)
    state_2fa = models.BooleanField(default=False)
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    img_qr = models.ImageField(upload_to='qr_codes', blank=True, null=True)
    
    username = models.CharField(max_length=150, blank=True, null=True)
    USERNAME_FIELD = 'email'  # Set email as the primary identifier
    REQUIRED_FIELDS = ['username']  # Add any other fields that are required

    is_online = models.BooleanField(default=False)
    is_joining = models.BooleanField(default=False)
    nickname = models.CharField(max_length=100, default='')
    
    def __str__(self):
        return self.username
    

class Friend(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="friend_list")
    friends = models.ManyToManyField(User, related_name="friends_of", blank=True)

    def __str__(self):
        return f"{self.user.username}'s friends"
