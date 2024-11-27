from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.


class User(AbstractUser):
    level = models.IntegerField(default=1)
    img_url = models.CharField(
        max_length=255,
        default="https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png",
    )
    # img_url = models.ImageField(upload_to='profile_pics', default='profile_pics/1177568.png')
    full_name = models.CharField(max_length=255, default="", blank=True, null=True)
    email = models.EmailField(unique=True)
    state_2fa = models.BooleanField(default=False)
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    img_qr = models.ImageField(upload_to="qr_codes", blank=True, null=True)
    # is_online = models.BooleanField(default=False)
    is_online = models.IntegerField(default=0)
    username = models.CharField(max_length=150, blank=True, null=True)
    USERNAME_FIELD = "email"  # Set email as the primary identifier
    REQUIRED_FIELDS = ["username"]  # Add any other fields that are required

    is_joining = models.BooleanField(default=False)
    nickname = models.CharField(max_length=100, default="")
    is_invited = models.BooleanField(default=False)

    win_stats = models.IntegerField(default=0)
    loss_stats = models.IntegerField(default=0)

    def __str__(self):
        return self.username


class FriendRequest(models.Model):
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_friend_requests",
        on_delete=models.CASCADE,
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="received_friend_requests",
        on_delete=models.CASCADE,
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username}"


class Friend(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="friend_list"
    )
    friends = models.ManyToManyField(User, related_name="friends_of", blank=True)

    def __str__(self):
        return f"{self.user.username}'s friends"


class BlockFriend(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="block_friend_list"
    )
    block_friends = models.ManyToManyField(
        User, related_name="block_friends_of", blank=True
    )

    def __str__(self):
        return f"{self.user.username}'s block friends"
