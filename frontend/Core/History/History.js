class History extends HTMLElement {
	constructor() {
        super();
        this.attachShadow({ mode: 'open' });
		this.history = [];
		const history = document.createElement("div");
		history.className = "container text-light"
		history.id = "history-container"
		fetchHistory(window.UserData.id).then(data => {
			this.history = data;
			if (this.history.length > 0)
			{
				history.innerHTML = `
				<h1 class="mb-4">History</h1>
				<div id="history" class="container">
					${this.history ? this.history.map(result => result.player.score > result.opponent.score ? `<win-card result=${JSON.stringify(result)} ></win-card>` : `<loss-card result=${JSON.stringify(result)} ></loss-card>`).join("") : ``}
				</div>
				`
			}
			else {
				history.innerHTML = `
				<h1 class="mb-4">History</h1>
				<h2 id="no-history" class="fs-1 w-100  d-flex justify-content-center align-items-center">You Didn't Play any Game</h2>
				`
			}

		const style = document.createElement('style');
		style.textContent = `
    		@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
			#history-container
			{
				height: 100%;
			}
			#history {
				height: 80%;
				overflow-y: auto;
			}
			h1, h2 {
				font-family: "Orbitron", sans-serif;
			}
			#no-history 
			{
				height: 80%;
			}
		`;
		this.shadowRoot.append(style);
        this.shadowRoot.append(history);
		})
		
    }
}

customElements.define('history-page', History);