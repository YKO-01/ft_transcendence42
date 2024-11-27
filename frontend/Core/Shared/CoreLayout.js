class CoreLayout extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
	}
	connectedCallback() {
		if (window.UserData) {
			this.renderCoreLayout();
		} else {
			this.userDataInterval = setInterval(() => {
				if (window.UserData) {
					clearInterval(this.userDataInterval);
					this.renderCoreLayout();
				}
			}, 100);
		}
	}

	renderCoreLayout() {
		const container = document.createElement("div");
		container.className = `d-flex core vw-100 vh-100`;
		container.id = "container"
		const main = document.createElement("div");
		main.className = "main text-primary" ;
		main.innerHTML += `<dashbboard-header></dashbboard-header>`
		const children = Array.from(this.children);
        children.forEach(child => {
            child.classList.add("container");
            main.append(child);
        });
		container.append(main);
		const showHistory = this.getAttribute("showHistory");
		container.innerHTML += `<history-glimpse ${JSON.parse(showHistory) && "class='history'"} showHistory=${showHistory}></history-glimpse>`
		container.innerHTML += `<layout-sidebar class="sidebar"></layout-sidebar>`;
		const style = document.createElement('style');
		style.textContent = `	
    		@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			#container {
				overflow: hidden;
			}
			.cursor-pointer
			{
				cursor: pointer;
			}
			.core {
				background: #020D14;
				color: #fff;
			}
			.main {
				flex: 6;
			}
			.history {
				flex: 2;
			}
			.sidebar {
				flex: 1;
				color: #000;
				font-size: 2rem;
				max-width: 284px;
			}
		`;
        this.shadowRoot.append(container);
		this.shadowRoot.append(style);
    }
}

customElements.define('core-layout', CoreLayout);