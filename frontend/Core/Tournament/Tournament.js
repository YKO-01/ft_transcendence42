class TournamentGame extends HTMLElement {
	constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.players = [
            { name: 'Player 1', score: 0, nickname: '' },
            { name: 'Player 2', score: 0, nickname: '' },
            { name: 'Player 3', score: 0, nickname: '' },
            { name: 'Player 4', score: 0, nickname: '' }
        ];
        this.currentMatch = { player1: 0, player2: 1 };
        // this.tournamentStatus = 'semifinals'; // semifinals or finals
        this.winners = [];
        this.winningScore = 5;
        this.tournamentStatus = 'setup';
		this.render();
	}

	render() {
        // console.log('this.tournamentStatus', this.tournamentStatus);
        const container = document.createElement('div');
        container.className = 'container text-light position-relative';

        if (this.tournamentStatus === 'setup') {
            container.innerHTML = this.renderSetup();
        } else {
            container.innerHTML = this.renderTournament();
        }

        const style = document.createElement('style');
        style.textContent = `
            @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');

            .bracket-display {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }

            .match {
                margin: 1rem 0;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
                text-align: center;
            }

            .player {
                padding: 0.25rem 0.5rem;
                margin: 0 0.5rem;
            }

            .player.active {
                background: #2dab11;
                border-radius: 4px;
            }

            .finals {
                margin-top: 2rem;
                border-top: 2px solid rgba(255, 255, 255, 0.1);
                padding-top: 1rem;
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
        this.shadowRoot.append(container);
        if (this.tournamentStatus !== 'setup')
            this.initializeGame();
        this.setupEventListeners();
    }

    renderSetup() {
      return `
        <div class="setup-container p-4">
          <h2 class="text-center mb-4">Enter Player Nicknames</h2>
          <form id="nicknameForm">
            ${this.players.map((player, index) => `
              <div class="mb-3">
                <label for="player${index + 1}" class="form-label">${player.name}</label>
                <input type="text" class="form-control" id="player${index + 1}" placeholder="Enter nickname" required>
              </div>
            `).join('')}
            <button type="submit" class="btn btn-primary w-100">Start Tournament</button>
          </form>
        </div>
      `;
    }

    renderTournament() {
        return `
            <div class="tournament-info mb-4">
                <h2 class="text-center mb-3">Pong Tournament</h2>
                <div class="bracket-display p-3 mb-4">
                    <div class="semifinals">
                        <div class="match match1">
                            <span class="player ${this.isCurrentMatch(0, 1) ? 'active' : ''}">${this.players[0].nickname}</span>
                            vs
                            <span class="player ${this.isCurrentMatch(0, 1) ? 'active' : ''}">${this.players[1].nickname}</span>
                        </div>
                        <div class="match match2">
                            <span class="player ${this.isCurrentMatch(2, 3) ? 'active' : ''}">${this.players[2].nickname}</span>
                            vs
                            <span class="player ${this.isCurrentMatch(2, 3) ? 'active' : ''}">${this.players[3].nickname}</span>
                        </div>
                    </div>
                    ${this.winners.length >= 2 ? `
                        <div class="finals">
                            <div class="match final-match">
                                <span class="player ${this.tournamentStatus === 'finals' ? 'active' : ''}">${this.winners[0]}</span>
                                vs
                                <span class="player ${this.tournamentStatus === 'finals' ? 'active' : ''}">${this.winners[1]}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="current-match-info text-center mb-3">
                    <h3>${this.tournamentStatus === 'semifinals' ? 'Semifinals' : 'Finals'}</h3>
                    <p class="fs-5">${this.players[this.currentMatch.player1].nickname} vs ${this.players[this.currentMatch.player2].nickname}</p>
                </div>
            </div>
            <div class="w-100 d-flex justify-content-between align-items-center my-4 text-light">
                <span id="player1" class="bg-primary p-2 px-4 rounded fs-5">
                    ${this.players[this.currentMatch.player1].nickname}
                </span>
                <div id="scoreBoard" class="fs-3">
                    <span id="leftScore" class="fw-sem px-2">0</span> - 
                    <span id="rightScore" class="fw-sem px-2">0</span>
                </div>
                <span id="player2" class="bg-danger p-2 px-4 rounded fs-5">
                    ${this.players[this.currentMatch.player2].nickname}
                </span>
            </div>
            <div id="trophy" class="trophy-container hidden">
                <div class="trophy">🏆</div>
                <div class="winner-text"></div>
                ${this.tournamentStatus === 'semifinals' ? 
                    '<button id="nextMatch" class="btn btn-success mt-3">Next Match</button>' : 
                    '<button id="restartTournament" class="btn btn-primary mt-3">New Tournament</button>'}
            </div>
            <canvas id="gameCanvas" height="400" width="800" class="w-100 h-100 border"></canvas>
        `;
    }

    isCurrentMatch(player1, player2) {
        return (this.currentMatch.player1 === player1 && this.currentMatch.player2 === player2);
    }

    initializeGame() {
        const canvas = this.shadowRoot.getElementById('gameCanvas');
        if (!canvas.getContext) return;

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

        const drawPaddle = (paddle) => {
            ctx.fillStyle = 'white';
            ctx.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);
        };

        const drawBall = () => {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.roundRect(ballX, ballY, ballSize, ballSize, 100);
            ctx.fill();
        };

        const updateScore = () => {
            this.shadowRoot.getElementById('leftScore').textContent = leftPaddle.score;
            this.shadowRoot.getElementById('rightScore').textContent = rightPaddle.score;
        };

        const checkWinner = () => {
            if (leftPaddle.score >= this.winningScore || rightPaddle.score >= this.winningScore) {
                const winner = leftPaddle.score >= this.winningScore ? 
                    this.players[this.currentMatch.player1].nickname : 
                    this.players[this.currentMatch.player2].nickname;
                
                this.handleMatchWinner(winner);
                return true;
            }
            return false;
        };

        const resetBall = () => {
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            ballSpeedX = -ballSpeedX;
        };

        const moveBall = () => {
            ballX += ballSpeedX;
            ballY += ballSpeedY;

            if (ballY <= 0 || ballY >= canvas.height - ballSize) {
                ballSpeedY = -ballSpeedY;
            }

            if (
                (ballX <= leftPaddle.x + paddleWidth && 
                 ballY + ballSize >= leftPaddle.y && 
                 ballY <= leftPaddle.y + paddleHeight) ||
                (ballX + ballSize >= rightPaddle.x && 
                 ballY + ballSize >= rightPaddle.y && 
                 ballY <= rightPaddle.y + paddleHeight)
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
        };

        const gameLoop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (leftPaddle.moveUp && leftPaddle.y > 0) {
                leftPaddle.y -= leftPaddle.speed;
            }
            if (leftPaddle.moveDown && leftPaddle.y < canvas.height - paddleHeight) {
                leftPaddle.y += leftPaddle.speed;
            }
            if (rightPaddle.moveUp && rightPaddle.y > 0) {
                rightPaddle.y -= rightPaddle.speed;
            }
            if (rightPaddle.moveDown && rightPaddle.y < canvas.height - paddleHeight) {
                rightPaddle.y += rightPaddle.speed;
            }

            drawPaddle(leftPaddle);
            drawPaddle(rightPaddle);
            drawBall();
            
            if (!checkWinner()) {
                moveBall();
                requestAnimationFrame(gameLoop);
            }
        };

        // Set up controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'w') leftPaddle.moveUp = true;
            if (e.key === 's') leftPaddle.moveDown = true;
            if (e.key === 'ArrowUp') rightPaddle.moveUp = true;
            if (e.key === 'ArrowDown') rightPaddle.moveDown = true;
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'w') leftPaddle.moveUp = false;
            if (e.key === 's') leftPaddle.moveDown = false;
            if (e.key === 'ArrowUp') rightPaddle.moveUp = false;
            if (e.key === 'ArrowDown') rightPaddle.moveDown = false;
        });

        gameLoop();
    }

    setupEventListeners() {
        if (this.tournamentStatus === 'setup') {
            const form = this.shadowRoot.getElementById('nicknameForm');
            form.addEventListener('submit', (e) => this.handleNicknameSubmit(e));
        } else {
            const nextMatchBtn = this.shadowRoot.getElementById('nextMatch');
            const restartTournamentBtn = this.shadowRoot.getElementById('restartTournament');
            
            if (nextMatchBtn) {
                nextMatchBtn.addEventListener('click', () => this.setupNextMatch());
            }
            
            if (restartTournamentBtn) {
                restartTournamentBtn.addEventListener('click', () => this.restartTournament());
            }
        }
    }

    handleNicknameSubmit(e) {
        e.preventDefault();
        this.players.forEach((player, index) => {
          const input = this.shadowRoot.getElementById(`player${index + 1}`);
          player.nickname = input.value || player.name;
        });
        this.tournamentStatus = 'semifinals';
        this.render();
      }

    handleMatchWinner(winner) {
        const trophy = this.shadowRoot.getElementById('trophy');
        const winnerText = trophy.querySelector('.winner-text');
        trophy.classList.remove('hidden');
        winnerText.textContent = `${winner} Wins!`;

        if (this.tournamentStatus === 'semifinals') {
            this.winners.push(winner);
        }
    }

    setupNextMatch() {
        if (this.tournamentStatus === 'semifinals' && this.winners.length === 1) {
            // Continue semifinals
            this.currentMatch = { player1: 2, player2: 3 };
        } else if (this.tournamentStatus === 'semifinals' && this.winners.length === 2) {
            // Move to finals
            this.tournamentStatus = 'finals';
            this.currentMatch = { player1: 0, player2: 1 }; // Winners will be displayed in order
        }
        
        this.render();
    }

    restartTournament() {
        this.winners = [];
        this.tournamentStatus = 'semifinals';
        this.currentMatch = { player1: 0, player2: 1 };
        this.render();
    }
}

customElements.define('tournament-game', TournamentGame);
