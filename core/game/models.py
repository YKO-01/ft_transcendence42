from django.db import models
from users.models import User as Player

# Create your models here.


class MatchGame(models.Model):
    id = models.AutoField(primary_key=True)
    p1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='p1', default=None, null=True)
    p2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='p2', default=None, null=True)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    is_finished = models.BooleanField(default=False)
    is_invite_only = models.BooleanField(default=False)