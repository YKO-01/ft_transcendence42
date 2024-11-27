class GameMode extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const mode = document.createElement('div');
		mode.id = "mode"
		mode.className = "cursor-pointer p-5 position-relative d-flex justify-content-center align-items-center rounded " + this.getAttribute("class");
        const title = this.getAttribute("title")
        mode.innerHTML = `
            <p class="fw-medium text-light fs-3">${title}</p>
            ${title !== "Tournament" ?  `<svg class="cursor-pointer" width="36" height="36" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            	<path fill-rule="evenodd" clip-rule="evenodd" d="M6.38281 5.00485L8.13181 4.06885L20.1318 12.0683V13.9403L8.13181 21.9413L6.38281 21.0053V5.00485ZM8.63281 7.10635V18.9023L17.4798 13.0043L8.63281 7.10635Z" fill="white"/>
            </svg>`
			: `<svg class="tournament-ico" width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M7.33337 25.1617V23.1617H9.33337V19.8284H7.33337V17.8284H11.3334V20.495H12.6667V12.495H11.3334V15.1617L7.33337 15.1617V13.1617H9.33337V9.82837H7.33337V7.82837H11.3334V10.495H14.6667V15.1617H17.3334V10.495H20.6667V7.82837H24.6667V9.82837H22.6667V13.1617H24.6667V15.1617H20.6667V12.495H19.3334V20.495H20.6667V17.8284L24.6667 17.8283V19.8284H22.6667V23.1617H24.6667V25.1617H20.6667V22.495H17.3334V17.8284H14.6667V22.495H11.3334V25.1617H7.33337Z" fill="#00B882"/>
		</svg>`}								
        `
		const style = document.createElement('style');
        style.textContent = `@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
		p{
			font-family: "Orbitron", sans-serif;
		}
        .cursor-pointer{
			cursor: pointer;
		}
		#mode {
			border: 2px solid ${this.getAttribute("color")};
			${title === "Tournament" && `width: 420px;`};
		}
        svg {
            position: absolute;
            right: 10px;
            bottom: 8px;
        }
        `;
        this.shadowRoot.append(style, mode);
    }
}

customElements.define('game-mode', GameMode);