@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def callback42(request):
    code = request.GET.get("code")  
    error = request.GET.get("error")
    scope = request.GET.get("scope")
    if error:
        return Response({"error": error})
    
    if not code:
        return Response({"error": "No code provided"})
    
    token_url = "https://api.intra.42.fr/oauth/token"
    payload = {
        "grant_type": "authorization_code",
        "client_id": settings.FORTYTWO_CLIENT_ID,
        "client_secret": settings.FORTYTWO_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.FORTYTWO_REDIRECT_URI,
    }
    token_response = requests.post(token_url, data=payload)
    
    if token_response.status_code == 200:
        access_token = token_response.json().get("access_token")
        user_info_url = "https://api.intra.42.fr/v2/me"
        user_response = requests.get(user_info_url, headers={"Authorization": f"Bearer {access_token}"})
        if user_response.status_code == 200:
            user_info = user_response.json()
            user_profile = {
                'username': user_info['login'],
                'email': user_info['email'],
                'first_name': user_info['first_name'],
                'last_name': user_info['last_name'],
                'img_url': user_info['image']['link'],
                'full_name': user_info['displayname'],
            }
            response = HttpResponseRedirect('http://127.0.0.1:5501/frontend/profile.html')
            if User.objects.filter(email=user_profile['email']).exists():
                print('User exists!!!!!!!!!!!!!!!!!!!')
                user = User.objects.get(email=user_profile['email'])
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    secure=True,
                    samesite='None',
                )
                response.data = {
                    'message': 'success',
                    'access_token': access_token,
                }
                return response
            user = User42Login(data=user_profile)
            if user.is_valid():
                save_user42(user=user)
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                response = Response()
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    secure=True,
                    samesite='None',
                )
                response.data = {
                    'message': 'success',
                    'access_token': access_token,
                }
                return response
            else:
                return Response({'message': user.errors})
        else:
            return HttpResponse(f"An error occurred while trying to log you in. Status Code: {token_response.status_code}. Response: {token_response.text}")
