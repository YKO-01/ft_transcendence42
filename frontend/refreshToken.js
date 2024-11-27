
// async function handleAuthResponse(response, retryFunction) {
//     // if (response.status === 401 /*|| response.status === 400*/) {
//     //     await refresh_token();
//     //     return retryFunction();
//     // }
//     ////////console.log('response status',response.status);
//     try{
//         if (response.status === 401) {
//             await refresh_token();
//             return retryFunction();
//         }
//     }
//     catch (e) {
//         console.error('error');
//         // localStorage.removeItem('access_token');
//         // localStorage.removeItem('isUserSignedIn');
//         // navigateTo('/signin');
//     }
//     return response;
// }
// async function refresh_token() {
//     let response = await fetch('http://127.0.0.1:8000/api/refresh/', {
//         method: 'POST',
//         credentials: 'include',
//     });
//     ////////console.log('refresh status',response.status);
//     if (response.status === 200) {
//         let data = await response.json();
//         ////////console.log('refreshed token');
//         localStorage.setItem('access_token', data.access_token);
//     } else {
//         ////////console.log('Failed to refresh token');
//         throw new Error('Failed to refresh token  ');
//         // window.location.href = 'http://127.0.0.1:5501/frontend/signin/signin.html';
//     }
// }


async function handleAuthResponse(response, retryFunction) {
    try{
        if (response.status === 401) {
            await refresh_token();
            return retryFunction();
        }
    }
    catch (e) {
        console.error('error');
        window.location.href = 'https://127.0.0.1/signin';
    }
    return response;
}
async function refresh_token() {
    let response = await fetch('http://127.0.0.1:8000/api/refresh/', {
        method: 'POST',
        credentials: 'include',
    });
    ////////console.log('refresh status',response.status);
    if (response.status === 200) {
        let data = await response.json();
        ////////console.log('refreshed token');
        localStorage.setItem('access_token', data.access_token);
    } else {
        ////////console.log('Failed to refresh token');
        throw new Error('Failed to refresh token  ');
        // window.location.href = 'http://127.0.0.1/frontend/signin/signin.html';
    }
}