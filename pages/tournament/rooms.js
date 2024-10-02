class TournamentSocket{
    constructor(url){
        this.socket = new WebSocket(url);
        this.socket.onmessage = (e) => {
            this.handleMessage(e);
        }
    }
    handleMessage(event){
        const data = JSON.parse(event.data);
        updateMatches(data.matches);
    }
}

let CurrentUser = null;

let access_token = localStorage.getItem('access_token');
const socket = new WebSocket(`ws://localhost:8000/ws/rooms/?token=${access_token}`);

socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log(data.type);
    if (data.type === 'room_update') 
        updateRooms(data.rooms);
    if (data.type === 'match_update'){
        updateMatches(data.matches);
        // updateRooms(data.rooms);
    }
};
function updateRooms(rooms) {
    var count = 0;
    const roomContent = document.getElementById('rooms-container');
    roomContent.innerHTML = '';

    if (rooms.length === 0) {
        const btncreate = document.createElement('button');
        btncreate.textContent = 'Create Room';
        btncreate.classList.add('create-btn');
        btncreate.addEventListener('click', createRoom);
        roomContent.appendChild(btncreate);
    }
    else {
        rooms.forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.classList.add('room');
            roomDiv.innerHTML = `
                <h2>${room.name}</h2>
                <ul>
                    ${room.players.map(player => `
                        <li>
                            ${player.nickname}
                            ${player.is_current_user ? `<button class="cancel-btn" data-room="${room.id}">leave</button>` : ``}
                        </li>`).join('')}
                </ul>
                ${room.is_full ? `` : `<button class="join-btn" data-room="${room.id}">Join</button>`}
            `;
            roomContent.appendChild(roomDiv);
            if (room.is_full)
                count++;
            if (room.is_full && room.players.some(player => player.is_current_user))
            {
                window.history.pushState('', '', '/rooms/' + room.id);
                fetch('/rooms/' + room.id, room.id)
                .then(response => response.json())
                .then(data => {
                    updateMatches(data.matches);
                });
                // window.location.pathname = '/rooms/' + room.id;
                // const trnSocket = new TournamentSocket('ws://' + window.location.host + '/ws/rooms/' + room.id + '/');
            }
        });
        if (count == rooms.length) {
            const btncreate = document.createElement('button');
            btncreate.textContent = 'Create Room';
            btncreate.classList.add('create-btn');
            btncreate.addEventListener('click', createRoom);
            roomContent.appendChild(btncreate);
        }
    }

    const joinButtons = document.querySelectorAll('.join-btn');
    joinButtons.forEach(button => {
        
        


        button.addEventListener('click', function() {
            roomId = this.getAttribute('data-room');
            joinRoom(roomId);
            // console.log('join button clicked');
            // const roomId = this.getAttribute('data-room');
            // socket.send(JSON.stringify({
            //     action: 'join',
            //     room_id: roomId
            // }));
        });
    });

    const cancelButtons = document.querySelectorAll('.cancel-btn');
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('join button clicked');
            const roomId = this.getAttribute('data-room');
            socket.send(JSON.stringify({
                action: 'leave',
                room_id: roomId
            }));
        });
    });
}

function joinRoom(roomId) {
    const nicknameInput = document.createElement('input');
    nicknameInput.setAttribute('type', 'text');
    nicknameInput.setAttribute('placeholder', 'Enter your nick name');
    nicknameInput.setAttribute('name', 'nickname');
    nicknameInput.setAttribute('id', 'nickname');

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('id', 'submit');

    // Append the username input and submit button to the body of the document
    document.body.appendChild(nicknameInput);
    document.body.appendChild(submitButton);

    submitButton.addEventListener('click', function() {
        const nickname = nicknameInput.value;
        // const roomId = button.getAttribute('data-room');
        // Assuming 'socket' is the WebSocket you are using
        socket.send(JSON.stringify({
            action: 'join',
            room_id : roomId,
            nickname: nickname
        }));
        nicknameInput.remove();
        submitButton.remove();
    });
}

function updateMatches(matches) {
    // const matchesContainer = document.getElementById('matches-container');
    // const roomElement = document.querySelector(`.room[data-room="${roomId}"]`);
    // if (roomElement){
        const matchesContent = document.createElement('div');
        // matchesContent.classList.add('matches');
        matchesContent.innerHTML = `
            <h3>Matches</h3>
            <ul>
                ${matches.map(match => `
                    <li>${match.player1} VS ${match.player2}</li>
                `).join('')}
            </ul>
        `;
        document.body.appendChild(matchesContent);
    // }
}


function createRoom() {
    fetch('http://localhost:8000/api/rooms/create-room')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                joinRoom(data.room_id);
                // socket.send(JSON.stringify({
                //     'action': 'join',
                //     'room_id': data.room_id
                // }));
            }
            else {
                console.error(data.message);
            }
        });
}


async function check_auth()
    {
        let access_token = localStorage.getItem('access_token');
        let response = await fetch('http://127.0.0.1:8000/api/rooms/rooms-list/',{
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                }
        });
        // updateRooms(data.rooms);
        response = await handleAuthResponse(response, check_auth);
        if(response.ok)
        {
            updateRooms(data.rooms);
        }   
    }
    check_auth();
// console.log(access_token);
// fetch('http://localhost:8000/api/rooms/rooms-list/', {
//     method: 'GET',
//     credentials: 'include',
//     headers: {
//         'Authorization': `Bearer ${access_token}`,
//     }
// })
//     .then(response => response.json())
//     .then(data => 
//         updateRooms(data.rooms),
//         // CurrentUser = data.current_user
//     );
