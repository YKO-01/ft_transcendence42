class Btn extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const button = document.createElement('button');
        button.type = "submit";
		button.textContent = this.getAttribute("title");
		const ico = document.createElement("img");
		ico.src = "./Auth/Assets/signin-ico.svg";
		ico.alt = this.getAttribute("alt");
		button.append(ico);
		const style = document.createElement('style');
        style.textContent = `
		@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			button {
				margin-bottom: 0.4rem;
                transition: 0.3s;
				border: none;
				background: #159800;
				border: #159800 1px solid;
				width: 360px;
				max-width: 360px;
				color: #fff;
				font-weight: bold;
				font-size: 1rem;
				padding: 0.5rem 1rem;
				border-radius: 4px;
				cursor: pointer;
				display: flex;
				justify-content: center;
				align-items: center;
            }
			button:hover
			{
				background: #0d6300;
				border: #0d6300 1px solid;
			}
			img {
				margin-left: 0.5rem;
			}
        `;
        this.shadowRoot.append(style, button);
    }
}


customElements.define('auth-btn', Btn);