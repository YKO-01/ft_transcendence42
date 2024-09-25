from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )
urlpatterns = [
    # path('' , views.getRoutes),

    # # path('api/token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # # path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # # path('token/', views.MyObtainTokenPairView.as_view(), name='token_obtain_pair'),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register),
    path('refresh/', views.refresh_token, name='refresh_token'),

    path('login/', views.loginView),
    path('user/', views.checkAuth),
    path('logout/', views.logoutView),
    path('deletUser/', views.deleteUser),
    path('updateUser/', views.updateUser),
    path('searchUsers/', views.search_users, name='search_users'),
    path('addFriend/', views.addFriend),
    # !this need to test bc i dont know how to use it like this localhost:8000/api/Profile/admin/
    path('Profile/<str:username>/', views.getProfile),

    path('verify2fa/', views.validate2fa),

    path('login42/', views.login42, name='login42'),
    path('callback/', views.callback42, name='callback42'),
]