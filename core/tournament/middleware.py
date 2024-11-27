import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from jwt.exceptions import InvalidTokenError
from urllib.parse import parse_qs
from rest_framework_simplejwt.authentication import JWTAuthentication

class JwtAuthMiddleware(BaseMiddleware):
    @database_sync_to_async
    def authenticate_token(self, token):
        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            return jwt_auth.get_user(validated_token)
        except Exception as e:
            return None

    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]

        if token:
            user = await self.authenticate_token(token)
            if user:
                scope['user'] = user
            else:
                scope['user'] = None
        else:
            scope['user'] = None

        return await super().__call__(scope, receive, send)

# @database_sync_to_async
# def get_user_from_token(token):
#     User = get_user_model()
#     try:
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
#         user_id = payload.get('user_id')
#         if user_id:
#             return User.objects.get(id=user_id)
#     except (User.DoesNotExist, InvalidTokenError, jwt.ExpiredSignatureError):
#         return None


# class JwtAuthMiddleware(BaseMiddleware):
#     """
#     Custom middleware to authenticate WebSocket connections using JWT.
#     """
#     async def __call__(self, scope, receive, send):
#         query_string = parse_qs(scope['query_string'].decode())
#         token = query_string.get('token')

#         if token:
#             token = token[0]  # Query params are lists, get the first item
#             scope['user'] = await get_user_from_token(token)
#         else:
#             scope['user'] = None

#         return await super().__call__(scope, receive, send)