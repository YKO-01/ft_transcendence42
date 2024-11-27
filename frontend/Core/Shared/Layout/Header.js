class dashHeader extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.isSettingsModalOpen = false;
		this.headerTopOffset = 0;
		this.headerHeight = 0;
		this.headerWidth = 0;
		this.leftOffset = 0;
		this.isNotifOpen = false;
		this.notifications = [];
		this.access_token = localStorage.getItem("access_token")
		this.render();
	}

	render() {
		const header = document.createElement('div');
		header.className = "container d-flex justify-content-between align-items-center py-3";
		const notificationsHTML = this.notifications.map(notification => `
		<div id="notification" class="max-w-100 w-100 d-flex justify-content-between align-items-center px-2 mb-1">
			<p class="mb-0 fw-medium">${notification.content}</p>
			<div class="d-flex justify-content-center py-2 h-100">
				<svg width="32" notification_id="${notification.id}" invite=${notification.is_invite} url="${notification.fulfill_link}${notification.sender}/" content="${notification.sender}" id="accept-btn-notification" class="me-2 cursor-pointer" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="32" height="32" rx="4" fill="#18C064" />
					<path d="M24 10L13 21L8 16" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<img id="reject-btn-notification" notification_id="${notification.id}" invite=${notification.is_invite} url="${notification.reject_link}${notification.sender}/" content="${notification.sender}" alt="Free Cross Icon" width="32" class="cursor-pointer" src="https://cdn.iconscout.com/icon/free/png-256/free-cross-icon-download-in-svg-png-gif-file-formats--reject-decline-cancel-close-ui-ux-pack-user-interface-icons-5893356.png?f=webp&amp;w=256" srcset="https://cdn.iconscout.com/icon/free/png-256/free-cross-icon-download-in-svg-png-gif-file-formats--reject-decline-cancel-close-ui-ux-pack-user-interface-icons-5893356.png?f=webp&amp;w=256 1x, https://cdn.iconscout.com/icon/free/png-256/free-cross-icon-download-in-svg-png-gif-file-formats--reject-decline-cancel-close-ui-ux-pack-user-interface-icons-5893356.png?f=webp&amp;w=512 2x">
			</div>
		</div>
	`).join('');
		header.innerHTML = `
            <img onclick="navigateTo('/')" src="./Core/Shared/assets/logo.svg" class="cursor-pointer" alt="ping pong logo"></img>
            <nav-menu isSettingsModalOpen="${this.isSettingsModalOpen}"></nav-menu>
            <div class="me-4" id="access">
				<img src="./Core/Shared/assets/message-circle.svg" class="cursor-pointer me-2" onclick="navigateTo('messages')"></img>
				<img id="notif-btn" src="./Core/Shared/assets/notification.svg" class="cursor-pointer"></img>
			</div>
			${this.isNotifOpen ? `<div class="position-absolute z-1 text-secondary mt-2 p-1" id="notifications-container">${notificationsHTML}</div>` : ``}
        `
		const style = document.createElement('style');
		style.textContent = `@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
		.cursor-pointer{
			cursor: pointer;
		}
		#notifications-container
		{
			border-radius: 8px;
			background: #0c1f2f;
			top: ${this.headerTopOffset + this.headerHeight}px;
			left: ${this.leftOffset - this.headerWidth * 2}px;
			height : auto;
			max-height: 360px;
			width: 360px;
			max-width: 360px;
			overflow: auto;
		}
		#notification
		{
			border-radius: 8px;
			background: #0e3354;
			font-size: 0.9rem;
			
		}
		#notification p
		{
			color: #fff;
			max-width: 80%;
		}
		`;
		this.shadowRoot.innerHTML = ""
		this.shadowRoot.append(style, header);
		const notifbtn = this.shadowRoot.getElementById("notif-btn");
		if (notifbtn) {
			notifbtn.addEventListener("click", () => {
				this.isNotifOpen = !this.isNotifOpen;
				if (this.shadowRoot.getElementById("access")) {
					const dimensions = this.shadowRoot.getElementById("access").getBoundingClientRect();
					this.headerTopOffset = dimensions.top;
					this.headerHeight = dimensions.height;
					this.headerWidth = dimensions.width;
					this.leftOffset = dimensions.left;
				}
				fetchNotifications().then(result => {
					//console.log(result);
					this.notifications = result;
					this.render()
					this.addNotificationListeners();
				})

			})
		}
	}
	addNotificationListeners(sender) {
		const acceptBtns = this.shadowRoot.querySelectorAll("#accept-btn-notification");

		acceptBtns.forEach(btn => {
			btn.addEventListener("click", async () => {
				const isInvite = btn.getAttribute("invite");
				if (JSON.parse(isInvite))
					navigateTo("/online-game")
				else {
					let response = await fetch(btn.getAttribute("url"), {
						method: 'GET',
						credentials: 'include',
						headers: {
							'Authorization': `Bearer ${this.access_token}`,
						}
					});
					btn.parentNode.parentNode.remove()
					const data = await response.json()
					window.UserData = data.data
					// document.querySelector("#app > core-layout").shadowRoot.querySelector("#container > layout-sidebar").shadowRoot.querySelector("#sidebar > friends-section").shadowRoot.querySelector("div > friends-list").update()
				}
				await deleteNotification(btn.getAttribute("notification_id"))
			});
		});
		const rejectBtns = this.shadowRoot.querySelectorAll("#reject-btn-notification");
		rejectBtns.forEach(btn => {
			btn.addEventListener("click", async () => {
				const isInvite = btn.getAttribute("invite");
				if (!JSON.parse(isInvite)) {
					let response = await fetch(btn.getAttribute("url"), {
						method: 'GET',
						credentials: 'include',
						headers: {
							'Authorization': `Bearer ${this.access_token}`,
						}
					});
					btn.parentNode.parentNode.remove()
				}
				await deleteNotification(btn.getAttribute("notification_id"))
			});
		});
	}
}

customElements.define('dashbboard-header', dashHeader);