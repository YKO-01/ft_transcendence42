from django.shortcuts import render, redirect
from .models import Room, Match
from django.contrib.auth import authenticate, login
from users.models import User as Player
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view,authentication_classes, permission_classes
# from rest_framework.response import Response

# Create your views here.


from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

# @login_required
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rooms_list(request):
    print('rooms_list', flush=True)
    rooms = Room.objects.all()
    current_user = request.user
    print('current_user', current_user, flush=True)
    data_room = [
        {
            'id': room.id,
            'name': room.name,
            'players': [{'username': player.username, 'nickname': player.nickname, 'is_current_user': player == current_user} for player in room.players.all()],
            'is_full': room.is_full,
            'time': room.created_at,
            'count': room.count,
            # 'is_player': current_user in room.players.all()
        }
        for room in rooms
    ]
    return JsonResponse({'rooms': data_room, 'current_user': current_user.username})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request, roomName):
    # if request.method == 'POST':
    print('request method', request.method, flush=True)
    username = request.user.username
    print('username', username, flush=True)
    if not username:
        return JsonResponse({
            'success': False,
            'message': 'Username is required'
        })
    player = Player.objects.get(username=username)
    print('player.is_joining', player.is_joining, flush=True)
    if player.is_joining:
        print('You are already joining a room', flush=True)
        return JsonResponse({
            'success': False,
            'message': 'You are already joining a room'
        })
    room = Room.objects.create(name=roomName)
    return JsonResponse({
        'success': True,
        'room_id': room.id,
        'message': f'Created room {room.id}'
    })
    # return JsonResponse({
    #     'success': False,
    #     'message': 'Invalid request method'
    # })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_room(request, room_id):
    if request.method == 'DELETE':
        if room_id:
            try:
                room = Room.objects.get(id=room_id)
                room.delete()
                return JsonResponse({
                    'success': True,
                    'message': f'Deleted room {room_id}'
                })
            except Room.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Room not found'
                })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Room ID is required'
            })
    return JsonResponse({
        'success': False,
        'message': 'Invalid request method'
    })

# @login_required
@csrf_exempt
def join_room(request):
    if request.method == 'POST':
        room_id = request.POST.get('room_id')
        if room_id:
            try:
                room = Room.objects.get(id=room_id)
                player = request.user
                if room.players.add(player):
                    # room.save()
                    return JsonResponse({
                        'success': True,
                        'room_id': room.id,
                        'message': f'Joined room {room.id}'
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'message': 'Failed to join a room. All rooms might be full.'
                    })
            except Room.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Room not found'
                })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Room ID is required'
            })
    return JsonResponse({
        'success': False,
        'message': 'Invalid request method'
    })

# @login_required
@csrf_exempt
def leave_room(request):
    if request.method == 'POST':
        room_id = request.POST.get('room_id')
        if room_id:
            try:
                room = Room.objects.get(id=room_id)
                player = request.user
                if room.players.remove(player):
                    # room.save()
                    if room.count == 0:
                        room.delete()
                    return JsonResponse({
                        'success': True,
                        'message': f'Left room {room.id}'
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'message': 'Failed to leave a room'
                    })
            except Room.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Room not found'
                })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Room ID is required'
            })
    return JsonResponse({
        'success': False,
        'message': 'Invalid request method'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def matches_room(request, room_id):
    user = request.user
    if room_id:
        try:
            matches = Match.objects.filter(room_id=room_id)
            data_matches = []
            for match in matches:
                if (match.player1 == user or match.player2 == user):
                    match_id = match.id
                data_matches.append({
                    'id': match.id,
                    'player1': match.player1.nickname,
                    'player2': match.player2.nickname,
                    'winner': match.winner.username if match.winner else None
                })
            return JsonResponse({
                'success': True,
                'message': 'Started matches',
                'matches': data_matches,
                'match_id': match_id
            })
        except Room.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Room not found'
            })
    else:
        return JsonResponse({
            'success': False,
            'message': 'Room ID is required'
        })

@api_view(['GET'])
def next_round_matches(request, room_id):
    user = request.user
    room = Room.objects.get(id=room_id)
    if room:
        winners = room.create_next_round_matches()
        data_winners = []
        for winner in winners:
            if winner:
                data_winners.append({
                    'nickname': winner.nickname
                })
        print('winners :', winners, flush=True)
        return JsonResponse({
            'success': True,
            'message': 'Next round matches created',
            'winners': data_winners
        })
    return JsonResponse({
        'success': False,
        'message': 'Next round matches not created'
    })
# @csrf_exempt
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def matches_room(request, room_id):
#     user = request.user
#     print('matches_room', flush=True)
#     # if request.method == 'POST':
#         # room_id = request.POST.get('room_id')
#     print('room_id===================>', room_id, flush=True)
#     if room_id:
#         try:
#             room = Room.objects.get(id=room_id)
#             matches = room.start_matches()
#             data_matches = []
#             for match in matches:
#                 if (match.player1 == user or match.player2 == user):
#                     match_id = match.id
#                 data_matches.append({
#                     'id': match.id,
#                     'player1': match.player1.nickname,
#                     'player2': match.player2.nickname,
#                     # 'winner': match.winner.username if match.winner else None
#                 })
                
#             return JsonResponse({
#                 'success': True,
#                 'message': 'Started matches',
#                 'matches': data_matches,
#                 'match_id': match_id
#             })
#         except Room.DoesNotExist:
#             return JsonResponse({
#                 'success': False,
#                 'message': 'Room not found'
#             })
#     else:
#         return JsonResponse({
#             'success': False,
#             'message': 'Room ID is required'
#         })
    # return JsonResponse({
    #     'success': False,
    #     'message': 'Invalid request method'
    # })

