from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    notifications = Notification.objects.filter(user=user)
    serialized = NotificationSerializer(notifications, many=True)
    return Response(serialized.data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_notifications(request):
    user = request.user
    Notification.objects.filter(user=user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_notification(request):
    # user = request.user
    # request.data.update({"user": user.id})
    serialized = NotificationSerializer(data=request.data)
    if serialized.is_valid():
        serialized.save()
        return Response(serialized.data, status=status.HTTP_201_CREATED)
    return Response(serialized._errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    user = request.user
    notification = Notification.objects.filter(user=user, id=notification_id).first()
    if notification:
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_403_FORBIDDEN)
