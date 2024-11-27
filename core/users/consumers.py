from channels.generic.websocket import WebsocketConsumer
import json
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync   
from django.contrib.auth.models import User

# import threading
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
        self.user = self.scope['user']
        print(self.user)
        if self.user.is_authenticated:
            async_to_sync(self.update_user_status)(1)
            self.accept()
            print('connected', self.user)
            self.send(text_data=json.dumps({
                'message': 'connected'
            }))

    def disconnect(self, close_code):
        print('disconnect')
        if self.user.is_authenticated:
            async_to_sync(self.update_user_status)(-1) 

    @database_sync_to_async
    def update_user_status(self, delta):
        try:
            user = User.objects.get(id=self.user.id)  # Ensure the user still exists
            user.is_online += delta
            if user.is_online < 0:
                user.is_online = 0
            print('update_user_status', user.is_online)
            user.save()
        except User.DoesNotExist:
            print('User does not exist, cannot update status.')

# from channels.generic.websocket import WebsocketConsumer
# from asgiref.sync import async_to_sync
# from channels.db import database_sync_to_async
# from django.contrib.auth.models import AnonymousUser
# import json

# class UserOnline(WebsocketConsumer):
#     def connect(self):
#         # Access the user directly from the scope
#         self.user = self.scope['user']
        
#         if self.user.is_authenticated:
#             async_to_sync(self.update_user_status)(1)
#             self.accept()
#             print(f"Connected user: {self.user}")
#             self.send(text_data=json.dumps({'message': 'connected'}))
#         else:
#             # Close the connection if the user is not authenticated
#             self.close()

#     def disconnect(self, close_code):
#         # Only update status if the user was authenticated
#         if self.user.is_authenticated:
#             async_to_sync(self.update_user_status)(-1)

#     @database_sync_to_async
#     def update_user_status(self, delta):
#         # Ensure is_online does not go below zero
#         self.user.is_online = max(0, self.user.is_online + delta)
#         print(f"User status updated: {self.user.is_online}")
#         self.user.save()
