class Input extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const input = document.createElement('input');
        input.type = this.getAttribute('type') || 'text';
		input.placeholder = this.getAttribute('placeholder') || '';
		const style = document.createElement('style');
        style.textContent = `
            input {
                font-weight: 500;
			border-radius: 4px;
			font-size: 1rem;
			border: 1px solid;
			width: 340px;
			margin-bottom: 1rem;
			height: 40px;
			background: transparent;
			border-color: rgb(26, 220, 26);
			color: #ffffff;
			padding-left: 1rem;
            }`;
        this.shadowRoot.append(style, input);
    }
}

customElements.define('auth-input', Input);