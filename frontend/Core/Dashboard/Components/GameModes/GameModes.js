class GameModes extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const modes = document.createElement('div');
		modes.className = "  container mb-3 d-flex flex-column position-relative";
        modes.innerHTML = `<div id="modes" class="mb-3 ">
                <game-mode class="mode" color="#CD0024" onclick="navigateTo('cpu-game')" title="CPU" ></game-mode>
                <game-mode class="mode" color="#B98500" onclick="navigateTo('online-game')" id="online" title="Online"></game-mode>
                <game-mode class="mode" color="#5510BF" onclick="navigateTo('offline-game')" title="Offline"></game-mode>
            </div>
            <tournament-mode></tournament-mode>							
        `
		const style = document.createElement('style');
        style.textContent = `@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
        .cursor-pointer{
			cursor: pointer;
		}
        #modes {
			display: flex;
			width: 100%;
			max-width: 100%;
            gap: 8px;
        }
		.mode {
			flex: 1;
    		flex-grow: 1;
        }
        `;
        this.shadowRoot.append(style, modes);
    }
}

customElements.define('game-modes', GameModes);