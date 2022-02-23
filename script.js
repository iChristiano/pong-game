
// Canvas
const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const gameOverEl = document.createElement('div');
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const height = isMobile ? window.innerHeight * 0.98 : window.innerHeight * 0.9;
const width = isMobile ? window.innerWidth * 0.98 : window.innerWidth * 0.6;
const centerCircleRadius = isMobile ? 50 : 75;
const screenWidth = window.innerWidth;
const canvasPosition = screenWidth / 2 - width / 2;
const strokeColor = 'white';
const lineGap = 6;
const playgroundFont = 'Arial';
const playgroundFontSize = 40;
const playgroundFontColorOpaque50 = 'rgba(255, 255, 255, 0.5)';
const playgroundFontColorOpaque90 = 'rgba(255, 255, 255, 0.9)';
const backgroundGradientStartColor = '#0499f2';
const backgroundGradientEndColor = '#63a4ff';

let playgroundFontColorComputer = playgroundFontColorOpaque50;
let playgroundFontColorPlayer = playgroundFontColorOpaque90;

// Player
const namePlayer = 'Player 1'; 
const nameComputer = 'Computer';

// Paddle
const paddleHeight = 6;
const paddleWidth = 50;
const paddleOffsetY = 10;
const paddleDiff = paddleWidth / 2;
let paddleTopX = width / 2 - paddleDiff;
let paddleBottomX = width / 2 - paddleDiff;

let playerMoved = false;
let paddleContact = false;

// Ball
const ballRadius = 5;
let ballX = width / 2;
let ballY = height / 2;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Change Mobile Settings
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
const scoreSize = 32;
const winningScore = 3;
const scoreOffsetComputer = 25;
const scoreOffsetPlayer = 31;
let playerScore = 0;
let computerScore = 0;
let isGameOver = false;
let isNewGame = true;

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background Gradient
  let grd = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  grd.addColorStop(0, backgroundGradientStartColor);
  grd.addColorStop(1, backgroundGradientEndColor);
  context.fillStyle = grd;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Paddle Color
  context.fillStyle = strokeColor;

  // Computer Paddle (Top)
  context.fillRect(paddleTopX, paddleOffsetY, paddleWidth, paddleHeight);

  // Player Paddle (Bottom)
  context.fillRect(paddleBottomX, canvas.height - (paddleOffsetY + paddleHeight), paddleWidth, paddleHeight);

  // Center Line
  context.beginPath();
  context.setLineDash([]);
  context.moveTo(0, canvas.height / 2);
  context.lineTo(canvas.width, canvas.height / 2);
  context.strokeStyle = strokeColor;
  context.lineWidth = 2;
  context.stroke();

  // Center Circle
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, centerCircleRadius, 0, 2 * Math.PI);
  context.strokeStyle = strokeColor;
  context.stroke();

  // Dashed Top Line
  context.beginPath();
  context.setLineDash([lineGap]);
  context.moveTo(0, paddleOffsetY);
  context.lineTo(canvas.width, paddleOffsetY);
  context.strokeStyle = playgroundFontColorOpaque50;
  context.stroke();

  // Dashed Bottom Line
  context.beginPath();
  context.setLineDash([lineGap]);
  context.moveTo(0, canvas.height - paddleOffsetY);
  context.lineTo(canvas.width, canvas.height - paddleOffsetY);
  context.strokeStyle = playgroundFontColorOpaque50;
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = strokeColor;
  context.fill();

  // Score
  context.font = `${scoreSize}px ${playgroundFont}`;
  context.textAlign = 'center';
  context.textBaseline = 'bottom';
  context.fillText(computerScore, 20, canvas.height / 2 - scoreOffsetComputer);
  context.textBaseline = 'top';
  context.fillText(playerScore, 20, canvas.height / 2 + scoreOffsetPlayer);

  // Playground Text
  context.font = `${playgroundFontSize}px ${playgroundFont}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = playgroundFontColorComputer;
  context.fillText(nameComputer, canvas.width/2, canvas.height * 3/16); 
  context.fillStyle = playgroundFontColorPlayer;
  context.fillText(namePlayer, canvas.width/2, canvas.height * 13/16); 
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += -speedY;
  // Horizontal Speed
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  if (ballY < height / 2) {
    playgroundFontColorComputer = playgroundFontColorOpaque90;
    playgroundFontColorPlayer = playgroundFontColorOpaque50;
  } else {
    playgroundFontColorComputer = playgroundFontColorOpaque50;
    playgroundFontColorPlayer = playgroundFontColorOpaque90;
  }
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - (paddleOffsetY + paddleHeight)) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        speedY -= 1;
        // Max Speed
        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      // Reset Ball, add to Computer Score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleOffsetY + paddleHeight) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      // Reset Ball, add to Player Score
      ballReset();
      playerScore++;
    }
  }
}

// Computer Movement
function computerAI() {
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed;
    } else {
      paddleTopX -= computerSpeed;
    }
  }
}

function showGameOverEl(winner) {
  // Hide Canvas
  //canvas.hidden = true;

  // Container
  gameOverEl.textContent = '';
  gameOverEl.classList.add('game-over-container');

  // Box
  const boxEl = document.createElement('div');
  boxEl.classList.add('game-over-box');

  // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} Wins!`;

  // Button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'startGame()');
  playAgainBtn.textContent = 'Play Again';

  // Append
  boxEl.append(title, playAgainBtn);
  gameOverEl.append(boxEl);
  body.appendChild(gameOverEl);
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set Winner
    const winner = playerScore === winningScore ? `${namePlayer}` : `${nameComputer}`;
    showGameOverEl(winner);
  }
}

// Called Every Frame
function animate() {
  renderCanvas();
  ballMove();
  ballBoundaries();
  computerAI();
  
  if (!isGameOver) {
    window.requestAnimationFrame(animate);
  }
  gameOver();
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;
  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    // Compensate for canvas being centered
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}

// On Load
startGame();
