// Game state and constants


class OnlineGame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isMultiplayer = true;
        this.render();
    }

    render() {
        const onlineGame = document.createElement("div");
        onlineGame.className = "container text-light position-relative";
        onlineGame.id = "online-game";
        onlineGame.innerHTML = `
        <div class="w-100 d-flex justify-content-between align-items-center my-4 text-light">
            <span id="player1" class="bg-success p-2 px-4 rounded fs-5">Player 1</span>
            <div id="scoreBoard" class="fs-3">
                <span id="leftScore" class="fw-sem px-2">0</span> - <span id="rightScore" class="fw-sem px-2">0</span>
            </div>
            <span id="player2" class="bg-info p-2 px-4 rounded fs-5">Player 2</span>
        </div>
        <div id="trophy" class="trophy-container hidden">
            <div class="trophy">
                🏆
            </div>
            <div class="winner-text">Congratulations!</div>
        </div>
        <canvas id="gameCanvas" height="400" width="800" class="w-100 h-100 border"></canvas>`;

        this.shadowRoot.appendChild(onlineGame);
        this.addGameLogic();
    }

    addGameLogic() {
        const leftScore = this.shadowRoot.getElementById("leftScore");
        const rightScore = this.shadowRoot.getElementById("rightScore");
        const trophy = this.shadowRoot.getElementById("trophy");
        const winnerText = this.shadowRoot.querySelector(".winner-text");

        let leftScoreValue = 0;
        let rightScoreValue = 0;

        const checkWinner = () => {
            if (leftScoreValue >= 10 || rightScoreValue >= 10) {
                trophy.classList.remove("hidden");
                winnerText.textContent = leftScoreValue >= 10 ? "Player 1 Wins!" : "Player 2 Wins!";
            }
        };

        // Dummy example of scoring logic
        this.shadowRoot.getElementById("gameCanvas").addEventListener("click", () => {
            leftScoreValue += Math.floor(Math.random() * 2);
            rightScoreValue += Math.floor(Math.random() * 2);
            leftScore.textContent = leftScoreValue;
            rightScore.textContent = rightScoreValue;
            checkWinner();
        });
    }
}

customElements.define('online-game', OnlineGame);


const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;

let gameStarted = false;
let isPlayerOne = false;
let leftPlayer = false;
let winner = null;
let gameSocket = null;

const leftPaddle = {
    x: 0,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    speed: 5,
    score: 0
};

const rightPaddle = {
    x: CANVAS_WIDTH - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    speed: 5,
    score: 0
};

const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    speedX: 5,
    speedY: 5
};

const keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false
};



// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const waitingMessage = document.getElementById('waitingMessage');
const leftScoreElement = document.getElementById('leftScore');
const rightScoreElement = document.getElementById('rightScore');
const roomNameElement = document.getElementById('roomName');
const resetButton = document.getElementById('resetButton');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');

function initializeGame(matchID) {
    localStorage.setItem('matchID', matchID);
    const access_token = localStorage.getItem('access_token');
    gameSocket = new WebSocket(`ws://localhost:8000/ws/game/${matchID}/?token=${access_token}`);

    gameSocket.onopen = () => {
        ////////console.log('WebSocket connection established');
        drawGame();
    };

    gameSocket.onclose = () => {
        ////////console.log('WebSocket connection closed');
    };

    gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
            case 'game_state':
                handleGameState(data.game_state);
                break;
            case 'paddle_move':
                handlePaddleMove(data.paddle_move);
                break;
            case 'ball_position':
                handleBallPosition(data.ball_position);
                break;
            case 'score_update':
                handleScoreUpdate(data.score_update);
                break;
        }
        
        drawGame();
    };
}

function handleGameState(gameState) {
    leftPaddle.y = gameState.left_paddle_y;
    rightPaddle.y = gameState.right_paddle_y;
    ball.x = gameState.ball_position.x;
    ball.y = gameState.ball_position.y;
    leftPaddle.score = gameState.left_score;
    rightPaddle.score = gameState.right_score;
    ////////console.log(gameState);
    updateScore();

    if (gameState.players === 1) {
        isPlayerOne = true;
        waitingMessage.textContent = "You are Player 1 (Left Paddle). Waiting for Player 2...";
        player1.textContent = gameState.nickname_one;
        leftPlayer = true;
    } else if (gameState.players === 2 && !gameStarted) {
        waitingMessage.style.display = 'none';
        isPlayerOne = true;
        gameStarted = true;
        const playerMessage = leftPlayer ? "You are Player 1 (Left Paddle)" : "You are Player 2 (Right Paddle)";
        player1.textContent = gameState.nickname_one;
        player2.textContent = gameState.nickname_two;
        document.getElementById('roomInfo').innerHTML += `<br>${playerMessage}`;
        gameLoop();
    }
}

function movePaddles() {
    let leftPaddleMoved = false;
    let rightPaddleMoved = false;

    if (leftPlayer) {
        if ((keys.w || keys.ArrowUp) && leftPaddle.y > 0) {
            leftPaddle.y -= leftPaddle.speed;
            leftPaddleMoved = true;
        } else if ((keys.s || keys.ArrowDown) && leftPaddle.y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
            leftPaddle.y += leftPaddle.speed;
            leftPaddleMoved = true;
        }
    } else {
        if ((keys.w || keys.ArrowUp) && rightPaddle.y > 0) {
            rightPaddle.y -= rightPaddle.speed;
            rightPaddleMoved = true;
        } else if ((keys.s || keys.ArrowDown) && rightPaddle.y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
            rightPaddle.y += rightPaddle.speed;
            rightPaddleMoved = true;
        }
    }

    if (leftPaddleMoved) {
        sendPaddleMove(leftPaddle, 'left');
    }
    if (rightPaddleMoved) {
        sendPaddleMove(rightPaddle, 'right');
    }
}

function sendPaddleMove(paddle, side) {
    gameSocket.send(JSON.stringify({
        paddle_move: {
            player: side,
            y: paddle.y
        }
    }));
}

function gameLoop() {
    ////////console.log(leftPaddle.score, rightPaddle.score);
    if (!gameStarted || leftPaddle.score >= 5 || rightPaddle.score >= 5) {
        if (leftPaddle.score >= 5)
            winner = player1.textContent;
        else if (rightPaddle.score >= 5)
            winner = player2.textContent;
        if (winner) {
            document.getElementById('winner').textContent = winner;
            // sendWinner();
            gameSocket.close();
        }
        return;
    }
    movePaddles();
    if (isPlayerOne) {
        moveBall();
    }
    drawGame();
    requestAnimationFrame(gameLoop);
}

function handlePaddleMove(paddleMove) {
    if (paddleMove.player === 'left') {
        leftPaddle.y = paddleMove.y;
    } else {
        rightPaddle.y = paddleMove.y;
    }
}

function handleBallPosition(ballPosition) {
    ball.x = ballPosition.x;
    ball.y = ballPosition.y;
    ball.speedX = ballPosition.speedx;
    if (ballPosition.y <= 0 && ballPosition.speedy <= 0)
        ball.speedY = -ballPosition.speedy;
    else
        ball.speedY = ballPosition.speedy;
}

function handleScoreUpdate(scoreUpdate) {
    leftPaddle.score = scoreUpdate.left_score;
    rightPaddle.score = scoreUpdate.right_score;
    updateScore();
}

function sendBallPosition() {
    gameSocket.send(JSON.stringify({
        ball_position: {
            x: ball.x,
            y: ball.y,
            speedx: ball.speedX,
            speedy: ball.speedY
        }
    }));
}

function sendScoreUpdate() {
    gameSocket.send(JSON.stringify({
        score_update: {
            type: 'score_game',
            left_score: leftPaddle.score,
            right_score: rightPaddle.score,
            match_id: localStorage.getItem('matchID'),
        }
    }));
}

function sendWinner() {
    gameSocket.send(JSON.stringify({
        winner_data: {
            winner: winner,
            match_id: localStorage.getItem('matchID')
        }
    }));
}

function drawPaddle(paddle) {
    ctx.fillStyle = 'white';
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function drawBall() {
    ctx.fillStyle = 'white';
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
}

function updateScore() {
    leftScoreElement.textContent = leftPaddle.score;
    rightScoreElement.textContent = rightPaddle.score;
}

function moveBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    let checkWall = false;
    let checkPaddle = false;

    if (ball.y <= 0 || ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
        ball.speedY = -ball.speedY;
        checkWall = true;
    }

    if (
        (ball.x <= leftPaddle.x + PADDLE_WIDTH && ball.y + BALL_SIZE >= leftPaddle.y && ball.y <= leftPaddle.y + PADDLE_HEIGHT) ||
        (ball.x + BALL_SIZE >= rightPaddle.x && ball.y + BALL_SIZE >= rightPaddle.y && ball.y <= rightPaddle.y + PADDLE_HEIGHT)
    ) {
        ball.speedX = -ball.speedX;
        checkPaddle = true;
    }

    if (ball.x < 0) {
        rightPaddle.score++;
        resetBall();
        sendScoreUpdate();
    }

    if (ball.x > CANVAS_WIDTH) {
        leftPaddle.score++;
        resetBall();
        sendScoreUpdate();
    }

    if (checkWall || checkPaddle) {
        if (ball.y > CANVAS_HEIGHT - BALL_SIZE)
            ball.y -= BALL_SIZE;
        sendBallPosition();
    }
}

function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.speedX = -ball.speedX;
}

function drawGame() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);
    drawBall();
}

function resetGame() {
    leftPaddle.score = 0;
    rightPaddle.score = 0;
    resetBall();
    updateScore();
    sendScoreUpdate();
    sendBallPosition();
}

function initEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key in keys) {
            e.preventDefault();
            keys[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in keys) {
            e.preventDefault();
            keys[e.key] = false;
        }
    });

    resetButton.addEventListener('click', resetGame);
}

// Initialize the game
function startGame(matchID) {
    initEventListeners();
    localStorage.setItem('matchID', matchID);
    initializeGame(matchID);
}

// Export the startGame function to be called from outside
window.startGame = startGame;
let token_access = localStorage.getItem('access_token');
async function fetchMatchID() {
    const status = "normal";
    try {
        let response = await fetch(`http://localhost:8000/api/game/${status}/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token_access}`,
            }
        });
        response = await handleAuthResponse(response, fetchMatchID);
        if (response.ok) {
            const data = await response.json();
            ////////console.log(data);
            // player1.textContent = data.player1;
            // player2.textContent = data.player2;
            startGame(data.id);
        }
    } catch (error) {
        console.error(error);
    }
}

fetchMatchID();
// startGame(2);

// export { startGame, winner};