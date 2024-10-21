from django.contrib import admin
from .models import User, Friend, FriendRequest, BlockFriend
# Register your models here.

admin.site.register(User)
admin.site.register(Friend)
admin.site.register(FriendRequest)
admin.site.register(BlockFriend)

