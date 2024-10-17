let collecgraph = document.querySelector('.collegraph');
let players = document.querySelectorAll('.player');
let game = document.querySelector('.game');
let container = document.querySelector('.container');

class RoomManger {
    constructor() {
        this.socket = null;
        this.rooms = [];
        this.current_user = null;
        this.access_token = localStorage.getItem('access_token');
        this.init();
    }
    init() {
        this.connectSocket();
        this.setupEventListeners();
        this.checkAuth();
    }

    connectSocket() {
        this.socket = new WebSocket(`ws://localhost:8000/ws/rooms/?token=${this.access_token}`);
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data.type);
            if (data.type === 'room_update') {
                this.updateRooms(data.rooms);
            }
            if (data.type === 'match_update') {
                this.updateMatches(data.matches);
            }
            if (data.type === 'error') {
                showError(data.message);
            }
        };
    }

    setupEventListeners() {
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('join-btn')) {
                const roomId = event.target.getAttribute('data-room');
                this.joinRoom(roomId);
            }
            if (event.target.classList.contains('cancel-btn')) {
                const roomId = event.target.getAttribute('data-room');
                this.leaveRoom(roomId);
            }
            if (event.target.classList.contains('create-btn')) {
                this.createRoom();
            }
        });
    }

    updateRooms(rooms) {
        this.rooms = rooms;
        const roomContent = document.getElementById('rooms-container');
        roomContent.innerHTML = '';

        if (rooms.length === 0) {
            this.createRoomButton(roomContent);
        } else {
            rooms.forEach(room => this.createRoomElement(room, roomContent));
            if (rooms.every(room => room.is_full)) {
                this.createRoomButton(roomContent);
            }
        }
    }

    createRoomElement(room, roomContent) {
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
        if (room.is_full && room.players.some(player => player.is_current_user))
        {
            this.getMatchs(room);
            collecgraph.style.display = 'block';
            container.style.display = 'none';
        } else {
            collecgraph.style.display = 'none';
        }
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
        InputNickname.setAttribute('name', 'nickname');
        InputNickname.setAttribute('id', 'nickname');
        
        const SubmitButton = document.createElement('button');
        SubmitButton.textContent = 'Submit';
        SubmitButton.setAttribute('type', 'submit');
        SubmitButton.setAttribute('id', 'submit');

        document.body.appendChild(InputNickname);
        document.body.appendChild(SubmitButton);

        SubmitButton.addEventListener('click', () => {
            const nickname = InputNickname.value;
            this.sendSocketMessage({
                action: 'join',
                room_id: roomId,
                nickname: nickname,
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
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
    async createRoom() {
        try {
            let response = await fetch('http://localhost:8000/api/rooms/create-room/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                }
            });
            response = await handleAuthResponse(response, this.createRoom);
            if (response.ok) {
                const data = await response.json();
                if (data.success)
                    this.joinRoom(data.room_id);
                else
                    console.error(data.message);
            }
        } catch (error) {
            window.location.href = 'https://127.0.0.1/frontend/signin/signin.html';
        }
    }
    async checkAuth() {
        try {
            let response = await fetch('http://127.0.0.1:8000/api/rooms/rooms-list/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                }
            });
            response = await handleAuthResponse(response, this.checkAuth);
            if (response.ok) {
                const data = await response.json();
                this.updateRooms(data.rooms);
                this.current_user = data.current_user;
            }
        } catch (error) {
            window.location.href = 'https://127.0.0.1:443/frontend/signin/signin.html';        }
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
            response = await handleAuthResponse(response, this.getMatchs);
            if (response.ok) {
                const data = await response.json();
                this.updateMatches(data.matches, data.match_id);
            }
        } catch (error) {
            window.location.href = 'https://127.0.0.1:443/frontend/signin/signin.html';
        } 
    }

    updateMatches(matches, matchID) {
        console.log(matches);
        let i = 0;
        matches.forEach(match => {
            players[i].textContent = match.player1;
            players[i+1].textContent = match.player2;
            i+=2;
        }
    );
    setTimeout(() => {
        // let final = document.getElementsByClassName('final')[0];
        // final.textContent = players[0].textContent + " vs " + players[1].textContent;
        game.style.display = 'flex';
        collecgraph.style.display = 'none';
        // this.sendSocketMessage({
        //     action: 'close'
        // });
        new ManageGameAttachment(matchID);
        // matches.forEach(match => {
        //     this.fetchMatches(match.id);
        //     // if (match.player1 === this.current_user.nickname || match.player2 === this.current_user.nickname)
        //     // new ManageGameAttachment(match.id);
        
        // });
    }, 1000);
    }

    async fetchMatches(matchID) {
        try {
            let response = await fetch(`http://localhost:8000/api/rooms/matches/${matchID}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                }
            });
            response = await handleAuthResponse(response, this.fetchMatches);
            if (response.ok) {
                const data = await response.json();
                new ManageGameAttachment(da);
            }
        } catch (error) {
            window.location.href = 'https://127.0.0.1/frontend/signin/signin.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RoomManger();
});

function selectWinner(match) {
    let round = match.parentElement;
    let matches = round.getElementsByClassName('match');
    for (let i = 0; i < matches.length; i++) {
        matches[i].classList.remove('winner');
    }
    
    match.classList.add('winner');

    if (round.children.length > 1) {
        let final = document.getElementsByClassName('final')[0];
        final.textContent = match.textContent + " vs ";
    }
}


// game logic

class ManageGameAttachment {
    constructor(matchID) {
        this.access_token = localStorage.getItem('access_token');
        console.log(matchID);
        this.matchID = matchID;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.waitingMessage = document.getElementById('waitingMessage');
        this.leftScoreElement = document.getElementById('leftScore');
        this.rightScoreElement = document.getElementById('rightScore');
        this.roomNameElement = document.getElementById('roomName');
        this.resetButton = document.getElementById('resetButton');

        this.CANVAS_WIDTH = 800;
        this.CANVAS_HEIGHT = 400;
        this.PADDLE_WIDTH = 10;
        this.PADDLE_HEIGHT = 100;
        this.BALL_SIZE = 10;

        this.gameStarted = false;
        this.isPlayerOne = false;
        this.leftPlayer = false;
        this.winner = null;

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

        this.socket = null;
        // this.roomName = this.joinUrl();

        this.initEventListeners();
        this.initializeGame(this.matchID);
        // this.startGame();
    }

    // async startGame() {
    //     try {
    //         const access_token = localStorage.getItem('access_token');
    //         let response = await fetch(`http://localhost:8000/api/rooms/gamestart/${this.matchID}`, {
    //             method: 'GET',
    //             credentials: 'include',
    //             headers: {
    //                 'Authorization': `Bearer ${access_token}`
    //             }
    //         });
    //         if (response.ok) {
    //             const data = await response.json();
    //             this.initializeGame(data.match);
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }

    initializeGame() {
        // this.roomNameElement.textContent = this.roomName;
        this.socket = new WebSocket(`ws://localhost:8000/ws/game/${this.matchID}/?token=${this.access_token}`);

        this.socket.onopen = () => {
            console.log('WebSocket connection established');
            this.drawGame();
        };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.socket.onmessage = (event) => {
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

    // generateRoomName() {
    //     return Math.random().toString(36).substring(2, 8);
    // }

    // joinUrl() {
    //     let roomName = new URLSearchParams(window.location.search).get('room');
    //     if (!roomName) {
    //         roomName = this.generateRoomName();
    //         window.history.pushState({}, '', `?room=${roomName}`);
    //     }
    //     return roomName;
    // }

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
            this.leftPlayer = true;
        } else if (gameState.players === 2 && !this.gameStarted) {
            this.waitingMessage.style.display = 'none';
            this.isPlayerOne = true;
            this.gameStarted = true;
            const playerMessage = this.leftPlayer ? "You are Player 1 (Left Paddle)" : "You are Player 2 (Right Paddle)";
            document.getElementById('roomInfo').innerHTML += `<br>${playerMessage}`;
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
        this.socket.send(JSON.stringify({
            paddle_move: {
                player: side,
                y: paddle.y
            }
        }));
    }

    gameLoop() {
        if (!this.gameStarted || this.leftPaddle.score >= 5 || this.rightPaddle.score >= 5) {
            if (this.leftPaddle.score >= 5)
                this.winner = "left";
            else if (this.rightPaddle.score >= 5)
                this.winner = "right";
            if (this.winner) {
                document.getElementById('winner').textContent = this.winner;
                document.getElementById('winnerInfo').style.display = 'block';
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
        this.socket.send(JSON.stringify({
            ball_position: {
                x: this.ball.x,
                y: this.ball.y,
                speedx: this.ball.speedX,
                speedy: this.ball.speedY
            }
        }));
    }

    sendScoreUpdate() {
        this.socket.send(JSON.stringify({
            score_update: {
                left_score: this.leftPaddle.score,
                right_score: this.rightPaddle.score
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
        this.leftPaddle.score = 0;
        this.rightPaddle.score = 0;
        this.resetBall();
        this.updateScore();
        this.sendScoreUpdate();
        this.sendBallPosition();
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key in this.keys) {
                e.preventDefault();
                this.keys[e.key] = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key in this.keys) {
                e.preventDefault();
                this.keys[e.key] = false;
            }
        });

        this.resetButton.addEventListener('click', () => this.resetGame());
    }
}

// Usage
// const game = new ManageGameAttachment('your_match_id_here');