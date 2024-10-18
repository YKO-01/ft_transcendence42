class Scores extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const scores = document.createElement("div");
		const dates = [
			{date: "Today", matches: [{result:  "LOSS", opponent: "Ahmed Anogot"}, {result: "LOSS", opponent: "Amine l7atba"}]},
			{date: "Yesterday", matches: [{result: "WIN", opponent: "Ahmed Anogot"}, {result: "LOSS", opponent: "Amine l7atba"}]}, 
			{date: "6th, july 2000", matches: [{result: "WIN", opponent: "Ahmed Anogot"}, {result: "LOSS", opponent: "Amine l7atba"}]},
			];
		dates.forEach(item => {
			const element = document.createElement("div");
			element.id = item.date;
			element.className = "mb-5";
			element.innerHTML = `<h3 class="mb-3 text-white-50 fw-light">${item.date}</h3>`;
			item.matches.forEach(match => {
				element.innerHTML += `<score-card isWinner=${match.result == "WIN" ? true : false} ></score-card>`
			})
			scores.append(element);
		})
		const style = document.createElement('style');
        style.textContent = `@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');`;
			
        this.shadowRoot.append(style, scores);
    }
}

customElements.define('scores-list', Scores);