async function DeleteAccount(){
    ////////console.log("delete account");
    let access_token = localStorage.getItem('access_token');
    let response = await fetch('http://127.0.0.1:8000/api/deletUser/',{
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    })
    handleAuthResponse(response, DeleteAccount);
    let result = await response.json();
    if(response.ok)
    {
        localStorage.removeItem('access_token');
        localStorage.removeItem('isUserSignedIn');
        alert('Account deleted');
        navigateTo('/signin');
    }
    else
    {
        ////////console.log(`ERROR :${result}`);
    }
}

async function UpdateUsername(){
    let access_token = localStorage.getItem('access_token');
    let username = document.querySelector("#app > core-layout").shadowRoot.querySelector("#container > div > dashbboard-header").shadowRoot.querySelector("div > nav-menu").shadowRoot.querySelector("div > settings-modal").shadowRoot.querySelector("#username-input")
    

    const formData = new FormData();
    ////////console.log(username.value);
    formData.append('username', escapeHTML(username.value));
    let response = await fetch('http://127.0.0.1:8000/api/updateUser/', {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });
    response = await handleAuthResponse(response, UpdateUsername);
    let result = await response.json();
    ////////console.log(result);
    if(response.ok){
        window.UserData = result['data'];
    }
}
async function UpdatePassword(){
    let access_token = localStorage.getItem('access_token');
    let password = document.querySelector("#app > core-layout").shadowRoot.querySelector("#container > div > dashbboard-header").shadowRoot.querySelector("div > nav-menu").shadowRoot.querySelector("div > settings-modal").shadowRoot.querySelector("#password-input");

    const formData = new FormData();
    formData.append('password',password.value);
    let response = await fetch('http://127.0.0.1:8000/api/updateUser/', {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });
    response = await handleAuthResponse(response, UpdateUsername);
    let result = await response.json();
    ////////console.log(result);
    if(response.ok)
    {
        window.UserData = result['data'];
    }
}

async function UpdateImg() {
    let access_token = localStorage.getItem('access_token');
    let img = document.querySelector("#app > core-layout").shadowRoot.querySelector("#container > div > dashbboard-header").shadowRoot.querySelector("div > nav-menu").shadowRoot.querySelector("div > settings-modal").shadowRoot.querySelector("#file-input")

    const formData = new FormData();
    formData.append('img_url',img.files[0]);

    let response = await fetch('http://127.0.0.1:8000/api/updateUser/', {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });
    response = await handleAuthResponse(response, UpdateImg);
    let result = await response.json();
    ////////console.log(result);
    if(response.ok)
    {
        window.UserData = result['data'];
    }
}

async function Update2fa(state) {
    ////////console.log("2fa", state);
    let access_token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('state_2fa', state);
    //////console.log(state);
    let response = await fetch('http://127.0.0.1:8000/api/updateUser/', {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });
    response = await handleAuthResponse(response, Update2fa);
    let result = await response.json();
    // ////console.log('update', result);
    if(response.ok)
    {
        window.UserData = result['data'];
        ////console.log('ggggggg', window.UserData);
    }
}

async function SeachUser(value) {
    ////////console.log("search user", value);
    if (value.trim() == "")
        return;
    let response = await fetch(`http://127.0.0.1:8000/api/searchUsers/?q=${value.trim()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    response = await handleAuthResponse(response, SeachUser);
    let result = await response.json();
    return result
}