from django.shortcuts import render
import requests
# Create your views here.

def rooms_list(request):
    backend_url = "http://localhost:8000/"
    headers = {'Content-Type': "application/json"}
    response = requests.get(backend_url, headers=headers)
    rooms = response.json()
    return render(request, 'room.html', {'rooms': rooms['rooms']})

def tournament(request, room_id):
    pass