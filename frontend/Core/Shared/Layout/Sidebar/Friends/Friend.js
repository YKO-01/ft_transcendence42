class Friend extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.render()
	}

	render() {
		const name = this.getAttribute("name");
		const img_url = this.getAttribute("img_url")
		const id = this.getAttribute("id");
		window.UserData.online = true;
		const friend = document.createElement('div');
		friend.className = "d-flex align-items-center justify-content-between mb-2";

		friend.innerHTML = /*html*/ `
            <div class="d-flex align-items-center position-relative">
				${window.UserData.online ? `<span id="online-status" class=""></span>` : `<span id="offline-status" class=""></span>`}
                <img src="${img_url}" class="rounded me-2" height='32'></img>
                <span class="fs-6 fw-medium text-dark-emphasis">
                    ${name.length > 8 ? name.substring(0, 8) + "..." : name}
                </span>
            </div>
			<div>
				
            	<img id="invite" class='invite ${id} cursor-pointer' src="./Core/Shared/assets/plus.svg" id width="24" height="24"></img>
			</div>
			`;
		// 
		const style = document.createElement('style');
		style.textContent = `
            @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
            .cursor-pointer {
                cursor: pointer;
            }
            #invite {
                background: #062E00;
                border-radius: 4px;
            }
            #invite:hover {
                background: #000;
            }
			#online-status, #offline-status
			{
				top: -2px;
				left: -2px;
				border-radius: 24px;
				position: absolute;
				width: 12px;
				height: 12px;
				background: #12d63c;
			}
			#offline-status {
				background: red;
			}
        `;

		this.shadowRoot.append(style, friend);
		this.shadowRoot.getElementById("invite").addEventListener("click", (e) => {
			//console.log(id);
			sendNotification(JSON.stringify({
				"user": id,
				"sender": window.UserData.id,
				"content": `${window.UserData.username} sent you an invitation to play a game`,
				"fulfill_link": "/online-game",
				"reject_url": "reject url action",
				"is_invite": "true"
			})).then(data => {//console.log(data); navigateTo("online-game")})
				navigateTo("online-game")
			})
		})
	}
}

// Define the custom element
customElements.define('single-friend', Friend);