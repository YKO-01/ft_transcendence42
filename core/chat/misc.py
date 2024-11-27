from channels.layers import get_channel_layer


async def send_notification_to_user(username, notification, link=None):
    channel_layer = get_channel_layer()
    room_group_name = f"{username}_notifications"
    await channel_layer.group_send(
        room_group_name,
        {"type": "send.notification", "message": notification, "link": link},
    )
