const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let box;
let gridWidth = 40;
let gridHeight = 30;

let snake = [{ x: 9 * box, y: 10 * box }];
let direction = "";
let foods = [];
let speed = 150;
let interval;
let playerName = "";
let paused = false;
let computerSnakes = [];
const computerCount = 5; // 增加電腦蛇數量！

document.getElementById("start-btn").onclick = startGame;
document.getElementById("pause-btn").onclick = togglePause;
document.getElementById("restart-btn").onclick = restartGame;
document.addEventListener("keydown", move);

function startGame() {
  playerName = document.getElementById("player-name").value || "玩家";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  resizeCanvas();
  reset();
  spawnFood();
  spawnComputerSnakes();
  interval = setInterval(update, speed);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  box = Math.min(
    Math.floor(canvas.width / gridWidth),
    Math.floor(canvas.height / gridHeight)
  );
}

window.addEventListener("resize", resizeCanvas);

function reset() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "";
  foods = [];
  computerSnakes = [];
  paused = false;
}

function spawnFood() {
  foods = [];
  for (let i = 0; i < 10; i++) {
    foods.push({
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box
    });
  }
}

function spawnComputerSnakes() {
  for (let i = 0; i < computerCount; i++) {
    computerSnakes.push({
      body: [{
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
      }],
      direction: ["LEFT", "RIGHT", "UP", "DOWN"][Math.floor(Math.random() * 4)],
      lastMoveTime: Date.now()
    });
  }
}

function move(event) {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

function togglePause() {
  paused = !paused;
}

function restartGame() {
  clearInterval(interval);
  startGame();
}

function drawSnake(snakeBody, color) {
  ctx.fillStyle = color;
  for (let part of snakeBody) {
    ctx.fillRect(part.x, part.y, box, box);
  }
}

function drawFood() {
  for (let f of foods) {
    ctx.fillStyle = "#ff0";
    ctx.fillRect(f.x, f.y, box, box);
  }
}

function update() {
  if (paused) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  moveSnake();
  moveComputerSnakes();

  drawFood();
  drawSnake(snake, "#0f0");

  for (let cSnake of computerSnakes) {
    drawSnake(cSnake.body, "#f0f");
  }
}

function moveSnake() {
  if (!direction) return;

  let head = { x: snake[0].x, y: snake[0].y };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    gameOver();
    return;
  }

  for (let part of snake) {
    if (head.x === part.x && head.y === part.y) {
      gameOver();
      return;
    }
  }

  let ateFood = false;
  for (let i = 0; i < foods.length; i++) {
    if (head.x === foods[i].x && head.y === foods[i].y) {
      foods.splice(i, 1);
      ateFood = true;
      speedUp();
      break;
    }
  }
  if (!ateFood) {
    snake.pop();
  }

  if (foods.length === 0) {
    spawnFood();
  }

  snake.unshift(head);
}

function moveComputerSnakes() {
  for (let cSnake of computerSnakes) {
    let head = { x: cSnake.body[0].x, y: cSnake.body[0].y };

    if (Date.now() - cSnake.lastMoveTime > 300) {
      cSnake.direction = ["LEFT", "RIGHT", "UP", "DOWN"][Math.floor(Math.random() * 4)];
      cSnake.lastMoveTime = Date.now();
    }

    if (cSnake.direction === "LEFT") head.x -= box;
    if (cSnake.direction === "UP") head.y -= box;
    if (cSnake.direction === "RIGHT") head.x += box;
    if (cSnake.direction === "DOWN") head.y += box;

    if (head.x < 0) head.x = canvas.width - box;
    if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = canvas.height - box;
    if (head.y >= canvas.height) head.y = 0;

    cSnake.body.unshift(head);
    cSnake.body.pop();
  }
}

function speedUp() {
  if (speed > 50) {
    speed -= 5;
    clearInterval(interval);
    interval = setInterval(update, speed);
  }
}

function gameOver() {
  clearInterval(interval);
  alert(playerName + "，你掛了！總長度：" + snake.length);
}
