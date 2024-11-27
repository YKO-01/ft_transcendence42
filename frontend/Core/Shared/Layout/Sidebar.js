class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
		//console.log(JSON.stringify(window.UserData.friends));	
        const sidebar = document.createElement('div');
		sidebar.id = "sidebar"
		sidebar.className = `${this.getAttribute("class")} p-3 vh-100`;
		sidebar.innerHTML += `<div id="overlay" class="position-absolute top-0 bottom-0 start-0 end-0 bg-dark" ></div>`
		sidebar.innerHTML += `<sidebar-header></sidebar-header>`;
		sidebar.innerHTML += `<friends-section data="${(window.UserData.friends)}"></friends-section>`;
		const style = document.createElement('style');
        style.textContent = `
			@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			.cursor-pointer
			{
				cursor: pointer;
			}
			#overlay{
				z-index: -1;
			}
			#sidebar {
				background: #E0EDF2;
			}
		`;
        this.shadowRoot.append(style, sidebar);
    }
}

customElements.define('layout-sidebar', Sidebar);