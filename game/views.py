from django.shortcuts import render
from tournament.models import Room, Match
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view,authentication_classes, permission_classes
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def startgame(request, room_id):
    match = Match.Room.objects.get(id=room_id)
    if match:
        return JsonResponse({
            'success': True,
            'message': 'Game started'
            'match': match
        })
    return JsonResponse({
        'success': False,
        'message': 'Game not started'
    })

