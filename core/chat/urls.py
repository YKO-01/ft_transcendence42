from django.urls import path

from . import views

urlpatterns = [
    path("home/", views.home, name="room"),
    path(route="chat/", view=views.list_chat, name="chat-list"),
    path(route="chat/<int:conversation_id>/", view=views.get_chat, name="chat-get"),
    path(route="chat/<str:username>/delete/", view=views.delete_chat, name="chat-delete"),
    path(route="message/", view=views.create_message, name="message-create"),
    path(route="message/<int:message_id>/", view=views.get_message, name="message-get"),
    path(route="message/<int:message_id>/delete/",view=views.delete_message, name="message-delete"),
]
