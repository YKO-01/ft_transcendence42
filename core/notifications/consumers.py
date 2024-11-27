import json
from channels.generic.websocket import WebsocketConsumer
from channels.db import database_sync_to_async
from .serializers import NotificationSerializer

from .misc import send_notification_to_user


class NotificationConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = None
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.room_group_name = self.user.username
            self.channel_layer.group_add(self.room_group_name, self.channel_name)
            self.accept()
            # send_notification_to_user(
            #     {
            #         "username": self.user.username,
            #         "content": "Hola",
            #         "fulfill_link": "https://localhost",
            #     }
            # )
        else:
            self.close()

    def disconnect(self, code):
        if self.room_group_name:
            self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    def send_notification(self, event):
        notification_data = self.save_notification(event)
        if notification_data:
            self.send(
                text_data=json.dumps(
                    {
                        "content": notification_data.content,
                        "sender": notification_data.sender.id,
                        "is_read": notification_data.is_read,
                        "timestamp": str(notification_data.timestamp),
                        "fulfill_link": notification_data.fulfill_link,
                        "reject_link": notification_data.reject_link,
                    }
                )
            )

    @database_sync_to_async
    def save_notification(self, notification):
        notification_data = {
            "user": self.user.id,
            "sender": notification.get("sender"),
            "content": notification.get("content"),
            "fulfill_link": notification.get("fulfill_link"),
            "reject_link": notification.get("reject_link,"),
        }
        serialized = NotificationSerializer(data=notification_data)
        if serialized.is_valid():
            return serialized.save()
        return None
