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
def startgame(request, match_id):
    match = Match.objects.get(id=match_id)
    if match:
        return JsonResponse({
            'success': True,
            'message': 'Game started',
            'id': match.id,
            'player1': match.player1.username,
            'player2': match.player2.username,
        })
    return JsonResponse({
        'success': False,
        'message': 'Game not started'
    })

# api_view(['GET'])
# @permission_classes([IsAuthenticated])
def create_next_round_matches(request, room_id):
    room = Room.objects.get(id=room_id)
    if room:
        matches = room.create_next_round_matches()
        return JsonResponse({
            'success': True,
            'message': 'Next round matches created',
            'matches': matches
        })
    return JsonResponse({
        'success': False,
        'message': 'Next round matches not created'
    })

