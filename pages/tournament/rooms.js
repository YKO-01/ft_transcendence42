class RoomManger {
    constructor() {
        this.socket = null;
        this.rooms = [];
        this.current_user = null;
        this.access_token = localStorage.getItem('access_token');
        this.init();
    }
    init() {
        this.connectSocket();
        this.setupEventListeners();
        this.checkAuth();
    }

    connectSocket() {
        this.socket = new WebSocket(`ws://localhost:8000/ws/rooms/?token=${this.access_token}`);
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data.type);
            if (data.type === 'room_update') {
                this.updateRooms(data.rooms);
            }
            if (data.type === 'match_update') {
                this.updateMatches(data.matches);
            }
            if (data.type === 'error') {
                showError(data.message);
            }
        };
    }

    setupEventListeners() {
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('join-btn')) {
                const roomId = event.target.getAttribute('data-room');
                this.joinRoom(roomId);
            }
            if (event.target.classList.contains('cancel-btn')) {
                const roomId = event.target.getAttribute('data-room');
                this.leaveRoom(roomId);
            }
            if (event.target.classList.contains('create-btn')) {
                this.createRoom();
            }
        });
    }

    updateRooms(rooms) {
        this.rooms = rooms;
        const roomContent = document.getElementById('rooms-container');
        roomContent.innerHTML = '';

        if (rooms.length === 0) {
            this.createRoomButton(roomContent);
        } else {
            rooms.forEach(room => this.createRoomElement(room, roomContent));
            if (rooms.every(room => room.is_full)) {
                this.createRoomButton(roomContent);
            }
        }
    }

    createRoomElement(room, roomContent) {
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
    }

    createRoomButton(roomContent) {
        const btncreate = document.createElement('button');
        btncreate.textContent = 'Create Room';
        btncreate.classList.add('create-btn');
        roomContent.appendChild(btncreate);
    }
    
    joinRoom(roomId) {
        const InputNickname = document.createElement('input');
        InputNickname.setAttribute('type', 'text');
        InputNickname.setAttribute('placeholder', 'Enter your nick name');
        InputNickname.setAttribute('name', 'nickname');
        InputNickname.setAttribute('id', 'nickname');
        
        const SubmitButton = document.createElement('button');
        SubmitButton.textContent = 'Submit';
        SubmitButton.setAttribute('type', 'submit');
        SubmitButton.setAttribute('id', 'submit');

        document.body.appendChild(InputNickname);
        document.body.appendChild(SubmitButton);

        SubmitButton.addEventListener('click', () => {
            const nickname = InputNickname.value;
            this.sendSocketMessage({
                action: 'join',
                room_id: roomId,
                nickname: nickname,
                user: this.current_user
            });
            InputNickname.remove();
            SubmitButton.remove();
        });
    }

    leaveRoom(roomId) {
        this.sendSocketMessage({
            action: 'leave',
            room_id: roomId
        });
    }

    sendSocketMessage(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
    async checkAuth() {
        try {
            let response = await fetch('http://127.0.0.1:8000/api/rooms/rooms-list/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                }
            });
            response = await handleAuthResponse(response, this.checkAuth);
            if (response.ok) {
                const data = await response.json();
                this.updateRooms(data.rooms);
                this.current_user = data.current_user;
            }
        } catch (error) {
            console.error(error);
        }
    }
    // handleAuthResponse(response, callback) {
    //     if (response.status === 401) {
    //         localStorage.removeItem('access_token');
    //         window.location.replace('/login');
    //         return;
    //     }
    //     if (response.status === 403) {
    //         localStorage.removeItem('access_token');
    //         window.location.replace('/login');
    //         return;
    //     }
    //     if (response.status === 500) {
    //         setTimeout(callback, 1000);
    //     }
    //     return response;
    // }
}

document.addEventListener('DOMContentLoaded', () => {
    new RoomManger();
});





// let CurrentUser = null;

// let access_token = localStorage.getItem('access_token');
// // const socket = new WebSocket(`ws://localhost:8000/ws/rooms/?token=${access_token}`);

// // socket.onmessage = function(e) {
// //     const data = JSON.parse(e.data);
// //     console.log(data.type);
// //     if (data.type === 'room_update') 
// //         updateRooms(data.rooms);
// //     if (data.type === 'match_update'){
// //         updateMatches(data.matches);
// //         // updateRooms(data.rooms);
// //     }
// // };
// function updateRooms(rooms) {
//     var count = 0;
//     const roomContent = document.getElementById('rooms-container');
//     roomContent.innerHTML = '';

//     if (rooms.length == 0) {
//         console.log('No rooms available');
//         const btncreate = document.createElement('button');
//         btncreate.textContent = 'Create Room';
//         btncreate.classList.add('create-btn');
//         // btncreate.addEventListener('click', createRoom);
//         // roomContent.appendChild(btncreate);
//     }
//     else {
//         rooms.forEach(room => {
//             const roomDiv = document.createElement('div');
//             roomDiv.classList.add('room');
//             roomDiv.innerHTML = `
//                 <h2>${room.name}</h2>
//                 <ul>
//                     ${room.players.map(player => `
//                         <li>
//                             ${player.nickname}
//                             ${player.is_current_user ? `<button class="cancel-btn" data-room="${room.id}">leave</button>` : ``}
//                         </li>`).join('')}
//                 </ul>
//                 ${room.is_full ? `` : `<button class="join-btn" data-room="${room.id}">Join</button>`}
//             `;
//             roomContent.appendChild(roomDiv);
//             if (room.is_full)
//                 count++;
//         });
//         if (count == rooms.length) {
//             const btncreate = document.createElement('button');
//             btncreate.textContent = 'Create Room';
//             btncreate.classList.add('create-btn');
//             // btncreate.addEventListener('click', createRoom);
//             // roomContent.appendChild(btncreate);
//         }
//     }

//     // const joinButtons = document.querySelectorAll('.join-btn');
//     // joinButtons.forEach(button => {
//     //     button.addEventListener('click', function() {
//     //         roomId = this.getAttribute('data-room');
//     //         joinRoom(roomId);
//     //     });
//     // });

//     // const cancelButtons = document.querySelectorAll('.cancel-btn');
//     // cancelButtons.forEach(button => {
//     //     button.addEventListener('click', function() {
//     //         console.log('join button clicked');
//     //         const roomId = this.getAttribute('data-room');
//     //         socket.send(JSON.stringify({
//     //             action: 'leave',
//     //             room_id: roomId
//     //         }));
//     //     });
//     // });
// }

// // function joinRoom(roomId) {
// //     const nicknameInput = document.createElement('input');
// //     nicknameInput.setAttribute('type', 'text');
// //     nicknameInput.setAttribute('placeholder', 'Enter your nick name');
// //     nicknameInput.setAttribute('name', 'nickname');
// //     nicknameInput.setAttribute('id', 'nickname');

// //     const submitButton = document.createElement('button');
// //     submitButton.textContent = 'Submit';
// //     submitButton.setAttribute('type', 'submit');
// //     submitButton.setAttribute('id', 'submit');

// //     // Append the username input and submit button to the body of the document
// //     document.body.appendChild(nicknameInput);
// //     document.body.appendChild(submitButton);

// //     submitButton.addEventListener('click', function() {
// //         const nickname = nicknameInput.value;
// //         // const roomId = button.getAttribute('data-room');
// //         // Assuming 'socket' is the WebSocket you are using
// //         socket.send(JSON.stringify({
// //             action: 'join',
// //             room_id : roomId,
// //             nickname: nickname
// //         }));
// //         nicknameInput.remove();
// //         submitButton.remove();
// //     });
// // }


// // function createRoom() {
// //     fetch('http://localhost:8000/api/rooms/create-room')
// //         .then(response => response.json())
// //         .then(data => {
// //             if (data.success) {
// //                 joinRoom(data.room_id);
// //                 // socket.send(JSON.stringify({
// //                 //     'action': 'join',
// //                 //     'room_id': data.room_id
// //                 // }));
// //             }
// //             else {
// //                 console.error(data.message);
// //             }
// //         });
// // }


// async function check_auth()
//     {
//         let access_token = localStorage.getItem('access_token');
//         let response = await fetch('http://127.0.0.1:8000/api/rooms/rooms-list/',{
//                 method: 'GET',
//                 credentials: 'include',
//                 headers: {
//                     'Authorization': `Bearer ${access_token}`,
//                 }
//         });
//         // updateRooms(data.rooms);
//         response = await handleAuthResponse(response, check_auth);
//         if(response.ok)
//         {
//             let data = await response.json();
//             updateRooms(data.rooms);
//             CurrentUser = data.current_user;
//         }   
//     }
//     check_auth();
// // console.log(access_token);
// // fetch('http://localhost:8000/api/rooms/rooms-list/', {
// //     method: 'GET',
// //     credentials: 'include',
// //     headers: {
// //         'Authorization': `Bearer ${access_token}`,
// //     }
// // })
// //     .then(response => response.json())
// //     .then(data => 
// //         updateRooms(data.rooms),
// //         // CurrentUser = data.current_user
// //     );
