class MenuLink extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const menuLink = document.createElement('div');
		menuLink.className = " fs-5 cursor-pointer mb-0 px-2 rounded  fw-medium d-flex align-items-center";
        menuLink.id = "link";
        menuLink.innerHTML = `
            <img class="me-3 p-2 rounded" src=${this.getAttribute("ico")}></img>
            <p class="mb-0">${this.getAttribute("title")}</p>
        `
		const style = document.createElement('style');
        style.textContent = `
			@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			.cursor-pointer
			{
				cursor: pointer;
			}
            #link {
                color: #000;
            }
            #link:hover {
                img {
                    background: #fff;
                }
            }
		`;
        this.shadowRoot.append(style, menuLink);
    }
}

customElements.define('menu-link', MenuLink);