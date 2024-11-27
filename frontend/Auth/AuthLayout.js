class authLayout extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
		const container = document.createElement("div");
		container.className = "container d-flex justify-content-between flex-column vh-100";
		const logoSpan = document.createElement('span');
        logoSpan.className = 'cursor-pointer';
        logoSpan.addEventListener('click', () => navigateTo('signin'));
        const logoImg = document.createElement('img');
        logoImg.src = './Auth/Assets/logo.svg';
        logoImg.className = 'logo ';
        logoImg.alt = 'ping pong logo';
        logoSpan.appendChild(logoImg);
        
        const formContainer = document.createElement('div');
        formContainer.id = 'form-container';
        formContainer.className = 'signin-form-container d-flex flex-column justify-content-center align-items-center';
    
        while (this.firstChild) {
            formContainer.appendChild(this.firstChild);
        }

        const footer = document.createElement('div');
        footer.className = 'd-flex justify-content-between align-items-center footer';
        const signinLogo = document.createElement('img');
        signinLogo.src = './Auth/Assets/signin-logo.svg';
        signinLogo.id = 'signin-logo';
        const signupLogo = document.createElement('img');
        signupLogo.src = './Auth/Assets/signup-logo.svg';
        signupLogo.id = 'signup-logo';
        const heading = document.createElement('h1');
        heading.className = 'text-success fs-1';
        heading.textContent = 'PING PONG ...';
		if (this.getAttribute("route") == "Sign up")
		{
			signinLogo.className = "d-none";
			signupLogo.className =  "";
		}
		else {
			signinLogo.className = "";
			signupLogo.className =  "d-none";
		}
		const style = document.createElement('style');
		style.textContent = `
    		@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			.cursor-pointer
			{
				cursor: pointer;
			}
		`;
		this.shadowRoot.append(style);
        footer.append(signinLogo, signupLogo, heading);
        container.append(logoSpan, formContainer, footer);
        this.shadowRoot.append(container);
    }
}

customElements.define('auth-layout', authLayout);