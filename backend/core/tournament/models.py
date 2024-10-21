from django.db import models
from django.contrib.auth.models import AbstractUser
from ULogin.models import User as Player
from channels.db import database_sync_to_async

# Create your models here.

# class Player(AbstractUser):
#     groups = models.ManyToManyField(
#         'auth.Group',
#         related_name='player_user_set',  # Unique related name
#         blank=True,
#         help_text='The groups this player belongs to.',
#         verbose_name='groups'
#     )
#     user_permissions = models.ManyToManyField(
#         'auth.Permission',
#         related_name='player_user_permissions_set',  # Unique related name
#         blank=True,
#         help_text='Specific permissions for this player.',
#         verbose_name='user permissions'
#     )
#     is_online = models.BooleanField(default=False)
#     is_joining = models.BooleanField(default=False)
#     nickname = models.CharField(max_length=100, default='')
#     def __str__(self):
#         return self.username

class Room(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    players = models.ManyToManyField(Player, related_name='players')
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
        try:
            if not self.is_full:
                cur_player = Player.objects.get(username=player.username)
                cur_player.is_joining = True
                cur_player.nickname = nickname
                cur_player.save()
                self.players.add(cur_player)
                self.count += 1
                self.save()
                return True
            return False
        except Player.DoesNotExist:
            return False

    # @database_sync_to_async
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

    def create_next_round_matches(self):
        previous_matches = Match.objects.filter(room=self, winner__isnull=False)
        if not previous_matches.exists():
            return []
        winners = [match.winner for match in previous_matches]
        if len(winners) % 2 != 0:
            winners.append(None)
        return self.start_matches(winners)


class Match(models.Model):
    id = models.AutoField(primary_key=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2')
    created_at = models.DateTimeField(auto_now_add=True)
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, related_name='winner', null=True)

    def __str__(self):
        return f'{self.player1} vs {self.player2}'
    
    def set_winner(self, winning_player):
        if winning_player not in [self.player1, self.player2]:
            raise ValueError("The winning player must be one of the players in the match.")
        self.winner = winning_player
        self.save()