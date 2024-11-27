class Dashboard extends HTMLElement {
	constructor() {
        super();
        this.attachShadow({ mode: 'open' });
		const dashboard = document.createElement("div");
		dashboard.className = "container"
		dashboard.innerHTML = `
			<div class="d-flex align-items-center mb-3">
                <h1 class="mb-0 text-light me-2">Game Modes</h1>
                <img class="mb-0 rounded" src="./Core/Dashboard/assets/modes.svg"></img>
            </div>
			<game-modes><game-modes>
		`
		// dashboard.innerHTML += `<tournaments-section></tournaments-section>`
		const style = document.createElement('style');
		style.textContent = `
    		@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			 @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
			h1{
				font-family: "Orbitron", sans-serif;
			}
			.cursor-pointer
			{
				cursor: pointer;
			}
		`;
		this.shadowRoot.append(style);
        this.shadowRoot.append(dashboard);
    }
}

customElements.define('dashboard-page', Dashboard);