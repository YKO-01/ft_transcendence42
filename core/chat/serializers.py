from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "content",
            "timestamp",
            "seen_at",
        ]

    def validate(self, attrs):
        return super().validate(attrs)

    def create(self, validated_data):
        return super().create(validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    target = serializers.SerializerMethodField()
    overview = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "target", "overview"]

    def get_user(self, obj):
        return {
            "username": obj.user.username,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
        }

    def get_target(self, obj):
        target = obj.target
        if obj.target == self.context.get("user"):
            target = obj.user
        return {
            "username": target.username,
            "first_name": target.first_name,
            "last_name": target.last_name,
			"img_url": target.img_url
        }

    def get_overview(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return {
                "sender": last_message.sender.id,
                "message": last_message.content,
                "timestamp": last_message.timestamp,
                "seen_at": last_message.seen_at,
            }