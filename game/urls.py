from django.urls import path
from . import views

urlpatterns = [
    path('api/rooms/game-start/<int:room_id>/', views.startgame, name='startgame'),