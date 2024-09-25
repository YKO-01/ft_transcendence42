from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class Player(AbstractUser):
    is_online = models.BooleanField(default=False)
    is_joining = models.BooleanField(default=False)
    nickname = models.CharField(max_length=100, default='')
    def __str__(self):
        return self.username

class Room(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    players = models.ManyToManyField(Player)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    count = models.IntegerField(default=0)
    # invites = models.ManyToManyField(Player, related_name='invites')
    # is_invite_only = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    @property
    def is_full(self):
        return self.count >= 4
    
    def add_player(self, player, nickname):
        if not self.is_full:
            if player.is_joining:
                return False
            player.is_joining = True
            self.players.add(player)
            current_player = self.players.get(username=player.username)
            current_player.nickname = nickname
            current_player.is_joining = True
            current_player.save()
            self.count += 1
            self.save()
            return True
        return False

    def remove_player(self, player):
        if player in self.players.all():
            player.is_joining = False
            current_player = self.players.get(username=player.username)
            current_player.is_joining = False
            current_player.save()
            self.players.remove(player)
            self.count -= 1
            self.save()
            return True
        return False

    def start_matches(self):
        players = list(self.players.all())
        matches = []
        for i in range(0, len(players), 2):
            player1 = players[i]
            if i + 1 < len(players):
                player2 = players[i+1]
            else:
                player2 = None
            match = Match.objects.create(room=self, player1=players[i], player2=players[i+1])
            matches.append(match)
        return matches


class Match(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2')
    created_at = models.DateTimeField(auto_now_add=True)
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, related_name='winner', null=True)
    def __str__(self):
        return f'{self.player1} vs {self.player2}'