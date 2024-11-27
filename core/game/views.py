from django.shortcuts import render
from tournament.models import Room, Match
from .models import MatchGame
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

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def startmatch(request, status):
#     user = request.user
#     print('im here', flush=True)
#     last_match = MatchGame.objects.last()
#     if last_match is None:
#         game = MatchGame.objects.create(p1=user)
#         game.player1 = user
#         if status == 'invite':
#             game.is_invite_only = True
#         game.save()
#         return JsonResponse({
#             'success': True,
#             'message': 'Match started',
#             'id': game.id,
#             'player1': game.p1.username,
#         })
#     else:
#         if last_match.p2 is not None:
#             game = MatchGame.objects.create(p1=user)
#             game.p1 = user
#             if status == 'invite':
#                 game.is_invite_only = True
#             game.p1.nickname = user.username
#             game.p1.save()
#             game.save()
#             return JsonResponse({
#                 'success': True,
#                 'message': 'Match started',
#                 'id': game.id,
#                 'player1': game.p1.username,
#             })
#         else:
#             if last_match.is_invite_only and user.is_invited is False:
#                 game = MatchGame.objects.create(p1=user)
#                 game.player1 = user
#                 game.save()
#                 return JsonResponse({
#                     'success': True,
#                     'message': 'Match started',
#                     'id': game.id,
#                     'player1': game.p1.username,
#                 }) 
#             game = MatchGame.objects.last()
#             if game.p1 == user:
#                 return JsonResponse({
#                     'success': False,
#                     'message': 'You are already in the match'
#                 })
#             game.p2 = user
#             game.p2.nickname = user.nickname
#             game.p2.save()
#             game.save()
#             return JsonResponse({
#                 'success': True,
#                 'message': 'Match started',
#                 'id': game.id,
#                 'player1': game.p1.username,
#                 'player2': game.p2.username,
#             })
 
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_match(request, match_id):
    user = request.user
    if match_id:
        try:
            game = MatchGame.objects.get(id=match_id)
            if game.p1 == user or game.p2 == user:
                game.delete()
                return JsonResponse({
                    'success': True,
                    'message': 'Match deleted'
                })
            return JsonResponse({
                'success': False,
                'message': 'You are not in the match'
            })
        except MatchGame.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Match not found'
            })
    return JsonResponse({
        'success': False,
        'message': 'Match ID is required'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_match(request, status):
    user = request.user
    matches = MatchGame.objects.all()
    for match in matches:
        if match.p2 is not None:
            continue
        print('match', match, flush=True)
        if match.p1 == user:
            return JsonResponse({
                'success': False,
				'id': match.id,
				'player1': match.p1.username,
                'message': 'You are already in the match'
            })
        if match.is_invite_only and user.is_invited_from.username != match.p1.username:
            # return JsonResponse({
            #     'success': False,
            #     'message': 'You are not invited'
            # })
            continue
        match.p2 = user
        match.save()
        return JsonResponse({
            'success': True,
            'message': 'Match started',
            'id': match.id,
            'player1': match.p1.username,
            'player2': match.p2.username,
        })
    game = MatchGame.objects.create(p1=user)
    game.p1 = user
    if status == 'invite':
        game.is_invite_only = True
    game.save()
    return JsonResponse({
        'success': True,
        'message': 'Match started',
        'id': game.id,
        'player1': game.p1.username,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_inviter(request, user_id):
	user = request.user
	user_invited = User.objects.filter(id=user_id)
	if user_invited:
		user_invited.is_invited_from = user
		return JsonResponse({
			'success': True
		})
	return JsonResponse({
		'success': False
	})
