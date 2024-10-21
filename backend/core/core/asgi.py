import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from ULogin.middleware import JWTAuthMiddlewareStack

import ULogin.routing
import tournament.routing
import game.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sockeet.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            ULogin.routing.websocket_urlpatterns +
            tournament.routing.websocket_urlpatterns +
            game.routing.websocket_urlpatterns
        )
    ),
})
