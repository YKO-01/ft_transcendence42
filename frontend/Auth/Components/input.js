class Input extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
		
        const input = document.createElement('input');
        input.type = this.getAttribute('type') || 'text';
		input.placeholder = this.getAttribute('placeholder') || '';
		input.id = this.getAttribute("id") || "";
		input.name = this.getAttribute("name") || "";
		const style = document.createElement('style');
        style.textContent = `
		@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
            input {
                font-weight: 500;
			border-radius: 4px;
			font-size: 1rem;
			border: 1px solid;
			width: 360px;
			margin-bottom: 1rem;
			height: 40px;
			background: transparent;
			border-color: rgb(26, 220, 26);
			color: #ffffff;
			padding-left: 1rem;
            }
			input::placeholder {
				color: #eeeeee;
				font-weight: 200;
			}
			`;
			
        this.shadowRoot.append(style, input);
    }
}

customElements.define('auth-input', Input);