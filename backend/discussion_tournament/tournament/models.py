from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class Player(AbstractUser):
    is_online = models.BooleanField(default=False)
    def __str__(self):
        return self.username

class Room(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    players = models.ManyToManyField(Player)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    count = models.IntegerField(default=0)


    def __str__(self):
        return self.name