from rest_framework import serializers
from .models import Notification
from django.db.models import QuerySet


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
