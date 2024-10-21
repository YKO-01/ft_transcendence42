{/* <div class="signin-method">
						<div class="btn-overlay"></div>
						<p>Sign in with Intra</p>
						<img src="assets/42-ico.svg" alt="">
</div> */}


class AuthMethod extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const div = document.createElement('div');
		div.classList.add("signin-method");
        const overlay = document.createElement('div');
		overlay.classList.add("btn-overlay")
		const p = document.createElement("p")
		p.textContent = "Sign in with" + this.getAttribute("method");
		const img = document.createElement("img")
		img.src = this.getAttribute("logo-src");
		img.alt = p.textContent;
		// styles
		const style = document.createElement('style');
        style.textContent = `
			.signin-method:hover
			{
				.btn-overlay {
					z-index: -1;
					animation-name: slidein;
					animation-duration: 0.5s;
					animation-timing-function: ease-out;
					background: #ffffff;
				}
			}
			.signin-method
			{
				overflow: hidden;
				position: relative;
				border: 1px solid #fff;
				margin-bottom: 1rem;
				padding: 0.5rem 1rem;
				border-radius: 4px;
				display : flex;
				color: #fff;
				cursor: pointer;
				width:50%;
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
				font-weight: 400;
				z-index: 1;
				user-select: none;
			}
        `;
		div.append(overlay);
		div.append(p);
		div.append(img)
        this.shadowRoot.append(style, div,overlay, p, img);
    }
}


customElements.define('auth-method', AuthMethod);