class WinLossDraw extends HTMLElement {
	constructor() {
        super();
        this.attachShadow({ mode: 'open' });
		const stats = document.createElement("div");
		stats.className = "d-flex justify-content-between"
		stats.innerHTML = `
				<div class="stat win-stat mx-4">
					<p class="label mb-0 fs-4 fw-medium fs-5 text-success">W</p>
					<p class="value fs-4">${window.UserData.win_stats}</p>
				</div>
				<div class="stat loss-stat mx-4">
					<p class="label mb-0 fs-4 fw-medium fs-5 text-danger">L</p>
					<p class="value fs-4">${window.UserData.loss_stats}</p>
				</div>
		`
		const style = document.createElement('style');
		style.textContent = `
    		@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
			h1 {
				font-family: "Orbitron", sans-serif;
			}
			.cursor-pointer
			{
				cursor: pointer;
			}
		`;
		this.shadowRoot.append(style);
        this.shadowRoot.append(stats);
    }
}

customElements.define('win-loss-draw', WinLossDraw);