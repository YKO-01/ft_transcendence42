from django.contrib import admin
from .models import Match, Room
# from ULogin.models import User as Player
# Register your models here.

admin.site.register(Match)
# admin.site.register(Player)
admin.site.register(Room)