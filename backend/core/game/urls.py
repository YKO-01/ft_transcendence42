from django.urls import path
from . import views

urlpatterns = [
    path('api/rooms/matches/<int:match_id>/', views.startgame, name='startgame'),
    path('api/rooms/matches/<int:room_id>/', views.next_round_matches, name='next_round_matches'),
]