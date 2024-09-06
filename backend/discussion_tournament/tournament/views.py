from django.shortcuts import render, get_object_or_404
from .models import Room
from django.http import JsonResponse

# Create your views here.
def rooms_list(request):
    rooms = Room.objects.all()
    data = {'rooms': list(rooms.values())}
    return JsonResponse(data)

def tournament(request, room_id):
    room = get_object_or_404(Room, pk=room_id)
    players = room.players.all()
    data = {'result': list(players.values('username'))}
    return JsonResponse(data)
