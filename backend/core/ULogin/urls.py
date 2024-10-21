from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )
urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('refresh/', views.refresh_token, name='refresh_token'),

    path('register/', views.register),
    path('login/', views.loginView),
    path('logout/', views.logoutView),
    path('user/', views.checkAuth),
    path('deletUser/', views.deleteUser),
    path('updateUser/', views.updateUser),

    path('verify2fa/', views.validate2fa),
    path('login42/', views.login42, name='login42'),
    path('callback/', views.callback42, name='callback42'),

    path('searchUsers/', views.search_users, name='search_users'),
    path('getFriendsList/', views.getFriendsList),
    path('sendRequestFriend/', views.sendRequestFriend),
    path('getFriendRequests/', views.getFriendRequests),

    path('acceptFriendRequest/', views.acceptFriendRequest),
    path('rejectFriendRequest/', views.rejectFriendRequest),
    path('unfriend/', views.unfriend),

    path('blockFriend/', views.blockFriend),
    # !this need to test bc i dont know how to use it like this localhost:8000/api/Profile/admin/
    path('Profile/<str:username>/', views.viewUser),


]