class Cpu extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.isMultiplayer = true;
		this.lastUpdateTime = 0;
		this.render();
	}

	render() {
		const cpuGame = document.createElement("div");
		cpuGame.className = "container text-light position-relative";
		cpuGame.id = "cpu-game";
		cpuGame.innerHTML = `
		<div class="w-100 d-flex justify-content-between align-items-center my-4 text-light">
			<span id="player1" class="bg-primary p-2 px-4 rounded fs-5">${window.UserData.username}</span>
			<div id="scoreBoard" class="fs-3">
				<span id="leftScore" class="fw-sem px-2">0</span> - <span id="rightScore" class="fw-sem px-2">0</span>
			</div>
			<span id="player2" class="bg-danger p-2 px-4 rounded fs-5">CPU</span>
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

		const resetGame = () => {
			leftPaddle.score = 0;
			rightPaddle.score = 0;
			trophy.classList.add('hidden');
			resetBall();
			updateScore();
		};

		// CANVAS and GAME LOGIC
		const canvas = this.shadowRoot.getElementById("gameCanvas");
		const leftScore = this.shadowRoot.getElementById('leftScore');
		const rightScore = this.shadowRoot.getElementById('rightScore');
		
		if (canvas.getContext) {
			const ctx = canvas.getContext('2d');
			const paddleWidth = 5, paddleHeight = 70;
			const ballSize = 7;
			const RADIUS = 7;
			let qTable = {};
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
					showWinner('AI Bot');
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

			function parseState(stateStr) {
				const match = stateStr.match(/\((\d+),\s*(\d+)\)/);
				if (match) {
					return [parseInt(match[1]), parseInt(match[2])];
				}
				return null;
			}
			
			async function loadQTable() {
				try {
					const response = await fetch('https://127.0.0.1/player_A_10_qtable.json');
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					qTable = await response.json();
					// console.log("Parsed JSON data:", qTable);
				} catch (error) {
					console.error("Error fetching or parsing JSON data:", error);
				}
			}

			function calculateDistance(state1, state2) {
				return Math.sqrt(
					Math.pow(state1[0] - state2[0], 2) +
					Math.pow(state1[1] - state2[1], 2)
				);
			}								
			
			function getClosestStateActions(state) {
				const parsedInputState = parseState(state);
	
				if (!parsedInputState) {
					console.warn("Invalid state format");
					return [0, 0, 0];
				}
	
				let closestState = null;
				let closestDistance = Infinity;
	
				for (const key in qTable) {
					const parsedQTableState = parseState(key);
					
					if (parsedQTableState) {
						const distance = calculateDistance(parsedInputState, parsedQTableState);
	
						if (distance < closestDistance) {
							closestDistance = distance;
							closestState = key;
						}
					}
				}
				if (closestState) {
					//////console.log('the closeststate is :' + closestState);
					return qTable[closestState];
				} else {
					return [0, 0, 0];
				}
			}

			function get_action() {
				const ballCenterY = ballY + RADIUS;
				const paddleCenterY = rightPaddle.y + paddleHeight / 2;
		
				let distilledState;
				if (rightPaddle.y - RADIUS <= ballCenterY && ballCenterY <= paddleCenterY + RADIUS) {
					distilledState = 0;
				} else if (ballCenterY < paddleCenterY) {
					distilledState = 1;
				} else {
					distilledState = 2;
				}
				
				return distilledState;
			}
				
			function getAction(state) {
				const actions = getClosestStateActions(state); 
				const maxAction = actions.indexOf(Math.max(...actions));
		
				if (maxAction === 1 && rightPaddle.y > 0) {
					rightPaddle.y -= rightPaddle.speed;
				} else if (maxAction === 2 && rightPaddle.y < canvas.height - paddleHeight) {
					rightPaddle.y += rightPaddle.speed;
				}
			}

			function resetBall() {
				ballX = canvas.width / 2;
				ballY = canvas.height / 2;
				ballSpeedX = -ballSpeedX;
			}

			function getState() {
				const ballPosY = Math.floor(ballY/ 5);
				const leftPaddlePosY = Math.floor(leftPaddle.y);
				return `(${ballPosY}, ${leftPaddlePosY})`;
			}

			const updateAI = () => {  // Changed to arrow function
				const currentTime = Date.now();
				// Only update AI if more than 1000ms (1 second) has passed since last update
				if (currentTime - this.lastUpdateTime >= 1000) {
					let action = get_action();                
					let epsilone = 0;
					let stat = "(" + action + ", " + epsilone + ")";
					getAction(stat);
					
					// Update the timestamp
					this.lastUpdateTime = currentTime;
				}
			}

			function gameLoop() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				drawPaddle(leftPaddle);
				drawPaddle(rightPaddle);
				drawBall();
				if (checkWinner()) return;
				
				movePaddles();
				updateAI();
				moveBall();
				requestAnimationFrame(gameLoop);
			}

			document.addEventListener('keydown', (e) => {
				if (e.key === 'w') leftPaddle.moveUp = true;
				if (e.key === 's') leftPaddle.moveDown = true;
			});

			document.addEventListener('keyup', (e) => {
				if (e.key === 'w') leftPaddle.moveUp = false;
				if (e.key === 's') leftPaddle.moveDown = false;
			});
		
			loadQTable();
			gameLoop();
		}
	}
}

customElements.define('cpu-game', Cpu);