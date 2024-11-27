from django.db import models
from users.models import User


class Conversation(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_conversations"
    )
    target = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="conversations"
    )

    class Meta:
        unique_together = ("user", "target")
        indexes = [
            models.Index(fields=["user", "target"]),
            models.Index(fields=["target", "user"]),
        ]

    def save(self, *args, **kwargs):
        if self.user == self.target:
            raise ValueError("User and target cannot be the same.")
        if Conversation.objects.filter(user=self.target, target=self.user).exists():
            raise ValueError("Conversation already exists.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Conversation between {self.user.username} and {self.target.username}"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_messages"
    )
    content = models.TextField()
    seen_at = models.DateTimeField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]
        indexes = [
            models.Index(fields=["conversation", "timestamp"]),
            models.Index(fields=["sender", "timestamp"]),
        ]

    def save(self, *args, **kwargs):
        if self.sender not in [self.conversation.user, self.conversation.target]:
            raise ValueError("Sender must be part of the conversation.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Message from {self.sender.username} in {self.conversation}"
