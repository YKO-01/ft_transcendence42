const cpu = document.querySelector(".cpu")
const player = document.querySelector(".player")
const ai = document.querySelector(".ai")

const modeCards = [{type: cpu, color: "#CD0024"}, {type: player, color: "#C0C400"}, {type: ai, color: "#091DC5"}]

modeCards.forEach(mode => {
	mode.type.addEventListener("mouseover", e => {
		if (e.target.classList.contains("mode-card"))
		{
			e.target.childNodes[1].style.color = "#fff";
			e.target.childNodes[1].style.background = "#020D14";
		}
	})
	mode.type.addEventListener("mouseleave", e => {
		e.target.childNodes[1].style.color = mode.color;
		e.target.childNodes[1].style.background = "none";
	})
})

const username = document.querySelector(".user-info h1");
const menuBtn = document.querySelector(".menu-btn")
const menu = document.querySelector(".menu")
const sidebarHeader = document.querySelector(".sidebar-header")
const overlay = document.querySelector(".sidebar-overlay")

overlay.style.top = sidebarHeader.clientHeight + 'px';


menuBtn.addEventListener("click", e => {
	e.preventDefault()
	username.style.userSelect = 'none';
	if (menu.style.display == "block")
	{
		menuBtn.style.transform = "rotate(0deg)"
		menu.style.display = "none";
		overlay.style.display = "none";
	}
	else
	{
		menuBtn.style.transform = "rotate(180deg)"
		menu.style.display = "block";
		overlay.style.display = "block";
	}
})


const searchFriendModal = document.querySelector(".add-friend-modal")
const containerOverlay = document.querySelector(".container-overlay")
const closeBtn = document.querySelector(".add-friend-modal svg")
const searchfriendBtn = document.querySelector(".search-friend-btn")

searchfriendBtn.addEventListener("click", e => {
	containerOverlay.style.display = "block";
	searchFriendModal.style.display = "flex";
})

closeBtn.addEventListener("click", e => {
	e.preventDefault()
	searchFriendModal.style.display = "none";
	containerOverlay.style.display = "none";
})

class Sockets
{
	constructor (url)
	{
		this.socket = new WebSocket(url);
		this.socket.onmessage = e => {
			this.handleMessage(e);
		}
	}

	handleMessage(e)
	{
		const data = JSON.parse(e.data);
		if (data.type == "room_update")
		{
			updateRooms(data.rooms);
		}
	}
}

const socket = new Sockets('ws://' + window.location.host + '/ws/rooms/');
// const socket = new WebSocket('ws://' + window.location.host + '/ws/rooms/');
// socket.onmessage = function(e) {
// 	const data = JSON.parse(e.data);
// 	if (data.type == 'room_update')
// 	{
// 		updateRooms(data.rooms);
// 	}
// }
const roomContent = document.querySelector('.tournaments');
const TableRoom = document.querySelector('.table-rooms');

function updateRooms(rooms)
{
	// roomContent.innerHTML = '';
	if (rooms.length == 0)
	{
		const btncreate = document.createElement('button');
		btncreate.textContent = 'Create Room';
		btncreate.classList.add('create-btn');
		btncreate.addEventListener('click', createRoom);
		roomContent.appendChild(btncreate);
	}
	else
	{
		rooms.forEach(room => {
			const roomDiv = document.createElement('tr');
			roomDiv.innerHTML = `
			<td><span class="room-number">${room.id}</span> ${room.name}</td>
			<td class="time">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0_298_84)">
				<path d="M8.00004 14.6666C11.6819 14.6666 14.6667 11.6818 14.6667 7.99992C14.6667 4.31802 11.6819 1.33325 8.00004 1.33325C4.31814 1.33325 1.33337 4.31802 1.33337 7.99992C1.33337 11.6818 4.31814 14.6666 8.00004 14.6666Z" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M8 4V8L10.6667 9.33333" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
				</g>
				<defs>
				<clipPath id="clip0_298_84">
				<rect width="16" height="16" fill="white"/>
				</clipPath>
				</defs>
				</svg>
				${room.time}
			</td>
			<td>
				<div class="players">
					<svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M13.3333 14V12.6667C13.3333 11.9594 13.0523 11.2811 12.5522 10.781C12.0521 10.281 11.3739 10 10.6666 10H5.33329C4.62605 10 3.94777 10.281 3.44767 10.781C2.94758 11.2811 2.66663 11.9594 2.66663 12.6667V14" stroke="#E2E2E2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M8.00004 7.33333C9.4728 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.4728 2 8.00004 2C6.52728 2 5.33337 3.19391 5.33337 4.66667C5.33337 6.13943 6.52728 7.33333 8.00004 7.33333Z" stroke="#E2E2E2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>${room.count} </span>	
				</div>
														
			</td>
			<td>
				${room.is_full ? `<div class="playing">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>
				<span>Playing</span>
			</div>` : `<button class="join-btn" data-room="${room.id}">Join</button>`}
			</td>
			`;
			TableRoom.appendChild(roomDiv);
		});
	}
}

fetch('http://localhost:8000/api/rooms/rooms-list/')
    .then(response => response.json())
    .then(data => 
        updateRooms(data.rooms),
        // CurrentUser = data.current_user
    );