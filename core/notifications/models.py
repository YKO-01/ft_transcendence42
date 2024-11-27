from django.db import models
from users.models import User


class Notification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_notifications",
        blank=True,
        null=True,
    )
    content = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    is_invite = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    fulfill_link = models.CharField(max_length=255, blank=True, null=True)
    reject_link = models.CharField(max_length=255, blank=True, null=True)
