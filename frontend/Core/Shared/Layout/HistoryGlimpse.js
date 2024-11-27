class HistoryGlimpse extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		
		this.render()
	}
	render ()
	{
		const history = document.createElement("div");
		const showHistory = JSON.parse(this.getAttribute("showHistory"));
		history.className = `history ${this.getAttribute("class")} w-100 h-100 ${!showHistory && "invisible"} p-2`;
		history.innerHTML = `<history-header></history-header>`
		// history.innerHTML += `<input type="date" id="input-value" value="${this.inputValue}" class="mb-4 align-self-end " ></input>`
		history.innerHTML += `<scores-list  ></scores-list>`
		const style = document.createElement('style');
		style.textContent = `
			@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			input {
				color: #fff;
				cursor: pointer;
				outline: none;
				background: none;
				border: 2px solid #fff;
				padding: 0.4rem 1rem;
				border-radius: 2px;
				display: flex;
				align-items: center;
			}
			::-webkit-datetime-edit-text { padding: 0 0.3em; }
			input::-webkit-calendar-picker-indicator {
				color: rgba(0, 0, 0, 0);
				opacity: 1;
				display: inline-block;
				background: url(./Core/Shared/assets/calendar.svg) no-repeat;
				width: 24px;
				height: 24px;
				background-position: center;
				cursor: pointer;
			}
		`;
		this.shadowRoot.append(style, history);
	}
}

customElements.define('history-glimpse', HistoryGlimpse);