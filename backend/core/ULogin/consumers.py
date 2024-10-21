from channels.generic.websocket import WebsocketConsumer
import json
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync   
from django.contrib.auth.models import User
import threading
# !version 1 but not working when user reload page
# class UserOnline(WebsocketConsumer):
#     def connect(self):
#         user = self.scope['user']
#         if user.is_authenticated:
#             # Mark the user as online
#             async_to_sync(self.update_user_status)(user, True)
            
#             self.accept()
#             print('connected', user)
#             self.send(text_data=json.dumps({
#                 'message': 'connected'
#             }))
#         else:
#             self.close()

#     def disconnect(self, close_code):
#         user = self.scope['user']
        
#         if user.is_authenticated:
#             # Mark the user as offline
#             async_to_sync(self.update_user_status)(user, False)

#     def update_status_after_delay(self, user, status):
        
#     @database_sync_to_async
#     def update_user_status(self, user, status):
#         user.is_online = status
#         user.save()

# !--------------------------------------------!
# !--------------------------------------------!
# *
# !--------------------------------------------!
# !--------------------------------------------!



from django.contrib.auth import get_user_model
User = get_user_model()
class UserOnline(WebsocketConsumer):
    def connect(self):
        query_params = self.scope['query_string'].decode()
        params = dict(param.split('=') for param in query_params.split('&'))
        user_id = params.get('id')
        
        try:
            self.user = User.objects.get(id=user_id)
            self.timer = None
            if self.user.is_authenticated:
                async_to_sync(self.update_user_status)(1)
                self.accept()
                print('connected', self.user)
                self.send(text_data=json.dumps({
                    'message': 'connected'
                }))
        except User.DoesNotExist:
            self.close()

    def disconnect(self, close_code):
        if self.user.is_authenticated:
            async_to_sync(self.update_user_status)(-1) 

    @database_sync_to_async
    def update_user_status(self, delta):
        self.user.is_online += delta
        if self.user.is_online < 0:
            self.user.is_online = 0
        print('update_user_status', self.user.is_online)
        self.user.save()