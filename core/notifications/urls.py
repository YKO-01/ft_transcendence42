from django.urls import path

from . import views

urlpatterns = [
    path(route="notification/", view=views.get_notifications, name="notification-get"),
    path(route="notification/add/", view=views.add_notification, name="notification-add"),
    path(route="notification/delete/", view=views.delete_notifications, name="notification-clear"),
    path(route="notification/delete/<int:notification_id>/", view=views.delete_notification, name="notification-remove"),
]