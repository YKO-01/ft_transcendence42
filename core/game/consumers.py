import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import re


class GameRoomConsumer(AsyncWebsocketConsumer):
    rooms = {}

    @classmethod
    def get_room_name(cls, room_name):
        return re.sub(r"[^a-zA-Z0-9_-]", "", room_name)[:99]

    async def connect(self):
        raw_room_name = self.scope["url_route"]["kwargs"]["match_id"]
        self.user = self.scope["user"]
        print("user ", self.user, " nickname ", self.user.nickname)
        self.room_name = self.get_room_name(raw_room_name)
        self.room_group_name = f"game_{self.room_name}"

        if self.room_group_name not in self.rooms:
            self.rooms[self.room_group_name] = {
                "players": 0,
                "left_score": 0,
                "right_score": 0,
                "ball_position": {"x": 400, "y": 300},
                "left_paddle_y": 250,
                "right_paddle_y": 250,
                "nickname_one": self.user.nickname,
				"username1": self.user.username
            }

        self.rooms[self.room_group_name]["players"] += 1
        print("players ", self.rooms[self.room_group_name]["players"])

        if self.rooms[self.room_group_name]["players"] > 2:
            await self.close()
            return
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "send_game_state", "nickname_two": self.user.nickname, "username2": self.user.username},
        )

    async def disconnect(self, close_code):
        # Decrement the player count
        self.rooms[self.room_group_name]["players"] -= 1

        # Remove the player from the room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # If no players left, remove the room
        if self.rooms[self.room_group_name]["players"] == 0:
            del self.rooms[self.room_group_name]

    async def receive(self, text_data):
        data = json.loads(text_data)

        if "paddle_move" in data:
            await self.handle_paddle_move(data["paddle_move"])
        elif "ball_position" in data:
            await self.handle_ball_position(data["ball_position"])
        elif "score_update" in data:
            await self.handle_score_update(data["score_update"])
        elif "winner_data" in data:
            await self.set_winner(data["winner_data"])

    async def handle_paddle_move(self, paddle_move):
        # print('paddle type ', paddle_move['player'])
        player = paddle_move["player"]
        y = paddle_move["y"]
        self.rooms[self.room_group_name][f"{player}_paddle_y"] = y
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "broadcast_paddle_move", "paddle_move": paddle_move},
        )

    async def handle_ball_position(self, ball_position):
        self.rooms[self.room_group_name]["ball_position"] = ball_position
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "broadcast_ball_position", "ball_position": ball_position},
        )

    @database_sync_to_async
    def update_score_match(self, score_update):
        from game.models import MatchGame

        match_id = score_update["match_id"]
        match = MatchGame.objects.get(id=match_id)
        match.player1_score = score_update["left_score"]
        match.player2_score = score_update["right_score"]
        if match.player1_score >= 5:
            match.p1.win_stats += 1
            match.p2.loss_stats += 1
            match.p1.save()
        elif match.player2_score >= 5:
            match.p2.win_stats += 1
            match.p1.loss_stats += 1
            match.p2.save()
        match.save()

    async def handle_score_update(self, score_update):
        if score_update["type"] == "score_game":
            await self.update_score_match(score_update)
        self.rooms[self.room_group_name]["left_score"] = score_update["left_score"]
        self.rooms[self.room_group_name]["right_score"] = score_update["right_score"]
        print(
            "score update ",
            score_update["left_score"],
            " ",
            score_update["right_score"],
        )
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "broadcast_score_update", "score_update": score_update},
        )

    async def broadcast_paddle_move(self, event):
        await self.send(
            text_data=json.dumps(
                {"type": "paddle_move", "paddle_move": event["paddle_move"]}
            )
        )

    async def broadcast_ball_position(self, event):
        await self.send(
            text_data=json.dumps(
                {"type": "ball_position", "ball_position": event["ball_position"]}
            )
        )

    async def broadcast_score_update(self, event):
        await self.send(
            text_data=json.dumps(
                {"type": "score_update", "score_update": event["score_update"]}
            )
        )

    async def send_game_state(self, event):
        nickname_two = event["nickname_two"]
        username2 = event["username2"]

        await self.send(
            text_data=json.dumps(
                {
                    "type": "game_state",
                    "game_state": {
                        "players": self.rooms[self.room_group_name]["players"],
                        "left_score": self.rooms[self.room_group_name]["left_score"],
                        "right_score": self.rooms[self.room_group_name]["right_score"],
                        "ball_position": self.rooms[self.room_group_name][
                            "ball_position"
                        ],
                        "left_paddle_y": self.rooms[self.room_group_name][
                            "left_paddle_y"
                        ],
                        "right_paddle_y": self.rooms[self.room_group_name][
                            "right_paddle_y"
                        ],
                        "nickname_one": self.rooms[self.room_group_name][
                            "nickname_one"
                        ],
						"username1": self.rooms[self.room_group_name]["username1"],
                        "nickname_two": nickname_two,
						"username2": username2
                    },
                }
            )
        )

    @database_sync_to_async
    def set_winner(self, winner_data):
        from tournament.models import Match

        match_id = winner_data["match_id"]
        winner = winner_data["winner"]
        match = Match.objects.get(id=match_id)
        match.set_winner(winner)
        # self.close()
