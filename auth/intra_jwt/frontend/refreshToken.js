
async function handleAuthResponse(response, retryFunction) {
    if (response.status === 401 || response.status === 400) {
        await refresh_token();
        return retryFunction();
    }
    return response;
}
async function refresh_token() {
    let response = await fetch('http://127.0.0.1:8000/api/refresh/', {
        method: 'POST',
        credentials: 'include',
    });
    console.log(response.status);
    if (response.status === 200) {
        let data = await response.json();
        localStorage.setItem('access_token', data.access_token);
    } else {
        console.error('error');
        window.location.href = 'http://127.0.0.1:5501/frontend/signin/signin.html';
    }
}