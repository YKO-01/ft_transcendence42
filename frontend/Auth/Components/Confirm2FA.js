


class Confirm2FA extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const container = document.createElement("div")
        container.classList.add('container-form-content')
        container.innerHTML = `
        <div class="auth-otp-box">
            <h2 class="text-center text-light">Two-Factor Authentication</h2>
            <p class="text-center text-light">Enter the 6-digit code we sent to your Authenticator app.</p>

            <!-- 2FA Code Input Form -->
            <form action="#" method="POST" class="form-auth-otp" novalidate>
                <div class="mb-3">
                    <label for="authCode" class="form-label text-light">Authentication Code</label>
                    <input type="text" class="form-control" id="authCode" name="authCode"
                        placeholder="Enter 6-digit code" required>
                    <div class="invalid-feedback">
                        Please enter a valid 6-digit authentication code.
                    </div>
                </div>

                <div class="d-grid">
                    <button id="verify" class="btn btn-primary">Verify</button>
                </div>
            </form>
        </div>
        `
		const style = document.createElement("style");
		style.textContent = `
			@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			span {
				cursor: pointer;
			}
		`
        this.shadowRoot.append(style, container);
        this.shadowRoot.getElementById("verify").addEventListener("click",  (e)=> {
            e.preventDefault()
            //console.log(this.shadowRoot.querySelector("#authCode").value)
            validate2fa(this.shadowRoot.querySelector("#authCode").value).then(result => {
                //console.log(result.status);
                if(result.status === 200)
                {
                    //console.log(result);
                    navigateTo('/')
                    check_auth();
                }
                else
                {
                    //console.log(result.json());
                }
                // //console.log(result)
                // navigateTo('/')
                // check_auth();
            });
        })
        // this.shadowRoot.querySelector(".form-auth-otp").addEventListener('submit', async (event) => {
        //     event.preventDefault()
        //     const input = container.querySelector("#authCode")
        //     const feedback = container.querySelector(".invalid-feedback")
        //     input.addEventListener('focus', () => {
        //         input.classList.remove("is-invalid")
        //     })
        //     const otp = input.value
        //     const regex = /^\d{6}$/;
    
        //     if (regex.test(otp)) {
        //         try {
        //             // verify 2fa func
        //         } catch (error) {
        //             feedback.innerHTML = "Invalid Otp.";
        //             input.classList.add("is-invalid")
        //         }
        //     } else {
        //         input.classList.add("is-invalid")
        //     }
        // })
    }
}

customElements.define('fa-page', Confirm2FA);