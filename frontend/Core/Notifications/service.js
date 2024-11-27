async function eraseNotifications() {
    const response = await fetch('http://localhost:8000/api/notification/delete/',
        {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
            credentials: 'include'
        })

    response = await handleAuthResponse(response, eraseNotifications);

    if (!response.ok) {
        throw new Error('Failed to feach on notifications')
    }
    return true
}

async function fetchNotifications() {
    let response = await fetch('http://localhost:8000/api/notification/',
        {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
            credentials: 'include'
        })

    response = await handleAuthResponse(response, fetchNotifications);
    if (!response.ok) {
        throw new Error('Failed to feach on notifications')
    }
    return await response.json()
}

async function sendNotification(data) {
    // {
    //     "user": "received_user_id",
    //     "sender": "sender_user_id",
    //     "content": "content",
    //     "fulfill_link": "sucess url action",
    //     "reject_url": "reject url action"
    //     "is_invite": "false || true {default = false}"
    // }

    // data = JSON.stringify({
    //     "user": 2,
    //     "sender": 1,
    //     "content": "Heyllo",
    //     "fulfill_link": "http:gole",
    //     "is_invite": true

    // })
    let response = await fetch('http://localhost:8000/api/notification/add/',
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            credentials: 'include',
            body: data
        })

    response = await handleAuthResponse(response, sendNotification, data);

    if (!response.ok) {
        throw new Error('Failed to feach on notifications')
    }
    return await response.json()
}

async function deleteNotification(id) {
    let response = await fetch(`http://localhost:8000/api/notification/delete/${id}/`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            credentials: 'include'
        })
    response = await handleAuthResponse(response, deleteNotification, id);

    if (!response.ok) {
        throw new Error('Failed to feach on notifications')
    }
    return true
}