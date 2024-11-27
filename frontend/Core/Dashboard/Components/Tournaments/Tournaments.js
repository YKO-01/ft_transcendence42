class TournamentGame extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
  
      this.rooms = [];
      this.current_user = null;
      this.access_token = localStorage.getItem('access_token');
      this.roomstate = null;
      this.nickname = null;
      this.winner = null;
  
      this.CANVAS_WIDTH = 800;
      this.CANVAS_HEIGHT = 400;
      this.PADDLE_WIDTH = 10;
      this.PADDLE_HEIGHT = 100;
      this.BALL_SIZE = 10;
  
      this.gameStarted = false;
      this.isPlayerOne = false;
      this.leftPlayer = false;
  
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
  
    //   this.render();
    //   this.init();
    }
  
    connectedCallback() {
        this.render();
        
    }

    render() {
        this.init();
        const tournaments = document.createElement('div');
        tournaments.id = "tournaments";
        tournaments.className = "container rounded p-4";
        tournaments.innerHTML = `
            <div class="position-relative">
                <h1 class="text-light fs-2 mb-2">Tournaments</h1>
                <div class="table-wrapper ">
                    <table>
                        <thead>
                            <tr class="head">
                                <th>Name</th>
                                <th>Time</th>
                                <th>Players</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="tournament-rows">
						</tbody>
                    </table>
                </div>
            </div>
        `;

      const style = document.createElement('style');
      style.textContent = `
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
			#overlay {	
				background: rgba(0, 0, 0, 0.7);
			}
			#modal {
				border-radius: 10px;
				background: #061924;
				padding: 2rem;
				width: 30%;
			}
            h1 {
                font-family: "Orbitron", sans-serif;
                letter-spacing: 2px;
            }
            .cursor-pointer {
                cursor: pointer;
            }
			table {
				width: 100%;
			}
            .table-wrapper {
                overflow-y: auto;
                max-height: 360px;
				background: transparent;
            }
            #tournaments {
                min-height: 460px;
                max-height: 500px;
                background: rgba(54, 54, 54, 0.5);
            }
            td, th {
                color: #fff;
                padding: 0.5rem;
                vertical-align: middle;
            }
            .number {
                border-right: 2px solid #fff;
                padding: 0;
                text-align: center;
                min-width: 3rem;
                max-width: 3rem;
            }
            #join:hover {
                background: gray;
                border-radius: 50px;
            }
			#close:hover {
				background: #0dcaf0;
			}
			
        `;
  
      this.shadowRoot.innerHTML = `
        <div class="container">
          <div id="rooms-container"></div>
          <div id="game-container" style="display:none;">
            <canvas id="gameCanvas" width="${this.CANVAS_WIDTH}" height="${this.CANVAS_HEIGHT}"></canvas>
            <div id="waitingMessage"></div>
            <div id="scoreBoard">
              <span id="leftScore">0</span> - <span id="rightScore">0</span>
            </div>
            <div id="roomInfo"></div>
            <div id="winner"></div>
            <button id="resetButton">Reset Game</button>
          </div>
        </div>
      `;
  
      this.shadowRoot.appendChild(style);
    }
  
    init() {
      this.connectSocket();
      this.setupEventListeners();
      this.getTournament();
    }
  
    connectSocket() {
        //console.log('connect socket', window.roomSocket);
    //   window.roomSocket = new WebSocket(`ws://localhost:8000/ws/rooms/?token=${this.access_token}`);
    //   window.roomSocket.onopen = () => {
    //     //console.log('WebSocket connection established');
    //   };
      window.roomSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        //console.log(data);
        if (data.type === 'room_update') {
          this.updateRooms(data.rooms);
        } else if (data.type === 'final_update') {
          this.handleFinalUpdate(data);
        } else if (data.type === 'error') {
          this.showError(data.message);
        }
      };
    }
  
    setupEventListeners() {
      this.shadowRoot.addEventListener('click', (event) => {
        if (event.target.classList.contains('join-btn')) {
          const roomId = event.target.getAttribute('data-room');
          this.joinRoom(roomId);
        }
        if (event.target.classList.contains('cancel-btn')) {
          const roomId = event.target.getAttribute('data-room');
          this.leaveRoom(roomId);
        }
        if (event.target.classList.contains('create-btn')) {
          const roomName = prompt('Enter Room Name');
          this.createRoom(roomName);
        }
      });
  
    //   document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    //   document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    //   this.shadowRoot.getElementById('resetButton').addEventListener('click', () => this.resetGame());
    }
  
    updateRooms(updatedRooms) {
        //console.log('update rooms ======= > ');
      this.rooms = updatedRooms;
      const roomContent = this.shadowRoot.getElementById('rooms-container');
      roomContent.innerHTML = '';
  
      this.createRoomButton(roomContent);
      this.rooms.forEach(room => this.createRoomElement(room, roomContent));
    }
  
    createRoomElement(room, roomContent) {
        //console.log('create room element');
      const roomDiv = document.createElement('div');
      roomDiv.classList.add('room');
      roomDiv.innerHTML = `
        <h2>${room.name}</h2>
        <ul>
          ${room.players.map(player => `
            <li>
              ${player.nickname}
              ${player.is_current_user ? `<button class="cancel-btn" data-room="${room.id}">leave</button>` : ``}
            </li>`).join('')}
        </ul>
        ${room.is_full ? `` : `<button class="join-btn" data-room="${room.id}">Join</button>`}
      `;
      const is_current_user = room.players.some(player => player.is_current_user);
        if (room.is_full && is_current_user && !this.winner) {
            //console.log('get matchs');
            this.getMatchs(room);
            // this.shadowRoot.querySelector('.container').style.display = 'none';
        } else if (!this.winner) {
            // this.shadowRoot.getElementById('game-container').style.display = 'none';
        } 
        //console.log('room div', roomDiv);
      roomContent.appendChild(roomDiv);
    }
  
    createRoomButton(roomContent) {
      const btncreate = document.createElement('button');
      btncreate.textContent = 'Create Room';
      btncreate.classList.add('create-btn');
      roomContent.appendChild(btncreate);
    }
  
    joinRoom(roomId) {
      const InputNickname = document.createElement('input');
      InputNickname.setAttribute('type', 'text');
      InputNickname.setAttribute('placeholder', 'Enter your nick name');
  
      const SubmitButton = document.createElement('button');
      SubmitButton.textContent = 'Submit';
  
      this.shadowRoot.querySelector('.container').appendChild(InputNickname);
      this.shadowRoot.querySelector('.container').appendChild(SubmitButton);
  
      SubmitButton.addEventListener('click', () => {
        this.nickname = InputNickname.value;
        this.sendSocketMessage({
          action: 'join',
          room_id: roomId,
          nickname: this.nickname,
          user: this.current_user
        });
        InputNickname.remove();
        SubmitButton.remove();
      });
    }
  
    leaveRoom(roomId) {
      this.sendSocketMessage({
        action: 'leave',
        room_id: roomId
      });
    }
  
    sendSocketMessage(data) {
      if (window.roomSocket && window.roomSocket.readyState === WebSocket.OPEN) {
        window.roomSocket.send(JSON.stringify(data));
      }
    }
  
    async createRoom(roomName) {
      try {
        let response = await fetch(`http://localhost:8000/api/rooms/create-room/${roomName}/`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${this.access_token}`,
          }
        });
        response = await this.handleAuthResponse(response, this.createRoom.bind(this));
        if (response.ok) {
          const data = await response.json();
          if (data.success)
            this.joinRoom(data.room_id);
          else
            console.error(data.message);
        }
      } catch (error) {
        window.location.href = 'https://127.0.0.1/singin';
      }
    }
  
    async getTournament() {
      try {
        let response = await fetch('http://127.0.0.1:8000/api/rooms/rooms-list/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${this.access_token}`,
          }
        });
        response = await this.handleAuthResponse(response, this.getTournament.bind(this));
        if (response.ok) {
          const data = await response.json();
          this.updateRooms(data.rooms);
          this.current_user = data.current_user;
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    async getMatchs(room) {
      try {
        let response = await fetch(`http://localhost:8000/api/rooms/${room.id}/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${this.access_token}`,
          }
        });
        // response = await this.handleAuthResponse(response, this.getMatchs.bind(this));
        if (response.ok) {
          const data = await response.json();
          //console.log(data);
          localStorage.setItem('roomID', room.id);
          if (data.success) {
            this.updateMatches(data.matches, data.match_id);
          }
        }
      } catch (error) {
        navigateTo('/signin');
      } 
    }
  
    updateMatches(matches, matchID) {
      const players = this.shadowRoot.querySelectorAll('.player');
      let i = 0;
      matches.forEach(match => {
        //console.log(match.player1 + ' vs ' + match.player2);
        // players[i].textContent = match.player1;
        // players[i+1].textContent = match.player2;
        i+=2;
      });
     
      if (!this.winner) {
        // this.shadowRoot.getElementById('game-container').style.display = 'flex';
        localStorage.setItem('matchID', matchID);
        navigateTo('/tournament');
        // this.startGame(localStorage.getItem('matchID'));
      }
    }
  
    // startGame(matchID) {
    //   this.initializeGame(matchID);
    // }
  
    // initializeGame(matchID) {
    //   localStorage.setItem('matchID', matchID);
    //   const gameSocket = new WebSocket(`ws://localhost:8000/ws/game/${matchID}/?token=${this.access_token}`);
  
    //   gameSocket.onopen = () => {
    //     //console.log('WebSocket connection established');
    //     this.drawGame();
    //   };
  
    //   gameSocket.onclose = () => {
    //     //console.log('WebSocket connection closed');
    //   };
  
    //   gameSocket.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
        
    //     switch (data.type) {
    //       case 'game_state':
    //         this.handleGameState(data.game_state);
    //         break;
    //       case 'paddle_move':
    //         this.handlePaddleMove(data.paddle_move);
    //         break;
    //       case 'ball_position':
    //         this.handleBallPosition(data.ball_position);
    //         break;
    //       case 'score_update':
    //         this.handleScoreUpdate(data.score_update);
    //         break;
    //     }
        
    //     this.drawGame();
    //   };
  
    //   this.gameSocket = gameSocket;
    // }
  
    // handleGameState(gameState) {
    //   this.leftPaddle.y = gameState.left_paddle_y;
    //   this.rightPaddle.y = gameState.right_paddle_y;
    //   this.ball.x = gameState.ball_position.x;
    //   this.ball.y = gameState.ball_position.y;
    //   this.leftPaddle.score = gameState.left_score;
    //   this.rightPaddle.score = gameState.right_score;
    //   this.updateScore();
      
    //   if (gameState.players === 1) {
    //     this.isPlayerOne = true;
    //     this.shadowRoot.getElementById('waitingMessage').textContent = "You are Player 1 (Left Paddle). Waiting for Player 2...";
    //     this.shadowRoot.getElementById('player1').textContent = gameState.nickname_one;
    //     this.leftPlayer = true;
    //   } else if (gameState.players === 2 && !this.gameStarted) {
    //     this.shadowRoot.getElementById('waitingMessage').style.display = 'none';
    //     this.isPlayerOne = true;
    //     this.gameStarted = true;
    //     const playerMessage = this.leftPlayer ? "You are Player 1 (Left Paddle)" : "You are Player 2 (Right Paddle)";
    //     this.shadowRoot.getElementById('player1').textContent = gameState.nickname_one;
    //     this.shadowRoot.getElementById('player2').textContent = gameState.nickname_two;
    //     this.shadowRoot.getElementById('roomInfo').innerHTML += `<br>${playerMessage}`;
    //     this.gameLoop();
    //   }
    // }
  
    // movePaddles() {
    //   let leftPaddleMoved = false;
    //   let rightPaddleMoved = false;
  
    //   if (this.leftPlayer) {
    //     if ((this.keys.w || this.keys.ArrowUp) && this.leftPaddle.y > 0) {
    //       this.leftPaddle.y -= this.leftPaddle.speed;
    //       leftPaddleMoved = true;
    //     } else if ((this.keys.s || this.keys.ArrowDown) && this.leftPaddle.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
    //       this.leftPaddle.y += this.leftPaddle.speed;
    //       leftPaddleMoved = true;
    //     }
    //   } else {
    //     if ((this.keys.w || this.keys.ArrowUp) && this.rightPaddle.y > 0) {
    //       this.rightPaddle.y -= this.rightPaddle.speed;
    //       rightPaddleMoved = true;
    //     } else if ((this.keys.s || this.keys.ArrowDown) && this.rightPaddle.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
    //       this.rightPaddle.y += this.rightPaddle.speed;
    //       rightPaddleMoved = true;
    //     }
    //   }
  
    //   if (leftPaddleMoved) {
    //     this.sendPaddleMove(this.leftPaddle, 'left');
    //   }
    //   if (rightPaddleMoved) {
    //     this.sendPaddleMove(this.rightPaddle, 'right');
    //   }
    // }
  
    // sendPaddleMove(paddle, side) {
    //   this.gameSocket.send(JSON.stringify({
    //     paddle_move: {
    //       player: side,
    //       y: paddle.y
    //     }
    //   }));
    
    // }
  
    // gameLoop() {
    //   if (!this.gameStarted || this.leftPaddle.score >= 5 || this.rightPaddle.score >= 5) {
    //     if (this.leftPaddle.score >= 5)
    //       this.winner = this.shadowRoot.getElementById('player1').textContent;
    //     else if (this.rightPaddle.score >= 5)
    //       this.winner = this.shadowRoot.getElementById('player2').textContent;
    //     if (this.winner) {
    //       this.shadowRoot.getElementById('winner').textContent = this.winner;
    //       this.gameSocket.close();
    //     }
    //     return;
    //   }
    //   this.movePaddles();
    //   if (this.isPlayerOne) {
    //     this.moveBall();
    //   }
    //   this.drawGame();
    //   requestAnimationFrame(() => this.gameLoop());
    // }
  
    // handlePaddleMove(paddleMove) {
    //   if (paddleMove.player === 'left') {
    //     this.leftPaddle.y = paddleMove.y;
    //   } else {
    //     this.rightPaddle.y = paddleMove.y;
    //   }
    // }
  
    // handleBallPosition(ballPosition) {
    //   this.ball.x = ballPosition.x;
    //   this.ball.y = ballPosition.y;
    //   this.ball.speedX = ballPosition.speedx;
    //   if (ballPosition.y <= 0 && ballPosition.speedy <= 0)
    //     this.ball.speedY = -ballPosition.speedy;
    //   else
    //     this.ball.speedY = ballPosition.speedy;
    // }
  
    // handleScoreUpdate(scoreUpdate) {
    //   this.leftPaddle.score = scoreUpdate.left_score;
    //   this.rightPaddle.score = scoreUpdate.right_score;
    //   this.updateScore();
    // }
  
    // sendBallPosition() {
    //   this.gameSocket.send(JSON.stringify({
    //     ball_position: {
    //       x: this.ball.x,
    //       y: this.ball.y,
    //       speedx: this.ball.speedX,
    //       speedy: this.ball.speedY
    //     }
    //   }));
    // }
  
    // sendScoreUpdate() {
    //   this.gameSocket.send(JSON.stringify({
    //     score_update: {
    //       type: 'score_game',
    //       left_score: this.leftPaddle.score,
    //       right_score: this.rightPaddle.score,
    //       match_id: localStorage.getItem('matchID'),
    //     }
    //   }));
    // }
  
    // updateScore() {
    //   this.shadowRoot.getElementById('leftScore').textContent = this.leftPaddle.score;
    //   this.shadowRoot.getElementById('rightScore').textContent = this.rightPaddle.score;
    // }
  
    // moveBall() {
    //   this.ball.x += this.ball.speedX;
    //   this.ball.y += this.ball.speedY;
  
    //   let checkWall = false;
    //   let checkPaddle = false;
  
    //   if (this.ball.y <= 0 || this.ball.y >= this.CANVAS_HEIGHT - this.BALL_SIZE) {
    //     this.ball.speedY = -this.ball.speedY;
    //     checkWall = true;
    //   }
  
    //   if (
    //     (this.ball.x <= this.leftPaddle.x + this.PADDLE_WIDTH && this.ball.y + this.BALL_SIZE >= this.leftPaddle.y && this.ball.y <= this.leftPaddle.y + this.PADDLE_HEIGHT) ||
    //     (this.ball.x + this.BALL_SIZE >= this.rightPaddle.x && this.ball.y + this.BALL_SIZE >= this.rightPaddle.y && this.ball.y <= this.rightPaddle.y + this.PADDLE_HEIGHT)
    //   ) {
    //     this.ball.speedX = -this.ball.speedX;
    //     checkPaddle = true;
    //   }
  
    //   if (this.ball.x < 0) {
    //     this.rightPaddle.score++;
    //     this.resetBall();
    //     this.sendScoreUpdate();
    //   }
  
    //   if (this.ball.x > this.CANVAS_WIDTH) {
    //     this.leftPaddle.score++;
    //     this.resetBall();
    //     this.sendScoreUpdate();
    //   }
  
    //   if (checkWall || checkPaddle) {
    //     if (this.ball.y > this.CANVAS_HEIGHT - this.BALL_SIZE)
    //       this.ball.y -= this.BALL_SIZE;
    //     this.sendBallPosition();
    //   }
    // }
  
    // resetBall() {
    //   this.ball.x = this.CANVAS_WIDTH / 2;
    //   this.ball.y = this.CANVAS_HEIGHT / 2;
    //   this.ball.speedX = -this.ball.speedX;
    // }
  
    // drawGame() {
    //   const ctx = this.shadowRoot.getElementById('gameCanvas').getContext('2d');
    //   ctx.fillStyle = 'black';
    //   ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    //   ctx.fillStyle = 'white';
    //   ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
    //   ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
    //   ctx.fillRect(this.ball.x, this.ball.y, this.BALL_SIZE, this.BALL_SIZE);
    // }
  
    // resetGame() {
    //   this.leftPaddle.score = 0;
    //   this.rightPaddle.score = 0;
    //   this.resetBall();
    //   this.updateScore();
    //   this.sendScoreUpdate();
    //   this.sendBallPosition();
    // }
  
    // handleKeyDown(e) {
    //   if (e.key in this.keys) {
    //     e.preventDefault();
    //     this.keys[e.key] = true;
    //   }
    // }
  
    // handleKeyUp(e) {
    //   if (e.key in this.keys) {
    //     e.preventDefault();
    //     this.keys[e.key] = false;
    //   }
    // }
  
    async handleAuthResponse(response, retryFunction) {
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh: refreshToken }),
            });
  
            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              localStorage.setItem('access_token', data.access);
              return retryFunction();
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (error) {
            console.error('Error refreshing token:', error);
            // Handle failed refresh (e.g., redirect to login)
          }
        } else {
          // Handle missing refresh token (e.g., redirect to login)
        }
      }
      return response;
    }
  
    handleFinalUpdate(data) {
      const finalElement = this.shadowRoot.querySelector('.final');
      if (data.winners[1]) {
        finalElement.textContent = `${data.winners[0].nickname} vs ${data.winners[1].nickname}`;
        this.roomstate = 'final';
        localStorage.setItem('roomstate', 'final');
        if (data.winners[0].username === this.current_user || data.winners[1].username === this.current_user) {
        //   this.shadowRoot.getElementById('game-container').style.display = 'flex';
        //   this.shadowRoot.querySelector('.collegraph').style.display = 'none';
          window.type_game = 'final_match';
          localStorage.setItem('matchID', data.match_id);
        //   this.startGame(data.match_id);
        }
      } else {
        finalElement.textContent = `${data.winners[0].nickname} vs ...`;
      }
    }
  
    showError(message) {
      console.error(message);
      // Implement error display logic here
    }
  }
  
  customElements.define('tournament-game', TournamentGame);
