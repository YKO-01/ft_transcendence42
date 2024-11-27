class Signin extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const form = document.createElement('form');
		form.action = "#"
		form.innerHTML = `
			<div class="border-bottom d-flex justify-content-center align-items-center flex-column  pb-4 mb-4">
				<auth-input type="email" name="email" id="email" placeholder="Email"></auth-input>
				<auth-input type="password" name="password" id="password" placeholder="Password"></auth-input>
				<p class="text-light text-end w-100 cursor-pointer">Forgot password?</p>
				<auth-btn title="Sign in" alt="sign in" onclick="LogIn()" ></auth-btn>
			</div>
			<div>
				<auth-method logo-src="./Auth/Assets/42-ico.svg" method="Intra" onclick='LogIn42()'></auth-method>
				<p class="text-light text-center mt-4">Don't have an account?<span onclick="navigateTo('signup')" class="ms-2 text-success cursor-pointer text-decoration-underline">Sign up</span></p>
			</div>
		`
		const style = document.createElement("style");
		style.textContent = `
			@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			span {
				cursor: pointer;
			}
		`
        this.shadowRoot.append(style, form);
    }
}

customElements.define('signin-page', Signin);