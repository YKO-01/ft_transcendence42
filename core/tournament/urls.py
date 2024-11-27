from django.urls import path, include
from . import views

urlpatterns = [
    path('rooms/rooms-list/', views.rooms_list, name='rooms_list'),
    path('rooms/create-room/<str:roomName>/', views.create_room, name='create_room'),
    path('rooms/delete-room/<int:room_id>/', views.delete_room, name='delete_room'),
    path('rooms/<int:room_id>/', views.matches_room, name='matches_room'),
    path('rooms/join-room/', views.join_room, name='join_room'),
    path('rooms/leave-room/', views.leave_room, name='leave_room'),
    path('rooms/next_round/<int:room_id>/', views.next_round_matches, name='next_round_matches'),

]