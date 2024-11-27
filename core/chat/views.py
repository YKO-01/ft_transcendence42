from .models import Conversation, Message
from .serializers import (
    MessageSerializer,
    ConversationSerializer,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.db.models import Q, Max

from users.models import User
from django.shortcuts import render


def home(request):
    return render(
        request=request, template_name="chat/chat.html", context={"room_name": "amine"}
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_chat(request):
    """
    list user conversations actually it gets the last message of each conersation
    """
    user = request.user
    conversations = (
        Conversation.objects.filter(Q(user=user) | Q(target=user))
        # .exclude(messages__isnull=True)
        .annotate(latest_timestamp=Max("messages__timestamp")).order_by(
            "-latest_timestamp"
        )
    )

    serialized = ConversationSerializer(
        conversations, many=True, context={"user": user}
    )
    return Response(serialized.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat(request, conversation_id):
    """
    get chat between authenticated user and target user
    """
    user = request.user
    conversation = Conversation.objects.filter(id=conversation_id).first()
    if conversation:
        if user not in [conversation.user, conversation.target]:
            return Response(status=status.HTTP_403_FORBIDDEN)
        serialized = MessageSerializer(conversation.messages.all(), many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_404_NOT_FOUND)


# def get_chat(request, username):
#     """
#     get chat between authenticated user and target user
#     """
#     user = request.user
#     target = User.objects.filter(username=username).first()
#     if target:
#         messages = Message.objects.filter(
#             Q(source=user, destination=target) | Q(source=target, destination=user)
#         )
#         serialized = MessageSerializer(messages, many=True)
#         return Response(serialized.data, status=status.HTTP_200_OK)
#     return Response({"message": "user not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_message(request):
    """
    create a message source is authenticated user
    destination should be passed in request body
    """
    user = request.user
    target = request.data["target"]
    if target:
        target = User.objects.filter(username=target).first()
        if not target:
            return Response(
                {"detail": "target user not found"}, status=status.HTTP_404_NOT_FOUND
            )
        conversation = Conversation.objects.filter(
            Q(user=user, target=target) | Q(user=target, target=user)
        ).first()
        if not conversation:
            conversation = Conversation.objects.create(user=user, target=target)

        message = {}
        message["content"] = request.data["content"]
        message["sender"] = user.id
        message["conversation"] = conversation.id
        serialized = MessageSerializer(data=message)
        if serialized.is_valid():
            serialized.save()
            return Response(serialized.data, status=status.HTTP_201_CREATED)
        return Response(serialized._errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_message(request, message_id):
    """
    get message according to it's id
    """
    user = request.user
    message = Message.objects.filter(pk=message_id).first()
    if not message or user not in [
        message.conversation.user,
        message.conversation.target,
    ]:
        return Response(status=status.HTTP_403_FORBIDDEN)
    serialized = MessageSerializer(message)
    return Response(serialized.data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_chat(request, username):
    """
    delete the chat beteen the authenticated user and target user
    """
    user = request.user
    target = User.objects.filter(username=username).first()
    if target:
        Conversation.objects.filter(
            Q(user=user, target=target) | Q(user=target, target=user)
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response({"detail": "user not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    """
    delete message according to it's id
    """
    user = request.user
    message = Message.objects.filter(pk=message_id).first()
    if not message or user not in [
        message.conversation.user,
        message.conversation.target,
    ]:
        return Response(status=status.HTTP_403_FORBIDDEN)
    message.delete()
    return Response(
        {"detail": "message deleted successfully!"}, status=status.HTTP_204_NO_CONTENT
    )
