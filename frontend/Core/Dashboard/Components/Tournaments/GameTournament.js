// class GameTournament extends HTMLElement {
//     constructor() {
//       super();
//       this.attachShadow({ mode: 'open' });
//       this.keys = {
//         w: false,
//         s: false,
//         ArrowUp: false,
//         ArrowDown: false
//       };
//       this.CANVAS_WIDTH = 800;
//       this.CANVAS_HEIGHT = 400;
//       this.PADDLE_WIDTH = 5;
//       this.PADDLE_HEIGHT = 70;
//       this.BALL_SIZE = 7;
//       this.gameSocket = null;
//       this.gameStarted = false;
//       this.winner = null;
//       this.isPlayerOne = false;
//       this.leftPlayer = false;
//       this.sendFinal = false;
//       this.roomstate = false;
  
//       this.leftPaddle = {
//         x: 0,
//         y: (this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) / 2,
//         speed: 5,
//         score: 0
//       };
  
//       this.rightPaddle = {
//         x: this.CANVAS_WIDTH - this.PADDLE_WIDTH,
//         y: (this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) / 2,
//         speed: 5,
//         score: 0
//       };
  
//       this.ball = {
//         x: this.CANVAS_WIDTH / 2,
//         y: this.CANVAS_HEIGHT / 2,
//         speedX: 4,
//         speedY: 4,
//         size: this.BALL_SIZE
//       };
  
//       this.render();
//       this.initEventListeners();
//     }
  
//     render() {
//       const gameContainer = document.createElement("div");
//       gameContainer.className = "container text-light position-relative";
//       gameContainer.innerHTML = `
//         <div class="w-100 d-flex justify-content-between align-items-center my-4 text-light">
//           <span id="player1" class="bg-primary p-2 px-4 rounded fs-5">Player 1</span>
//           <div id="scoreBoard" class="fs-3">
//             <span id="leftScore" class="fw-sem px-2">0</span> - <span id="rightScore" class="fw-sem px-2">0</span>
//           </div>
//           <span id="player2" class="bg-danger p-2 px-4 rounded fs-5">Player 2</span>
//         </div>
//         <div id="roomInfo" class="text-center mb-3">
//           <span id="roomName" class="text-white"></span>
//           <span id="waitingMessage" class="text-warning"></span>
//         </div>
//         <div id="trophy" class="trophy-container hidden">
//           <div class="trophy">🏆</div>
//           <div id="winner" class="winner-text"></div>
//         </div>
//         <canvas id="gameCanvas" height="${this.CANVAS_HEIGHT}" width="${this.CANVAS_WIDTH}" class="w-100 h-100 border"></canvas>
//       `;
  
//       const style = document.createElement('style');
//       style.textContent = `
//         @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
//         @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
  
//         .trophy-container {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           text-align: center;
//           z-index: 1000;
//           background: rgba(0, 0, 0, 0.8);
//           padding: 2rem;
//           border-radius: 1rem;
//           border: 2px solid #ffd700;
//         }
//         .trophy {
//           font-size: 6rem;
//           margin-bottom: 1rem;
//           animation: bounce 1s infinite;
//         }
//         .winner-text {
//           font-size: 2rem;
//           color: #ffd700;
//           font-weight: bold;
//           font-family: 'Orbitron', sans-serif;
//         }
//         .hidden {
//           display: none;
//         }
//         @keyframes bounce {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-20px); }
//         }
//         canvas {
//           background: black;
//         }
//         #waitingMessage {
//           display: block;
//           margin-top: 1rem;
//         }
//       `;
  
//       this.shadowRoot.innerHTML = '';
//       this.shadowRoot.append(style);
//       this.shadowRoot.append(gameContainer);
//     }
  
//     connectedCallback() {
//       this.canvas = this.shadowRoot.getElementById('gameCanvas');
//       this.ctx = this.canvas.getContext('2d');
//       this.waitingMessage = this.shadowRoot.getElementById('waitingMessage');
//       this.leftScoreElement = this.shadowRoot.getElementById('leftScore');
//       this.rightScoreElement = this.shadowRoot.getElementById('rightScore');
//       this.roomNameElement = this.shadowRoot.getElementById('roomName');
//       this.player1 = this.shadowRoot.getElementById('player1');
//       this.player2 = this.shadowRoot.getElementById('player2');
//       this.winnerElement = this.shadowRoot.getElementById('winner');
//       this.roomInfoElement = this.shadowRoot.getElementById('roomInfo');
//       this.trophyContainer = this.shadowRoot.getElementById('trophy');
  
//       this.startGame(localStorage.getItem('matchID'));
//     }
  
//     initEventListeners() {
//       document.addEventListener('keydown', (e) => this.handleKeyDown(e));
//       document.addEventListener('keyup', (e) => this.handleKeyUp(e));
//     }
  
//     handleKeyDown(e) {
//       if (e.key in this.keys) {
//         e.preventDefault();
//         this.keys[e.key] = true;
//       }
//     }
  
//     handleKeyUp(e) {
//       if (e.key in this.keys) {
//         e.preventDefault();
//         this.keys[e.key] = false;
//       }
//     }
  
//     initializeGame(matchID) {
//       localStorage.setItem('matchID', matchID);
//       const access_token = localStorage.getItem('access_token');
//       this.gameSocket = new WebSocket(`ws://localhost:8000/ws/game/${matchID}/?token=${access_token}`);
  
//       this.gameSocket.onopen = () => {
//         //console.log('WebSocket connection established for game');
//         this.drawGame();
//       };
  
//       this.gameSocket.onclose = () => {
//         ////console.log('WebSocket connection closed');
//       };
  
//       this.gameSocket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
        
//         switch (data.type) {
//           case 'game_state':
//             this.handleGameState(data.game_state);
//             break;
//           case 'paddle_move':
//             this.handlePaddleMove(data.paddle_move);
//             break;
//           case 'ball_position':
//             this.handleBallPosition(data.ball_position);
//             break;
//           case 'score_update':
//             this.handleScoreUpdate(data.score_update);
//             break;
//         }
        
//         this.drawGame();
//       };
//     }
  
//     handleGameState(gameState) {
//       this.leftPaddle.y = gameState.left_paddle_y;
//       this.rightPaddle.y = gameState.right_paddle_y;
//       this.ball.x = gameState.ball_position.x;
//       this.ball.y = gameState.ball_position.y;
//       this.leftPaddle.score = gameState.left_score;
//       this.rightPaddle.score = gameState.right_score;
      
//       setTimeout(() => {
//         if (gameState.players === 1 && !this.gameStarted)
//           this.deleteMatch(localStorage.getItem('matchID'));
//       }, 10000);
  
//       if (gameState.players === 1) {
//         this.isPlayerOne = true;
//         this.waitingMessage.textContent = "You are Player 1 (Left Paddle). Waiting for Player 2...";
//         this.player1.textContent = gameState.nickname_one;
//         this.leftPlayer = true;
//       } else if (gameState.players === 2 && !this.gameStarted) {
//         this.waitingMessage.style.display = 'none';
//         this.isPlayerOne = true;
//         this.gameStarted = true;
//         const playerMessage = this.leftPlayer ? "You are Player 1 (Left Paddle)" : "You are Player 2 (Right Paddle)";
//         this.player1.textContent = gameState.nickname_one;
//         this.player2.textContent = gameState.nickname_two;
//         this.roomInfoElement.innerHTML += `<br>${playerMessage}`;
//         this.gameLoop();
//       }
  
//       if (this.leftPaddle.score >= 5 || this.rightPaddle.score >= 5) {
//         this.handleGameOver();
//       }
//     }
  
//     handleGameOver() {
//       if (this.leftPaddle.score >= 5) {
//         this.winner = this.player1.textContent;
//       } else if (this.rightPaddle.score >= 5) {
//         this.winner = this.player2.textContent;
//       }
      
//       if (this.winner) {
//         this.trophyContainer.classList.remove('hidden');
//         this.winnerElement.textContent = `${this.winner} Wins!`;
//         this.gameSocket.close();
//       }
//     }
  
//     movePaddles() {
//       let leftPaddleMoved = false;
//       let rightPaddleMoved = false;
  
//       if (this.leftPlayer) {
//         if ((this.keys.w || this.keys.ArrowUp) && this.leftPaddle.y > 0) {
//           this.leftPaddle.y -= this.leftPaddle.speed;
//           leftPaddleMoved = true;
//         } else if ((this.keys.s || this.keys.ArrowDown) && this.leftPaddle.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
//           this.leftPaddle.y += this.leftPaddle.speed;
//           leftPaddleMoved = true;
//         }
//       } else {
//         if ((this.keys.w || this.keys.ArrowUp) && this.rightPaddle.y > 0) {
//           this.rightPaddle.y -= this.rightPaddle.speed;
//           rightPaddleMoved = true;
//         } else if ((this.keys.s || this.keys.ArrowDown) && this.rightPaddle.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
//           this.rightPaddle.y += this.rightPaddle.speed;
//           rightPaddleMoved = true;
//         }
//       }
  
//       if (leftPaddleMoved) {
//         this.sendPaddleMove(this.leftPaddle, 'left');
//       }
//       if (rightPaddleMoved) {
//         this.sendPaddleMove(this.rightPaddle, 'right');
//       }
//     }
  
//     sendPaddleMove(paddle, side) {
//       this.gameSocket.send(JSON.stringify({
//         paddle_move: {
//           player: side,
//           y: paddle.y
//         }
//       }));
//     }
  
//     gameLoop() {
//       if (!this.gameStarted || this.leftPaddle.score >= 5 || this.rightPaddle.score >= 5) {
//         if (this.leftPaddle.score >= 5)
//           this.winner = this.player1.textContent;
//         else if (this.rightPaddle.score >= 5)
//           this.winner = this.player2.textContent;
//         if (this.winner) {
//             this.shadowRoot.getElementById('winner').textContent = winner;
//             this.sendWinner();
//             this.gameSocket.close();
//             this.gameSocket = null;
//             this.resetGame();
//             // // connectSocket();
//             this.roomstate = localStorage.getItem('roomstate');
//             if (!roomstate && winner == window.UserData.username && !sentFinal)
//             {
//                 sentFinal = true;
//                 socket.send(JSON.stringify({
//                     action: 'final',
//                     room_id: localStorage.getItem('roomID')
//                 }));
//             } 
//         //   this.winnerElement.textContent = this.winner;
//         }
//         return;
//       }
//       this.movePaddles();
//       if (this.isPlayerOne) {
//         this.moveBall();
//       }
//       this.drawGame();
//       requestAnimationFrame(() => this.gameLoop());
//     }
  
//     handlePaddleMove(paddleMove) {
//       if (paddleMove.player === 'left') {
//         this.leftPaddle.y = paddleMove.y;
//       } else {
//         this.rightPaddle.y = paddleMove.y;
//       }
//     }
  
//     handleBallPosition(ballPosition) {
//       this.ball.x = ballPosition.x;
//       this.ball.y = ballPosition.y;
//       this.ball.speedX = ballPosition.speedx;
//       if (ballPosition.y <= 0 && ballPosition.speedy <= 0)
//         this.ball.speedY = -ballPosition.speedy;
//       else
//         this.ball.speedY = ballPosition.speedy;
//     }
  
//     handleScoreUpdate(scoreUpdate) {
//       this.leftPaddle.score = scoreUpdate.left_score;
//       this.rightPaddle.score = scoreUpdate.right_score;
//       this.updateScore();
//     }
  
//     sendBallPosition() {
//       this.gameSocket.send(JSON.stringify({
//         ball_position: {
//           x: this.ball.x,
//           y: this.ball.y,
//           speedx: this.ball.speedX,
//           speedy: this.ball.speedY
//         }
//       }));
//     }
  
//     sendScoreUpdate() {
//       this.gameSocket.send(JSON.stringify({
//         score_update: {
//           type: 'score_game',
//           left_score: this.leftPaddle.score,
//           right_score: this.rightPaddle.score,
//           match_id: localStorage.getItem('matchID'),
//         }
//       }));
//     }

//     sendWinner() {
//         gameSocket.send(JSON.stringify({
//             winner_data: {
//                 winner: winner,
//                 match_id: localStorage.getItem('matchID')
//             }
//         }));
//     }
  
//     drawPaddle(paddle) {
//       this.ctx.fillStyle = 'white';
//       this.ctx.fillRect(paddle.x, paddle.y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
//     }
  
//     drawBall() {
//       this.ctx.fillStyle = 'white';
//       this.ctx.beginPath();
//       this.ctx.roundRect(this.ball.x, this.ball.y, this.BALL_SIZE, this.BALL_SIZE, [this.BALL_SIZE]);
//       this.ctx.fill();
//     }
  
//     updateScore() {
//       this.leftScoreElement.textContent = this.leftPaddle.score;
//       this.rightScoreElement.textContent = this.rightPaddle.score;
//     }
  
//     moveBall() {
//       this.ball.x += this.ball.speedX;
//       this.ball.y += this.ball.speedY;
  
//       let checkWall = false;
//       let checkPaddle = false;
  
//       if (this.ball.y <= 0 || this.ball.y >= this.CANVAS_HEIGHT - this.BALL_SIZE) {
//         this.ball.speedY = -this.ball.speedY;
//         checkWall = true;
//       }
  
//       if (
//         (this.ball.x <= this.leftPaddle.x + this.PADDLE_WIDTH && 
//          this.ball.y + this.BALL_SIZE >= this.leftPaddle.y && 
//          this.ball.y <= this.leftPaddle.y + this.PADDLE_HEIGHT) ||
//         (this.ball.x + this.BALL_SIZE >= this.rightPaddle.x && 
//          this.ball.y + this.BALL_SIZE >= this.rightPaddle.y && 
//          this.ball.y <= this.rightPaddle.y + this.PADDLE_HEIGHT)
//       ) {
//         this.ball.speedX = -this.ball.speedX;
//         checkPaddle = true;
//       }
  
//       if (this.ball.x < 0) {
//         this.rightPaddle.score++;
//         this.resetBall();
//         this.sendScoreUpdate();
//       }
  
//       if (this.ball.x > this.CANVAS_WIDTH) {
//         this.leftPaddle.score++;
//         this.resetBall();
//         this.sendScoreUpdate();
//       }
      
//       if (checkWall || checkPaddle) {
//         if (this.ball.y > this.CANVAS_HEIGHT - this.BALL_SIZE)
//           this.ball.y -= this.BALL_SIZE;
//         this.sendBallPosition();
//       }
//     }
  
//     resetBall() {
//       this.ball.x = this.CANVAS_WIDTH / 2;
//       this.ball.y = this.CANVAS_HEIGHT / 2;
//       this.ball.speedX = -this.ball.speedX;
//     }
  
//     drawGame() {
      
//       this.ctx.fillStyle = 'black';
//       this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
//       this.drawPaddle(this.leftPaddle);
//       this.drawPaddle(this.rightPaddle);
//       this.drawBall();
//     }
  
//     resetGame() {
//       this.leftPaddle.score = 0;
//       this.rightPaddle.score = 0;
//       this.resetBall();
//       this.updateScore();
//       this.sendScoreUpdate();
//       this.sendBallPosition();
//     }
  
//     startGame(matchID) {
//       localStorage.setItem('matchID', matchID);
//       //console.log(matchID);
//       this.initializeGame(matchID);
//     }

//   }
class GameTournament extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
  
      this.CANVAS_WIDTH = 800;
      this.CANVAS_HEIGHT = 400;
      this.PADDLE_WIDTH = 10;
      this.PADDLE_HEIGHT = 100;
      this.BALL_SIZE = 10;
  
      this.gameStarted = false;
      this.isPlayerOne = false;
      this.leftPlayer = false;
      this.winner = null;
      this.gameSocket = null;
      this.sentFinal = false;
  
      this.leftPaddle = {
        x: 0,
        y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
        speed: 5,
        score: 0
      };
  
      this.rightPaddle = {
        x: this.CANVAS_WIDTH - this.PADDLE_WIDTH,
        y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
        speed: 5,
        score: 0
      };
  
      this.ball = {
        x: this.CANVAS_WIDTH / 2,
        y: this.CANVAS_HEIGHT / 2,
        speedX: 5,
        speedY: 5
      };
  
      this.keys = {
        w: false,
        s: false,
        ArrowUp: false,
        ArrowDown: false
      };
  
      this.matchID = localStorage.getItem('matchID');
      this.render();
      this.initEventListeners();
    }
  
    connectedCallback() {
      this.canvas = this.shadowRoot.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.waitingMessage = this.shadowRoot.getElementById('waitingMessage');
      this.leftScoreElement = this.shadowRoot.getElementById('leftScore');
      this.rightScoreElement = this.shadowRoot.getElementById('rightScore');
      this.roomNameElement = this.shadowRoot.getElementById('roomName');
      this.resetButton = this.shadowRoot.getElementById('resetButton');
      this.player1 = this.shadowRoot.getElementById('player1');
      this.player2 = this.shadowRoot.getElementById('player2');
      this.winnerElement = this.shadowRoot.getElementById('winner');
      this.roomInfoElement = this.shadowRoot.getElementById('roomInfo');
      this.startGame(this.matchID);
    }
  
    render() {
      const style = document.createElement('style');
      style.textContent = `
        :host {
          display: block;
          font-family: Arial, sans-serif;
        }
        .game-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f0f0f0;
          border-radius: 10px;
        }
        canvas {
          display: block;
          margin: 0 auto;
          border: 2px solid #000;
        }
        .score {
          text-align: center;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .player-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        button {
          display: block;
          margin: 10px auto;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
        }
      `;
  
      this.shadowRoot.innerHTML = `
        <div class="game-container">
          <div class="player-info">
            <span id="player1"></span>
            <span id="player2"></span>
          </div>
          <div class="score">
            <span id="leftScore">0</span> - <span id="rightScore">0</span>
          </div>
          <canvas id="gameCanvas" width="${this.CANVAS_WIDTH}" height="${this.CANVAS_HEIGHT}"></canvas>
          <div id="waitingMessage"></div>
          <div id="roomInfo"></div>
          <div id="winner"></div>
          <button id="resetButton">Reset Game</button>
        </div>
      `;
  
      this.shadowRoot.appendChild(style);
    }
  
    initEventListeners() {
      document.addEventListener('keydown', (e) => this.handleKeyDown(e));
      document.addEventListener('keyup', (e) => this.handleKeyUp(e));
      this.shadowRoot.getElementById('resetButton').addEventListener('click', () => this.resetGame());
    }
  
    handleKeyDown(e) {
      if (e.key in this.keys) {
        e.preventDefault();
        this.keys[e.key] = true;
      }
    }
  
    handleKeyUp(e) {
      if (e.key in this.keys) {
        e.preventDefault();
        this.keys[e.key] = false;
      }
    }
  
    startGame(matchID) {
      this.initializeGame(matchID);
    }
  
    initializeGame(matchID) {
      localStorage.setItem('matchID', matchID);
      const access_token = localStorage.getItem('access_token');
      this.gameSocket = new WebSocket(`ws://localhost:8000/ws/game/${matchID}/?token=${access_token}`);
  
      this.gameSocket.onopen = () => {
        //console.log('WebSocket connection established');
        this.drawGame();
      };
  
      this.gameSocket.onclose = () => {
        //console.log('WebSocket connection closed');
      };
  
      this.gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'game_state':
            this.handleGameState(data.game_state);
            break;
          case 'paddle_move':
            this.handlePaddleMove(data.paddle_move);
            break;
          case 'ball_position':
            this.handleBallPosition(data.ball_position);
            break;
          case 'score_update':
            this.handleScoreUpdate(data.score_update);
            break;
        }
        
        this.drawGame();
      };
    }
  
    handleGameState(gameState) {
      this.leftPaddle.y = gameState.left_paddle_y;
      this.rightPaddle.y = gameState.right_paddle_y;
      this.ball.x = gameState.ball_position.x;
      this.ball.y = gameState.ball_position.y;
      this.leftPaddle.score = gameState.left_score;
      this.rightPaddle.score = gameState.right_score;
      this.updateScore();
  
      if (gameState.players === 1) {
        this.isPlayerOne = true;
        this.waitingMessage.textContent = "You are Player 1 (Left Paddle). Waiting for Player 2...";
        this.player1.textContent = gameState.nickname_one;
        this.leftPlayer = true;
      } else if (gameState.players === 2 && !this.gameStarted) {
        this.waitingMessage.style.display = 'none';
        this.isPlayerOne = true;
        this.gameStarted = true;
        const playerMessage = this.leftPlayer ? "You are Player 1 (Left Paddle)" : "You are Player 2 (Right Paddle)";
        this.player1.textContent = gameState.nickname_one;
        this.player2.textContent = gameState.nickname_two;
        this.roomInfoElement.innerHTML += `<br>${playerMessage}`;
        this.gameLoop();
      }
    }
  
    movePaddles() {
      let leftPaddleMoved = false;
      let rightPaddleMoved = false;
  
      if (this.leftPlayer) {
        if ((this.keys.w || this.keys.ArrowUp) && this.leftPaddle.y > 0) {
          this.leftPaddle.y -= this.leftPaddle.speed;
          leftPaddleMoved = true;
        } else if ((this.keys.s || this.keys.ArrowDown) && this.leftPaddle.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
          this.leftPaddle.y += this.leftPaddle.speed;
          leftPaddleMoved = true;
        }
      } else {
        if ((this.keys.w || this.keys.ArrowUp) && this.rightPaddle.y > 0) {
          this.rightPaddle.y -= this.rightPaddle.speed;
          rightPaddleMoved = true;
        } else if ((this.keys.s || this.keys.ArrowDown) && this.rightPaddle.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
          this.rightPaddle.y += this.rightPaddle.speed;
          rightPaddleMoved = true;
        }
      }
  
      if (leftPaddleMoved) {
        this.sendPaddleMove(this.leftPaddle, 'left');
      }
      if (rightPaddleMoved) {
        this.sendPaddleMove(this.rightPaddle, 'right');
      }
    }
  
    sendPaddleMove(paddle, side) {
      this.gameSocket.send(JSON.stringify({
        paddle_move: {
          player: side,
          y: paddle.y
        }
      }));
    }
  
    gameLoop() {
      if (!this.gameStarted || this.leftPaddle.score >= 5 || this.rightPaddle.score >= 5) {
        if (this.leftPaddle.score >= 5)
          this.winner = this.player1.textContent;
        else if (this.rightPaddle.score >= 5)
          this.winner = this.player2.textContent;
        if (this.winner) {
          this.winnerElement.textContent = this.winner;
          this.sendWinner();
          this.gameSocket.close();
          this.gameSocket = null;
          this.resetGame();
          if (this.winner == window.UserData.username && !this.sentFinal) {
            this.sentFinal = true;
            window.roomSocket.send(JSON.stringify({
              action: 'final',
              room_id: localStorage.getItem('roomID')
            }));
            nagivateTo('/');
          }
        //   this.dispatchEvent(new CustomEvent('gameover', { detail: { winner: this.winner } }));
        }
        return;
      }
      this.movePaddles();
      if (this.isPlayerOne) {
        this.moveBall();
      }
      this.drawGame();
      requestAnimationFrame(() => this.gameLoop());
    }
  
    handlePaddleMove(paddleMove) {
      if (paddleMove.player === 'left') {
        this.leftPaddle.y = paddleMove.y;
      } else {
        this.rightPaddle.y = paddleMove.y;
      }
    }
  
    handleBallPosition(ballPosition) {
      this.ball.x = ballPosition.x;
      this.ball.y = ballPosition.y;
      this.ball.speedX = ballPosition.speedx;
      if (ballPosition.y <= 0 && ballPosition.speedy <= 0)
        this.ball.speedY = -ballPosition.speedy;
      else
        this.ball.speedY = ballPosition.speedy;
    }
  
    handleScoreUpdate(scoreUpdate) {
      this.leftPaddle.score = scoreUpdate.left_score;
      this.rightPaddle.score = scoreUpdate.right_score;
      this.updateScore();
    }
  
    sendBallPosition() {
      this.gameSocket.send(JSON.stringify({
        ball_position: {
          x: this.ball.x,
          y: this.ball.y,
          speedx: this.ball.speedX,
          speedy: this.ball.speedY
        }
      }));
    }
  
    sendScoreUpdate() {
      this.gameSocket.send(JSON.stringify({
        score_update: {
          type: 'score_room',
          left_score: this.leftPaddle.score,
          right_score: this.rightPaddle.score,
          match_id: localStorage.getItem('matchID')
        }
      }));
    }
  
    sendWinner() {
      this.gameSocket.send(JSON.stringify({
        winner_data: {
          winner: this.winner,
          match_id: localStorage.getItem('matchID')
        }
      }));
    }
  
    drawPaddle(paddle) {
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(paddle.x, paddle.y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
    }
  
    drawBall() {
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(this.ball.x, this.ball.y, this.BALL_SIZE, this.BALL_SIZE);
    }
  
    updateScore() {
      this.leftScoreElement.textContent = this.leftPaddle.score;
      this.rightScoreElement.textContent = this.rightPaddle.score;
    }
  
    moveBall() {
      this.ball.x += this.ball.speedX;
      this.ball.y += this.ball.speedY;
  
      let checkWall = false;
      let checkPaddle = false;
  
      if (this.ball.y <= 0 || this.ball.y >= this.CANVAS_HEIGHT - this.BALL_SIZE) {
        this.ball.speedY = -this.ball.speedY;
        checkWall = true;
      }
  
      if (
        (this.ball.x <= this.leftPaddle.x + this.PADDLE_WIDTH && this.ball.y + this.BALL_SIZE >= this.leftPaddle.y && this.ball.y <= this.leftPaddle.y + this.PADDLE_HEIGHT) ||
        (this.ball.x + this.BALL_SIZE >= this.rightPaddle.x && this.ball.y + this.BALL_SIZE >= this.rightPaddle.y && this.ball.y <= this.rightPaddle.y + this.PADDLE_HEIGHT)
      ) {
        this.ball.speedX = -this.ball.speedX;
        checkPaddle = true;
      }
  
      if (this.ball.x < 0) {
        this.rightPaddle.score++;
        this.resetBall();
        this.sendScoreUpdate();
      }
  
      if (this.ball.x > this.CANVAS_WIDTH) {
        this.leftPaddle.score++;
        this.resetBall();
        this.sendScoreUpdate();
      }
  
      if (checkWall || checkPaddle) {
        if (this.ball.y > this.CANVAS_HEIGHT - this.BALL_SIZE)
          this.ball.y -= this.BALL_SIZE;
        this.sendBallPosition();
      }
    }
  
    resetBall() {
      this.ball.x = this.CANVAS_WIDTH / 2;
      this.ball.y = this.CANVAS_HEIGHT / 2;
      this.ball.speedX = -this.ball.speedX;
    }
  
    drawGame() {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
      this.drawPaddle(this.leftPaddle);
      this.drawPaddle(this.rightPaddle);
      this.drawBall();
    }
  
    resetGame() {
      this.gameStarted = 
      false;
      this.sentFinal = false;
      this.leftPaddle.score = 0;
      this.rightPaddle.score = 0;
      this.resetBall();
      this.updateScore();
      this.winner = null;
      this.winnerElement.textContent = '';
    }
  }
  
//   customElements.define('pong-game', PongGameComponent);
  
  customElements.define('game-tournament', GameTournament);