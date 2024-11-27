"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from users.middleware import JWTAuthMiddlewareStack

import chat.routing
import game.routing
import users.routing
import tournament.routing
import notifications.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JWTAuthMiddlewareStack(
            URLRouter(
                chat.routing.websocket_urlpatterns
                + game.routing.websocket_urlpatterns
                + users.routing.websocket_urlpatterns
                + tournament.routing.websocket_urlpatterns
                + notifications.routing.websocket_urlpatterns
            )
        ),
    }
)
