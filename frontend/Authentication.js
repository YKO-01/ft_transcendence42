async function Register(){
    let Rusername = document.querySelector("#app > auth-layout").shadowRoot.querySelector("#form-container > signup-page").shadowRoot.querySelector("#username").shadowRoot.querySelector("#username")
    let Remail = document.querySelector("#app > auth-layout").shadowRoot.querySelector("#form-container > signup-page").shadowRoot.querySelector("#email").shadowRoot.querySelector("#email")
    let Rpassword = document.querySelector("#app > auth-layout").shadowRoot.querySelector("#form-container > signup-page").shadowRoot.querySelector("#password").shadowRoot.querySelector("#password")
    let password1 = document.querySelector("#app > auth-layout").shadowRoot.querySelector("#form-container > signup-page").shadowRoot.querySelector("#confirm-password").shadowRoot.querySelector("#confirm-password")

    let data = new FormData();
    data.append("username", escapeHTML(Rusername.value));
    data.append("email", escapeHTML(Remail.value));
    data.append("password", Rpassword.value);
    data.append("password1", password1.value);
    let response = await fetch('http://127.0.0.1:8000/api/register/', {
            method: 'POST',
            body: data
    })
	if (response.ok)
		navigateTo("signin")
    let result = await response.json();
    //console.log(result);
    return result;
}
async function LogIn(){
    let Semail = document.querySelector("#app > auth-layout").shadowRoot.querySelector("#form-container > signin-page").shadowRoot.querySelector("#email").shadowRoot.querySelector("#email")
    let Spassword = document.querySelector("#app > auth-layout").shadowRoot.querySelector("#form-container > signin-page").shadowRoot.querySelector("#password").shadowRoot.querySelector("#password")

    let data = new FormData();
    data.append("email", escapeHTML(Semail.value));
    data.append("password", Spassword.value);
    let request = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        credentials: 'include',
        body: data
    });
    let result = await request.json();
    //////console.log(result);
    if (!request.ok) {
        //////console.log(`Error : ${result.detail}`);

    }
    else{
        //console.log(result);
        if(result['2fa'] === true)
        {
            localStorage.setItem('token', result.token);
            navigateTo('/2fa');
            return;
        }
        localStorage.setItem('access_token', result.access_token);
        await check_auth();
        navigateTo('/')
    }
}

function isNumeric(input) {
    return /^\d+$/.test(input);
}
async function validate2fa(input){
    let token = localStorage.getItem('token');
    if(!token)
    {
        urlRoute('signin');
        return;
    }
    if(!input)
        return;
    if(input.length !== 6)
        return;
    if(!isNumeric(input))
        return;
    let response = await fetch('http://127.0.0.1:8000/api/verify2fa/',{
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: token,
            code: (input),
          }),
    });
    let result = await response.json();
    //console.log(result);
    if(response.status === 200)
    {
        localStorage.setItem('access_token',result.access_token);
        localStorage.setItem('isUserSignedIn', true);
    }
    return response;
}
// async function check_auth()
// {
//     //////console.log('lolololololololololo');
//     let access_token = localStorage.getItem('access_token');
//     let response = await fetch('http://127.0.0.1:8000/api/user/',{
//         method: 'GET',
//         credentials: 'include',
//         headers: {
//             'Authorization': `Bearer ${access_token}`,
//         }
//     });
//     response = await handleAuthResponse(response, check_auth);
//     if(response.ok)
//     {
//         let data = await response.json();
//         //////console.log(data);
//         window.UserData = data;
//     }   
//     if(!access_token)
//     {
//         urlRoute('signin');
//         return;
//     }
// }
function LogIn42(){
    //////console.log('42');
    window.location.href = 'http://127.0.0.1:8000/api/login42/';
    // localStorage.setItem('isUserSignedIn', true)
}
async function LogOut(){
    //////console.log('logoutsdfsdfsdfsdfsfsdfsfsdf');
    let access_token = localStorage.getItem('access_token');
    let response = await fetch('http://127.0.0.1:8000/api/logout/',{
        method: 'POST',
        credentials: 'include',
    })
    await handleAuthResponse(response, LogOut);
    let result = await response.json();
    //////console.log(result);
    localStorage.removeItem('access_token');
    localStorage.removeItem('isUserSignedIn');
        // //////console.log('socket closedddddddddd',);
    socket.close();
    window.UserData = {};
    navigateTo('/signin');
}


