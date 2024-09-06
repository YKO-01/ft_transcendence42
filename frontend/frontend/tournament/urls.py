from django.urls import path
from . import views

urlpatterns = [
    path('', views.rooms_list, name='rooms'),
    path('rooms/<int:room_id>/', views.tournament, name='tournament'),
]