from datetime import datetime
from django.db.models import Q, DateField
from django.db.models.functions import Cast

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from users.models import User
from game.models import MatchGame

from .serializers import MatchSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_matches(request, user_id):
    user = User.objects.filter(id=user_id).first()
    matches = MatchGame.objects.filter(Q(p1=user) | Q(p2=user)).order_by("created_at")
    if matches:
        serialized = MatchSerializer(matches, many=True, context={"user": user})
        return Response(serialized.data, status=status.HTTP_200_OK)
    return Response([], status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_matches_by_date(request, date):
    match_date = datetime.strptime(date, "%Y-%m-%d").date()
    user = request.user
    matches = MatchGame.objects.filter(Q(p1=user) | Q(p2=user)).filter(
        created_at__date=match_date
    )
    if matches:
        serialized = MatchSerializer(matches, many=True, context={"user": user})
        return Response(serialized.data, status=status.HTTP_200_OK)
    return Response([], status=status.HTTP_200_OK)
