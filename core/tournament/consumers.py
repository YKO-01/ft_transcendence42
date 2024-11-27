import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from datetime import datetime, date
# from .models import Room, Player

# @permission_classes[IsAuthenticated]
class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        print('self user ===================>', self.user, flush=True)
        if self.user is None:
            await self.close()
        self.room_group_name = 'room_group'
        self.room_name = None
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name   
        )
        await self.accept()
        # await self.create_room_if_none()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'room_update',
            }
        )

    async def disconnect(self, close_code):
        await self.leave_from_all_rooms()
        # pass
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        room_id = data.get('room_id')
        nickname = data.get('nickname')

        if action == 'join':
            await self.join_room(room_id, nickname)
        elif action == 'leave':
            await self.leave_room(room_id)
        if action == 'final':
            print('final===================>', flush=True)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'final_update',
                    'room_id': room_id,
                }
            )
            return
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'room_update',
            })
    
    @database_sync_to_async
    def create_room_if_none(self):
        from .models import Room
        if Room.objects.count() == 0:
            Room.objects.create(name='room1')

    @database_sync_to_async
    def join_room(self, room_id, nickname):
        from .models import Room
        try:
            print('room_id===================>', room_id, flush=True)
            room = Room.objects.get(id=room_id)
            print('room===================>', room.name, flush=True)
            success = room.add_player(self.user, nickname)
            if success:
                print('room count===================>', room.count, flush=True)
                if room.is_full:
                    print('room is full===================>', flush=True)
                    room.start_matches()
        except Room.DoesNotExist:
            pass

    @database_sync_to_async
    def leave_room(self, room_id):
        from .models import Room
        try:
            room = Room.objects.get(id=room_id)
            room.remove_player(self.user)
            if room.count == 0:
                room.delete()
        except Room.DoesNotExist:
            pass

    @database_sync_to_async
    def leave_from_all_rooms(self):
        from .models import Room
        rooms = Room.objects.all()
        for room in rooms:
            room.remove_player(self.user)
            if room.count == 0:
                room.delete()
    
    async def room_update(self, event):
        room_data = await self.get_data_room()
        # def convert_datetimes(data):
        #     if isinstance(data, dict):
        #         return {k: (v.isoformat() if isinstance(v, datetime) else v) for k, v in data.items()}
        #     elif isinstance(data, list):
        #         return [convert_datetimes(item) for item in data]
        #     return data

        # # Convert all datetime fields in room_data
        # room_data_serializable = convert_datetimes(room_data)
        def myconverter(obj):
            if isinstance(obj, (datetime, date)):
                return obj.isoformat()
        await self.send(text_data=json.dumps({
            'type': 'room_update',
            'rooms': room_data,
        }, default=myconverter))

    @database_sync_to_async
    def get_data_room(self):
        from .models import Room
        from users.models import User as Player
        rooms = Room.objects.all()
        data = []
        for room in rooms:
            data.append({
                'id': room.id,
                'name': room.name,
                'players': [{'username': player.username, 'nickname': player.nickname, 'is_current_user': player == self.user} for player in room.players.all()],
                'is_full': room.is_full,
                'count': room.count,
                'time': room.created_at,
            })
        return data

    @database_sync_to_async
    def display_final(self, room_id):
        from .models import Room, Match
        print('display_final===================>', flush=True)
        room = Room.objects.get(id=room_id)
        winners = room.create_next_round_matches()
        print('winners===================>', winners, flush=True)
        if len(winners) == 1 or winners is None:
            return None, None
        existing_match = Match.objects.filter(room=room, player1=winners[0], player2=winners[1]).first()
        if existing_match:
            match_id = existing_match.id
        else:
            match_id = room.start_match_winners(winners)
        if match_id is None:
            return None, None
        # match = Match.objects.filter(match_id)
        # print('match===================>', match, flush=True)

        data_winners = []
        for winner in winners:
            data_winners.append({
                'username': winner.username,
                'nickname': winner.nickname
            })
        return data_winners, match_id
    
    async def final_update(self, event):
        room_id = event.get('room_id')
        if room_id is None:
            print('room_id is None===================>', flush=True)
            return
        winners, match_id = await self.display_final(room_id)
        if winners is None or match_id is None:
            return
        # winners = await self.display_final(room_id)
        print('winners===================>', winners, flush=True)
        print('match_id===================>', match_id, flush=True)
        def myconverter(obj):
            if isinstance(obj, (datetime, date)):
                return obj.isoformat()
        await self.send(text_data=json.dumps({
            'type': 'final_update',
            'winners': winners,
            'match_id': match_id,

        }, default=myconverter))

    # @database_sync_to_async
    # def create_matches(self, room):
    #     from .models import Match
    #     room.start_matches()
        
    #     return True