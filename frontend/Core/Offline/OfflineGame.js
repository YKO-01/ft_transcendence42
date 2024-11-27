class OfflineGame extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.isMultiplayer = true;
		this.ChangeStatus = false;
		this.player1Score = 0;
		this.player2Score = 0;
		this.winningScore = 5;

		this.render();
	}

	render() {
		const cpuGame = document.createElement("div");
		cpuGame.className = "container text-light position-relative";
		cpuGame.id = "cpu-game";
		cpuGame.innerHTML = `
		<div class="d-flex mb-5">
			<button id="multiplayerButton" class="modeBtn ${this.isMultiplayer ? 'activeBtn' : ''} me-2 p-2 fw-medium">Multiplayer Mode</button>
			<button id="singleplayerButton" class="modeBtn ${!this.isMultiplayer ? 'activeBtn' : ''} p-2 fw-medium">Single Player Mode</button>
		</div>
		<div class="w-100 d-flex justify-content-between align-items-center my-4 text-light">
			<span id="player1" class="bg-primary p-2 px-4 rounded fs-5">player 1</span>
			<div id="scoreBoard" class="fs-3">
				<span id="leftScore" class="fw-sem px-2">0</span> - <span id="rightScore" class="fw-sem px-2">0</span>
			</div>
			<span id="player2" class="bg-danger p-2 px-4 rounded fs-5">${this.isMultiplayer ? 'player 2' : 'Bot'}</span>
		</div>
		<div id="trophy" class="trophy-container hidden">
			<div class="trophy">
				🏆
			</div>
			<div class="winner-text"></div>
		</div>
		<canvas id="gameCanvas" height="400" width="800" class="w-100 h-100 border"></canvas>`;
		
		const style = document.createElement('style');
		style.textContent = `
			@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');

			.modeBtn {
				border: 1px solid #fff;
				background: transparent;
				color: #fff;
			}
			.activeBtn {
				background: #2dab11;
				border: 1px solid #2dab11;
			}
			.trophy-container {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				text-align: center;
				z-index: 1000;
				background: rgba(0, 0, 0, 0.8);
				padding: 2rem;
				border-radius: 1rem;
				border: 2px solid #ffd700;
			}
			.trophy {
				font-size: 6rem;
				margin-bottom: 1rem;
				animation: bounce 1s infinite;
			}
			.winner-text {
				font-size: 2rem;
				color: #ffd700;
				font-weight: bold;
				font-family: 'Orbitron', sans-serif;
			}
			.hidden {
				display: none;
			}
			@keyframes bounce {
				0%, 100% { transform: translateY(0); }
				50% { transform: translateY(-20px); }
			}
		`;

		this.shadowRoot.innerHTML = '';
		this.shadowRoot.append(style);
		this.shadowRoot.append(cpuGame);

		// Get trophy elements
		const trophy = this.shadowRoot.getElementById('trophy');
		const winnerText = trophy.querySelector('.winner-text');

		// BUTTONS
		const singleplayerButton = this.shadowRoot.getElementById("singleplayerButton");
		const multiplayerButton = this.shadowRoot.getElementById("multiplayerButton");

		// function resetGame(){
		// 	trophy.classList.add('hidden');
		// 	// updateScore();
		// 	this.render();
		// };

		singleplayerButton.addEventListener('click', () => {
			this.isMultiplayer = false;
			// resetGame();
			this.render();
		});
		
		multiplayerButton.addEventListener('click', () => {
			this.isMultiplayer = true;
			//console.log('multi_player :' );
			// resetGame();
			this.render();
		});

		// CANVAS and GAME LOGIC
		const canvas = this.shadowRoot.getElementById("gameCanvas");
		const leftScore = this.shadowRoot.getElementById('leftScore');
		const rightScore = this.shadowRoot.getElementById('rightScore');

		if (canvas.getContext) {
			const ctx = canvas.getContext('2d');
			const paddleWidth = 5, paddleHeight = 70;
			const ballSize = 7;
			let ballX = canvas.width / 2, ballY = canvas.height / 2;
			let ballSpeedX = 4, ballSpeedY = 4;

			const leftPaddle = {
				x: 0,
				y: (canvas.height - paddleHeight) / 2,
				speed: 5,
				moveUp: false,
				moveDown: false,
				score: 0
			};

			const rightPaddle = {
				x: canvas.width - paddleWidth,
				y: (canvas.height - paddleHeight) / 2,
				speed: 5,
				moveUp: false,
				moveDown: false,
				score: 0
			};

			function showWinner(winner) {
				trophy.classList.remove('hidden');
				winnerText.textContent = `${winner} Wins!`;
			}

			function checkWinner() {
				if (leftPaddle.score >= 5) {
					showWinner('Player 1');
					return true;
				} else if (rightPaddle.score >= 5) {
					showWinner(this.isMultiplayer ? 'Player 2' : 'Bot');
					return true;
				}
				return false;
			}

			function drawPaddle(paddle) {
				ctx.fillStyle = 'white';
				ctx.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);
			}

			function drawBall() {
				ctx.fillStyle = 'white';
				ctx.strokeStyle = "white";
				ctx.beginPath();
				ctx.roundRect(ballX, ballY, ballSize, ballSize, 100);
				ctx.stroke();
				ctx.fill();
			}

			function updateScore() {
				leftScore.textContent = leftPaddle.score;
				rightScore.textContent = rightPaddle.score;
			}

			function movePaddles() {
				if (leftPaddle.moveUp && leftPaddle.y > 0) {
					leftPaddle.y -= leftPaddle.speed;
				}
				if (leftPaddle.moveDown && leftPaddle.y < canvas.height - paddleHeight) {
					leftPaddle.y += leftPaddle.speed;
				}
				if (this.isMultiplayer) {
					if (rightPaddle.moveUp && rightPaddle.y > 0) {
						rightPaddle.y -= rightPaddle.speed;
					}
					if (rightPaddle.moveDown && rightPaddle.y < canvas.height - paddleHeight) {
						rightPaddle.y += rightPaddle.speed;
					}
				} else {
					if (ballY > rightPaddle.y + paddleHeight / 2 && rightPaddle.y < canvas.height - paddleHeight) {
						rightPaddle.y += rightPaddle.speed;
					} else if (ballY < rightPaddle.y + paddleHeight / 2 && rightPaddle.y > 0) {
						rightPaddle.y -= rightPaddle.speed;
					}
				}
			}

			function moveBall() {
				ballX += ballSpeedX;
				ballY += ballSpeedY;

				if (ballY <= 0 || ballY >= canvas.height - ballSize) {
					ballSpeedY = -ballSpeedY;
				}

				if (
					(ballX <= leftPaddle.x + paddleWidth && ballY + ballSize >= leftPaddle.y && ballY <= leftPaddle.y + paddleHeight) ||
					(ballX + ballSize >= rightPaddle.x && ballY + ballSize >= rightPaddle.y && ballY <= rightPaddle.y + paddleHeight)
				) {
					ballSpeedX = -ballSpeedX;
				}

				if (ballX < 0) {
					rightPaddle.score++;
					resetBall();
				}

				if (ballX > canvas.width) {
					leftPaddle.score++;
					resetBall();
				}

				updateScore();
			}

			function resetBall() {
				ballX = canvas.width / 2;
				ballY = canvas.height / 2;
				ballSpeedX = -ballSpeedX;
			}

			function gameLoop() {
				if(this.ChangeStatus)
				{
					leftPaddle.score = 0;
					rightPaddle.score = 0;
					this.ChangeStatus = false;
					// resetGame();
				}
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				drawPaddle(leftPaddle);
				drawPaddle(rightPaddle);
				drawBall();
				if (checkWinner.call(this)) return;
				movePaddles.call(this);
				moveBall();
				requestAnimationFrame(gameLoop.bind(this));
			}

			document.addEventListener('keydown', (e) => {
				if (e.key === 'w') leftPaddle.moveUp = true;
				if (e.key === 's') leftPaddle.moveDown = true;
				if (this.isMultiplayer) {
					if (e.key === 'ArrowUp') rightPaddle.moveUp = true;
					if (e.key === 'ArrowDown') rightPaddle.moveDown = true;
				}
			});

			document.addEventListener('keyup', (e) => {
				if (e.key === 'w') leftPaddle.moveUp = false;
				if (e.key === 's') leftPaddle.moveDown = false;
				if (this.isMultiplayer) {
					if (e.key === 'ArrowUp') rightPaddle.moveUp = false;
					if (e.key === 'ArrowDown') rightPaddle.moveDown = false;
				}
			});

			gameLoop.call(this);
		}
	}
}

customElements.define('offline-game', OfflineGame);