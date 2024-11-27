import json
import hashlib
from django.utils import timezone
from django.db.models import Q

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from users.models import User
from chat.models import Conversation
from .serializers import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = None
        self.conversation = None
        self.user = self.scope["user"]
        print(self.scope["user"])
        if self.user.is_authenticated:
            self.target = await self.get_user(self.scope["url_route"]["kwargs"]["user"])
            if self.target:
                self.conversation = await self.init_conversation()
                self.room_group_name = self.generate_room_name(
                    self.user.get_username(), self.target.get_username()
                )
                await self.channel_layer.group_add(
                    self.room_group_name, self.channel_name
                )
                await self.accept()
            else:
                await self.close()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message")
        event = text_data_json.get("event")
        if event == "seen":
            await self.update_last_message_seen()
            return
        serialized = await self.save_message(message)
        if not serialized:
            return
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "id": serialized.id,
                "sender": serialized.sender.id,
                "content": serialized.content,
                "timestamp": serialized.timestamp,
                "seen_at": serialized.seen_at,
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "id": event["id"],
                    "sender": event["sender"],
                    "content": event["content"],
                    "timestamp": str(event["timestamp"]),
                    "seen_at": event["seen_at"],
                }
            )
        )

    def generate_room_name(self, sender, target):
        name = sender + target
        return hashlib.sha1("".join(sorted(name)).encode("utf-8")).hexdigest()

    @database_sync_to_async
    def init_conversation(self):
        if self.target:
            conversation = Conversation.objects.filter(
                Q(user=self.user, target=self.target)
                | Q(user=self.target, target=self.user)
            ).first()
            if not conversation:
                conversation = Conversation.objects.create(
                    user=self.user, target=self.target
                )
            return conversation
        return None

    @database_sync_to_async
    def update_last_message_seen(self):
        last_message = self.conversation.messages.last()
        if last_message:
            last_message.seen_at = timezone.now()
            last_message.save()

    @database_sync_to_async
    def save_message(self, message):
        if self.target:

            message = {
                "conversation": self.conversation.id,
                "sender": self.user.id,
                "content": message,
            }

            serialized = MessageSerializer(data=message)
            if serialized.is_valid():
                return serialized.save()
        return None

    @database_sync_to_async
    def get_user(self, username):
        return User.objects.filter(username=username).first()
