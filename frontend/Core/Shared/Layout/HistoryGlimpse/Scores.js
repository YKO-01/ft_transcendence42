class Scores extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.today = [];
		this.yesterday = [];
		this.custom = []
		this.inputValue = ""
		this.render()
	}
	async render() {
		let data = await getTodayHistory()
		this.today = data.slice(0, 3);
		data = null;
		data = await getYesterdatHistory()
		this.yesterday = data.slice(0, 3);
		const scores = document.createElement("div");
		scores.innerHTML = `<input type="date" id="input-value" value="${this.inputValue}" class="mb-4 align-self-end " ></input>`
		scores.id = "scores";
		const dates = [
			{ date: "Today", matches: this.today },
			{ date: "Yesterday", matches: this.yesterday },
		];
		dates.forEach(item => {
			const element = document.createElement("div");
			element.id = item.date;
			element.className = "mb-5";
			element.innerHTML = `<h3 class="mb-2 fw-light">${item.date}</h3>`;
			if (item.matches.length) {
				item.matches.forEach(match => {
					const isWinner = match.player.score > match.opponent.score ? JSON.stringify(true) : JSON.stringify(false);
					element.innerHTML += `<score-card userScore=${match.player.score}
						opponentScore=${match.opponent.score} isWinner=${isWinner} opponent_img=${match.opponent.image_url}></score-card>`
				})
			}
			else
				element.innerHTML += `<p class="text-warning fw-light">You haven't played any matches this date</p>`
			scores.append(element);
		})
		let selectionDate = {};
		
		selectionDate = { date: this.inputValue, matches: this.custom }
		const element = document.createElement("div");
		element.id = selectionDate.date;
		element.className = "mb-5";
		element.innerHTML = `<h3 class="mb-4 rounded fw-light text-dark bg-light px-2 py-1 fw-medium">${this.inputValue}</h3>`;
		if (selectionDate.matches.length) {
			selectionDate.matches.forEach(match => {
				const isWinner = match.player.score > match.opponent.score ? JSON.stringify(true) : JSON.stringify(false);
				element.innerHTML += `<score-card userScore=${match.player.score}
							opponentScore=${match.opponent.score} isWinner=${isWinner} opponent_img=${match.opponent.image_url}></score-card>`
			})
		}
		scores.append(element);
		

		const style = document.createElement('style');
		style.textContent = `@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			 @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
			h3 {
				font-family: "Orbitron", sans-serif;
				color: #F1F1F1;
			}
			#scores {
				height: 80%;
				overflow: auto;
			}
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
		this.shadowRoot.innerHTML = ''
		this.shadowRoot.append(style, scores);
		const inputField = this.shadowRoot.getElementById("input-value")
		inputField.addEventListener("input", () => {
			this.inputValue = inputField.value;
			fetchDateHistory(this.inputValue).then(res =>{ this.custom = res.slice(0, 3); this.render()})
		})
	}
}

customElements.define('scores-list', Scores);