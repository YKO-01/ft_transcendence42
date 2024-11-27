class Header extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const header = document.createElement("div");
		header.className = "d-flex py-2 justify-content-between align-items-end"
		header.innerHTML = `<h1>History</h1>
							<p id="view-matches" class=" me-4 cursor-pointer" onclick="navigateTo('history')">View All Matches</p>
						`;
		const style = document.createElement('style');
        style.textContent = `@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
         .cursor-pointer{cursor: pointer;
        }
        h1 {
            font-family: "Orbitron", sans-serif;
        }
		p {
			color: #D6D6D6;
		}
        `;
			
        this.shadowRoot.append(style, header);
    }
}

customElements.define('history-header', Header);