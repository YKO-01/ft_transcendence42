class Draw extends HTMLElement {
	constructor() {
        super();
        this.attachShadow({ mode: 'open' });
		const draw = document.createElement("div");
		draw.className = "w-100 d-flex align-items-center justify-content-between px-2"
		draw.id = "draw"
		draw.innerHTML = `
				<div class="d-flex align-items-center">
					<img src="./Core/Shared/assets/avatar.jpg" class="mb-0 me-2	rounded" width="56" ></img>
					<p class="mb-0 fs-5 fw-medium">NoobMaster69</p>
				</div>
				<div class="mb-0 d-flex align-items-center fw-bold fs-3 w-25 justify-content-between px-4"> <span class="d-inline-block fs-3">8</span> -  <span class="d-inline-block fs-3">8</span></div>
				<div class="d-flex align-items-center">
					<p class="mb-0 me-2 fs-5 fw-medium">${window.UserData.username}</p>
					<img src=${window.UserData['img_url']} class="m-0 rounded" width="56" ></img>
				</div>
		`
		const style = document.createElement('style');
		style.textContent = `
    		@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
			div {
				border-radius: 4px;
				height: 64px;
				margin-bottom: 4px;
			}
			#draw {
				border-right: 8px solid gray;
				background: rgb(157,157,157);
				background: -moz-linear-gradient(90deg, rgba(157,157,157,1) 0%, rgba(108,89,104,1) 100%);
				background: -webkit-linear-gradient(90deg, rgba(157,157,157,1) 0%, rgba(108,89,104,1) 100%);
				background: linear-gradient(90deg, rgba(157,157,157,1) 0%, rgba(108,89,104,1) 100%);
				filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#9d9d9d",endColorstr="#6c5968",GradientType=1);
			}
		`;
		this.shadowRoot.append(style);
        this.shadowRoot.append(draw);
    }
}

customElements.define('draw-card',  Draw);