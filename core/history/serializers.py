from rest_framework import serializers
from game.models import MatchGame


class MatchSerializer(serializers.ModelSerializer):
    player = serializers.SerializerMethodField()
    opponent = serializers.SerializerMethodField()

    class Meta:
        fields = ["created_at", "player", "opponent"]
        model = MatchGame

    def get_player(self, obj):
        player = obj.p1
        print(player)
        score = obj.player1_score
        if obj.p2 == self.context.get("user"):
            player = obj.p2
            score = obj.player2_score

        return {
            "id": player.id,
            "username": player.username,
            "score": score,
        }

    def get_opponent(self, obj):
        player = obj.p1
        score = obj.player1_score
        if obj.p2 != self.context.get("user"):
            player = obj.p2
            score = obj.player2_score

        if player:
            return {
                "id": player.id,
                "username": player.username,
                "score": score,
                "image_url": player.img_url,
            }
        else:
            return {
                "username": "unknown",
                "score": 0,
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg",
            }
