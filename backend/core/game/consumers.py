import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import re

class GameRoomConsumer(AsyncWebsocketConsumer):
    rooms = {}  # Class-level dictionary to store room information

    @classmethod
    def get_room_name(cls, room_name):
        # Sanitize the room name to ensure it's valid
        return re.sub(r'[^a-zA-Z0-9_-]', '', room_name)[:99]

    async def connect(self):
        raw_room_name = self.scope['url_route']['kwargs']['match_id']
        user = self.scope['user']
        print('user ', user)
        self.room_name = self.get_room_name(raw_room_name)
        self.room_group_name = f'game_{self.room_name}'
        
        # Initialize room if it doesn't exist
        if self.room_group_name not in self.rooms:
            self.rooms[self.room_group_name] = {
                'players': 0,
                'left_score': 0,
                'right_score': 0,
                'ball_position': {'x': 400, 'y': 300},
                'left_paddle_y': 250,
                'right_paddle_y': 250,
            }

        self.rooms[self.room_group_name]['players'] += 1

        if (self.rooms[self.room_group_name]['players'] > 2):
            await self.close()
            return
        # Add the player to the room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        
        # Increment the player count
        
        # Accept the WebSocket connection
        await self.accept()

        # Send initial game state to the new player
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_game_state'
            }
        )
        # await self.send_game_state()

    async def disconnect(self, close_code):
        # Decrement the player count
        self.rooms[self.room_group_name]['players'] -= 1

        # Remove the player from the room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # If no players left, remove the room
        if self.rooms[self.room_group_name]['players'] == 0:
            del self.rooms[self.room_group_name]

    async def receive(self, text_data):
        data = json.loads(text_data)

        if 'paddle_move' in data:
            await self.handle_paddle_move(data['paddle_move'])
        elif 'ball_position' in data:
            await self.handle_ball_position(data['ball_position'])
        elif 'score_update' in data:
            await self.handle_score_update(data['score_update'])

    async def handle_paddle_move(self, paddle_move):
        # print('paddle type ', paddle_move['player'])
        player = paddle_move['player']
        y = paddle_move['y']
        self.rooms[self.room_group_name][f'{player}_paddle_y'] = y
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_paddle_move',
                'paddle_move': paddle_move
            }
        )

    async def handle_ball_position(self, ball_position):
        self.rooms[self.room_group_name]['ball_position'] = ball_position
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_ball_position',
                'ball_position': ball_position
            }
        )

    async def handle_score_update(self, score_update):
        self.rooms[self.room_group_name]['left_score'] = score_update['left_score']
        self.rooms[self.room_group_name]['right_score'] = score_update['right_score']
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_score_update',
                'score_update': score_update
            }
        )

    async def broadcast_paddle_move(self, event):
        await self.send(text_data=json.dumps({
            'type': 'paddle_move',
            'paddle_move': event['paddle_move']
        }))

    async def broadcast_ball_position(self, event):
        await self.send(text_data=json.dumps({
            'type': 'ball_position',
            'ball_position': event['ball_position']
        }))

    async def broadcast_score_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'score_update': event['score_update']
        }))

    async def send_game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'game_state': {
                'players': self.rooms[self.room_group_name]['players'],
                'left_score': self.rooms[self.room_group_name]['left_score'],
                'right_score': self.rooms[self.room_group_name]['right_score'],
                'ball_position': self.rooms[self.room_group_name]['ball_position'],
                'left_paddle_y': self.rooms[self.room_group_name]['left_paddle_y'],
                'right_paddle_y': self.rooms[self.room_group_name]['right_paddle_y'],
            }
        }))