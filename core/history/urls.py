from django.urls import path, re_path

from . import views

urlpatterns = [
    path("matches/<int:user_id>/", view=views.get_matches, name="matches-get"),
    re_path(r'^matches/(?P<date>\d{4}-\d{2}-\d{2})/$', views.get_matches_by_date, name='matches_by_date'),
    # path("stats/<int:user_id>/", view=views.get_user_stats, name="stats-get")
]
