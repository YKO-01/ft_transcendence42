
class TournamentMode extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.access_token = localStorage.getItem('access_token');
        this.isCreatingTournament = false;
        this.tournamentName = ""
        this.nickname = ""
        this.render()
        this.roomSocket = null;
        // this.initSocket()
    }
    render()
    {
        
        const tournamentMode = document.createElement('div');
        // tournamentMode.id = "tournament-mode"
        tournamentMode.className = "rounded ";
        tournamentMode.innerHTML = `
        ${this.isCreatingTournament ? `<div id="overlay" class=" z-2 position-absolute top-0 bottom-0 start-0 end-0 p-4">
            <img id="close" src="./Core/Shared/assets/exit.svg" height="44" width="44" class="position-absolute top-0 end-0 cursor-pointer	" ></img>
            <div class="d-flex flex-column h-100 w-100 align-items-center justify-content-center">
                <input type="text" id="tournament-name" class="mb-2 border border-2 border-success bg-transparent text-light fw-medium p-2" value="${this.tournamentName}" placeholder="Enter tournament name" />
                <input type="text" id="nickname" class="mb-2 border border-2 border-success bg-transparent text-light p-2 fw-medium " value="${this.nickname}" placeholder="Enter nickname" />
                <button id="create-tournament" class=" border border-light fw-semibold fs-6 px-2 py-1 position-absolute bottom-0 end-0">Create</button>
            </div> 
        </div>` : ``}
        <div class="d-flex mb-4 position-relative " id="tournament-mode">
                <game-mode color="#18be7f" title="Tournament"></game-mode>
                <div class="d-flex justify-content-between w-100 ms-4 p-2">
                    <p class="text-light fw-bold fs-3">Prove your ping pong prowess in thrilling tournaments!<p>
                    <svg class="" width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_173_2071)">
                            <path
                                d="M44.9751 53.6626L32 49.9126L19.0249 53.6626C18.9125 53.8876 18.875 54.1126 18.875 54.3751V62.1251H45.125V54.3751C45.125 54.1126 45.0875 53.8876 44.9751 53.6626Z"
                                fill="#646D73"
                            />
                            <path
                                d="M45.125 62.1251V54.3751C45.125 54.1126 45.0875 53.8876 44.9751 53.6626L32 49.9126V62.1251H45.125Z"
                                fill="#474F54"
                            />
                            <path
                                d="M62.125 3.75H52.5444C52.5609 3.11663 52.625 2.52 52.625 1.875C52.625 0.824875 51.8001 0 50.75 0H13.25C12.1999 0 11.375 0.824875 11.375 1.875C11.375 2.52 11.4391 3.11663 11.4554 3.75H1.875C0.838625 3.75 0 4.58862 0 5.625V10.3748C0 20.844 8.3865 29.3486 18.7216 29.8961C20.8748 32.8606 23.4301 35.0606 26.3375 36.3C25.8875 45.4125 20.675 51.75 19.4376 53.0626C19.25 53.2125 19.1 53.4375 19.025 53.6625H44.9751C44.9 53.4375 44.7501 53.2125 44.5625 53.0626C43.2875 51.75 38.1125 45.45 37.6625 36.3C40.5705 35.0604 43.1412 32.8599 45.2961 29.8943C55.6224 29.3379 64 20.8381 64 10.3748V5.625C64 4.58862 63.1614 3.75 62.125 3.75ZM3.75 10.3748V7.5H11.6163C12.1029 13.6973 13.4467 20.2607 16.2712 25.8385C9.19125 24.2441 3.75 17.9304 3.75 10.3748ZM60.25 10.3748C60.25 17.9265 54.8136 24.2373 47.7389 25.8353C50.541 20.2576 51.8924 13.7576 52.3838 7.5H60.25V10.3748Z"
                                fill="#FED843"
                            />
                            <path
                                d="M62.125 3.75H52.5444C52.5609 3.11663 52.625 2.52 52.625 1.875C52.625 0.824875 51.8001 0 50.75 0H32V53.6625H44.9751C44.9 53.4375 44.7501 53.2125 44.5625 53.0626C43.2875 51.75 38.1125 45.45 37.6625 36.3C40.5705 35.0604 43.1412 32.8599 45.2961 29.8943C55.6224 29.3379 64 20.8381 64 10.3748V5.625C64 4.58862 63.1614 3.75 62.125 3.75ZM60.25 10.3748C60.25 17.9265 54.8136 24.2373 47.7389 25.8353C50.5413 20.2576 51.8926 13.7576 52.3838 7.5H60.25V10.3748Z"
                                fill="#FABE2C"
                            />
                            <path
                                d="M34.9919 23.8494L31.9999 22.2948L29.0079 23.8494C28.3817 24.1717 27.6163 24.1186 27.0414 23.7029C26.7597 23.4985 26.5405 23.2195 26.4085 22.8973C26.2766 22.5752 26.237 22.2226 26.2943 21.8792L26.8437 18.5484L24.4451 16.1809C23.9229 15.6719 23.7633 14.9173 23.9763 14.2657C24.0844 13.9346 24.2824 13.6401 24.5482 13.4151C24.814 13.1901 25.1371 13.0433 25.4814 12.9913L28.8139 12.4896L30.3227 9.47381C30.9599 8.20306 33.0399 8.20306 33.6772 9.47381L35.1859 12.4896L38.5184 12.9913C38.8628 13.0434 39.1859 13.1901 39.4516 13.4152C39.7174 13.6402 39.9154 13.9347 40.0236 14.2657C40.1318 14.5969 40.1453 14.9517 40.0624 15.2902C39.9796 15.6286 39.8038 15.9372 39.5548 16.1809L37.1562 18.5484L37.7056 21.8792C37.7629 22.2226 37.7234 22.5752 37.5914 22.8973C37.4594 23.2195 37.2402 23.4985 36.9584 23.7029C36.3873 24.1168 35.6233 24.1779 34.9919 23.8494Z"
                                fill="#FABE2C"
                            />
                            <path
                                d="M34.992 23.8495C35.6235 24.178 36.3875 24.1169 36.9585 23.703C37.2403 23.4985 37.4594 23.2195 37.5914 22.8974C37.7234 22.5752 37.7629 22.2226 37.7056 21.8793L37.1562 18.5485L39.5549 16.181C39.8038 15.9372 39.9796 15.6287 40.0625 15.2902C40.1453 14.9518 40.1318 14.5969 40.0236 14.2658C39.9155 13.9347 39.7175 13.6402 39.4518 13.4152C39.186 13.1901 38.8629 13.0434 38.5185 12.9914L35.186 12.4896L33.6772 9.47388C33.3586 8.8385 32.6794 8.52075 32 8.52075V22.2949L34.992 23.8495Z"
                                fill="#FF9100"
                            />
                            <path
                                d="M47 64H17C15.9636 64 15.125 63.1614 15.125 62.125C15.125 61.0886 15.9636 60.25 17 60.25H47C48.0364 60.25 48.875 61.0886 48.875 62.125C48.875 63.1614 48.0364 64 47 64Z"
                                fill="#474F54"
                            />
                            <path
                                d="M47 60.25H32V64H47C48.0364 64 48.875 63.1614 48.875 62.125C48.875 61.0886 48.0364 60.25 47 60.25Z"
                                fill="#32393F"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_173_2071">
                                <rect width="64" height="64" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
                <button id="start" class="start px-4 py-1 border border-light fw-bold fs-5">Start</button>
               
                </div>
        `


        const style = document.createElement('style');
        style.textContent = `@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
		@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
        .cursor-pointer{
			cursor: pointer;
		}
        #tournament-mode {
            background: rgb(2,0,36);
            background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(0,0,0,1) 0%, rgba(1,53,44,1) 50%);
        }
        button.start {
            position: absolute;
            right: 4px;
            bottom: 4px;
			background: #fff;
            color: #000;
			font-family: "Orbitron", sans-serif;
			letter-spacing: 2px;
        }
        button:hover{
            background: transparent;
            color: #fff;
        }
        
        #close {
           background: rgb(2,100,36);
        }
        #close:hover {
				background: none;
			}
        input {
            outline: none !important;
        }
        input::placeholder {
            color: green !important;
        }
        #overlay {
			background: rgba(2, 13, 20, 1);
		}
        `;
        this.shadowRoot.innerHTML = ''
        this.shadowRoot.append(style, tournamentMode);
        this.shadowRoot.getElementById("start").addEventListener("click", () => {
            // this.isCreatingTournament = true;
            // this.render()
            navigateTo('tournament')
        })
        const closeBtn = this.shadowRoot.getElementById("close");
        if (closeBtn)
        {
            closeBtn.addEventListener("click", () => {
                this.isCreatingTournament = false;
                this.render()
            })
        }
        const tournamentName = this.shadowRoot.getElementById("tournament-name");
        const nickname = this.shadowRoot.getElementById("nickname");
        if (tournamentName && nickname)
        {
            tournamentName.addEventListener("input", () => {
                this.tournamentName = tournamentName.value;
            })
            nickname.addEventListener("input", () => {
                this.nickname = nickname.value;
            })
        }
        const createTourBtn = this.shadowRoot.getElementById("create-tournament");
        if (createTourBtn)
        {
            createTourBtn.addEventListener("click", () => {
                ////////console.log("Tournament name: ", this.tournamentName);
                ////////console.log("Nickname: ", this.nickname);
                this.createRoom(this.tournamentName).then(roomId => {
                    this.tournamentName = ""
                    this.nickname = ""
                    this.render()
                    
                });
            })
        }
    }

    async createRoom(roomName) {
        let response = await fetch(`http://localhost:8000/api/rooms/create-room/${roomName}/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${this.access_token}`,
            }
        });
        response = await handleAuthResponse(response, this.createRoom);
        if (response.ok) {
            const data = await response.json();
            if (data.success)
                return data.room_id;
            else
                console.error(data.message);
        } else if (!this.access_token) {
            navigateTo('signin');
        }
    }

    initSocket(){
		this.roomSocket = new WebSocket(`ws://localhost:8000/ws/rooms/?token=${this.access_token}`);
		this.roomSocket.onclose = function(event){
			console.log("Connected to the room socket")
		}
        this.roomSocket.onmessage = function(event){
            const data = JSON.parse(event.data);
            if (data.type === 'room_update') {
                console.log("Room update: ", data);
            }
        }
	}
}

customElements.define('tournament-mode', TournamentMode);
