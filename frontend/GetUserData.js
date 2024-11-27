async function check_auth() {
    ////console.log('Starting check_auth...');
    if(window.location.pathname === '/2fa')
    {
        token = localStorage.getItem('token');
        if(token)
            console.log('token', token);
        else
            navigateTo('signin');
        return;
    }
    let access_token = localStorage.getItem('access_token');
    let response = await fetch('http://127.0.0.1:8000/api/user/', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });

    response = await handleAuthResponse(response, check_auth);
    if (response && response.ok) {
        let data = await response.json();
        //console.log('User data:', data);
        userStateOnline(data.id);
        localStorage.setItem("isUserSignedIn", true)
        window.UserData = data;
    } else if (!access_token) {
        navigateTo('signin');
    }
}


async function handleAuthResponse(response, retryFunction, params = null) {
    try {
        if (response.status === 401) {
            await refresh_token().catch(error => {
                throw new Error("Refresh token error")
            })
            if (params)
                response = await retryFunction(params)
            response = await retryFunction();
        }
    } catch (e) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('isUserSignedIn');
        // console.error('Error during token refresh:', e);
        navigateTo('signin');
        // return response
    }
    return response;
}

async function refresh_token() {
    let response = await fetch('http://127.0.0.1:8000/api/refresh/', {
        method: 'POST',
        credentials: 'include',
    });
    if (response.status === 200) {
        let data = await response.json();
        //////console.log('Token refreshed successfully');
        localStorage.setItem('access_token', data.access_token);
    } else {
        throw new Error('Failed to refresh token');
    }
}

// Call check_auth when needed, and ensure it is awaited
// (async () => {
//     await check_auth();
// })();

async function userStateOnline(id) {
    //////console.log('id::', id);
    access_token = localStorage.getItem('access_token');
    let wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    let url = `ws://127.0.0.1:8000/ws/socket-server/?token=${access_token}`;
    socket = new WebSocket(url);
    socket.onopen = function (event) {
        //console.log('WebSocket connection established');

        // Send a heartbeat every 25 seconds
        setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, 25000);

    }
    socket.onmessage = function (event) {
        let data = JSON.parse(event.data);
        //////console.log(data);
    }
}

async function getFriendOnline() {
    let access_token = localStorage.getItem('access_token');
    let response = await fetch('http://127.0.0.1:8000/api/getFriendsOnline/', {

        method: 'GET',
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });
    response = await handleAuthResponse(response, getFriendOnline);
    let result = await response.json();
    // //console.log(result);
    //console.log('Friends online:', result);
	return result
}