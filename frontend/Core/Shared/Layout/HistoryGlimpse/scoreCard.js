class ScoreCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const scoreCard = document.createElement('div');
		const result = JSON.parse(this.getAttribute('isWinner'));
		const scores = {
			player: this.getAttribute('userScore'),
			opponent: this.getAttribute('opponentScore'),
		}
		scoreCard.className = `d-flex justify-content-between align-items-center me-4 mb-2 px-2 border-end ${result ? "border-success" : "border-danger"} border-5`;
		scoreCard.innerHTML = `
			<img src="${this.getAttribute("opponent_img")}" class="rounded" height='44'></img>
			<div class="d-flex">
				<span class="mx-2 text-light fw-bold">${scores.opponent}</span>
				<span class="mx-2">-</span>
				<span class="mx-2 text-light fw-bold">${scores.player}</span>
			</div>
			<span class="fw-semibold">${ result ? "Win" : "Loss"}</span>
		`
		const style = document.createElement('style');
        style.textContent = `@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'); .cursor-pointer{cursor: pointer;}`;

        this.shadowRoot.append(style, scoreCard);
    }
}

customElements.define('score-card', ScoreCard);