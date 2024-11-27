from django.urls import path
from . import views

urlpatterns = [
    path('rooms/matches/<int:match_id>/', views.startgame, name='startgame'),
    path('game/<str:status>/', views.start_match, name='start_match'),
    path('game/delete-match/<int:match_id>/', views.delete_match, name='delete_match'),
]