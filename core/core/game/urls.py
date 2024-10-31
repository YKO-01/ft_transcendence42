from django.urls import path
from . import views

urlpatterns = [
    path('api/rooms/matches/<int:match_id>/', views.startgame, name='startgame'),
    path('api/game/<str:status>', views.startmatch, name='startmatch'),
]