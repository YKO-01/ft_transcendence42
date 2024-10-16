from django.urls import path, re_path
from .consumers import GameRoomConsumer

websocket_urlpatterns = [
     re_path(r'ws/game/(?P<room_name>\w+)/', GameRoomConsumer.as_asgi()),
]