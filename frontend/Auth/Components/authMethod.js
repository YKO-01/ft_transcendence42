
class AuthMethod extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const div = document.createElement('div');
		div.classList.add("signin-method");
        const overlay = document.createElement('div');
		overlay.classList.add("btn-overlay")
		const p = document.createElement("p")
		p.textContent = "Sign in with " + this.getAttribute("method");
		const img = document.createElement("img");
		img.src = this.getAttribute("logo-src");
		img.alt = p.textContent;
		// styles
		const style = document.createElement('style');
        style.textContent = `
			.signin-method
			{
				display: flex;
				align-items: center;
				overflow: hidden;
				position: relative;
				border: 1px solid #fff;
				margin-bottom: 1rem;
				border-radius: 4px;
				cursor: pointer;
				height: 44px;
				width: 360px;
				max-width: 360px;
				color: #fff;
			}
			.btn-overlay
			{
				position: absolute;
				top: 0;
				right: 0;
				left: 0;
				bottom: 0;
			}
			.signin-method img {
				position: absolute;
				right: 0;
				bottom: 0;
				top: 0;
				height: 100%;
			}
			.signin-method p {
				font-size: 1rem;
				font-weight: 400;
				z-index: 1;
				user-select: none;
				margin-left: 1rem;
			}
			.signin-method:hover
			{
				color: #000;
				.btn-overlay {
					z-index: -1;
					background: #fff;
				}
			}
        `;
        this.shadowRoot.append(style);
		div.append(overlay);
		div.append(p);
		div.append(img)
		this.shadowRoot.append(div);
    }
}


customElements.define('auth-method', AuthMethod);