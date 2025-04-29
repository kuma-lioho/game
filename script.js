const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let box = 20; // 初始設定一格20px
let gridWidth = 32; // 水平方向格子數
let gridHeight = 24; // 垂直方向格子數

let snake = [{ x: 9 * box, y: 10 * box }];
let direction = "";
let foods = [];
let speed = 200;
let interval;
let playerName = "";
let scores = [];
let paused = false;

// 多個電腦蛇
let computerSnakes = [];
let computerSpeed = 300;
const computerCount = 3; // 電腦蛇數量

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
  
  // 自動計算一格大小（依畫面大小算）
  box = Math.min(
    Math.floor(canvas.width / gridWidth),
    Math.floor(canvas.height / gridHeight)
  );
}

window.addEventListener("resize", () => {
  resizeCanvas();
});


function reset() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "";
  foods = [];
  computerSnakes = [];
  speed = 200;
  paused = false;
}

function spawnFood() {
  foods = [];
  for (let i = 0; i < 5; i++) {
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
  else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
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
    ctx.fillStyle = "#f00";
    ctx.fillRect(f.x, f.y, box, box);
  }
}

function update() {
  if (paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  moveSnake();
  moveComputerSnakes();

  drawFood();
  drawSnake(snake, "#000");

  for (let cSnake of computerSnakes) {
    drawSnake(cSnake.body, "#00f");
  }
}


function moveSnake() {
  if (!direction) return;

  let head = { x: snake[0].x, y: snake[0].y };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  // 撞牆死
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    gameOver();
    return;
  }

  // 撞到自己死
  for (let part of snake) {
    if (head.x === part.x && head.y === part.y) {
      gameOver();
      return;
    }
  }

  // 吃食物
  let ateFood = false;
  for (let i = 0; i < foods.length; i++) {
    if (head.x === foods[i].x && head.y === foods[i].y) {
      foods.splice(i, 1);
      ateFood = true;
      updateSpeed();
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

    if (Date.now() - cSnake.lastMoveTime > 500) {
      // 每 0.5 秒隨機換方向
      cSnake.direction = ["LEFT", "RIGHT", "UP", "DOWN"][Math.floor(Math.random() * 4)];
      cSnake.lastMoveTime = Date.now();
    }

    if (cSnake.direction === "LEFT") head.x -= box;
    if (cSnake.direction === "UP") head.y -= box;
    if (cSnake.direction === "RIGHT") head.x += box;
    if (cSnake.direction === "DOWN") head.y += box;

    // 電腦蛇穿牆
    if (head.x < 0) head.x = canvas.width - box;
    if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = canvas.height - box;
    if (head.y >= canvas.height) head.y = 0;

    cSnake.body.unshift(head);
    cSnake.body.pop();
  }
}

function updateSpeed() {
  if (speed > 50) {
    speed -= 10;
    clearInterval(interval);
    interval = setInterval(update, speed);
  }
}

function gameOver() {
  clearInterval(interval);
  alert(playerName + " 遊戲結束！分數：" + snake.length);
  scores.push({ name: playerName, score: snake.length });
  updateRanking();
}

function updateRanking() {
  const ranking = document.getElementById("ranking");
  ranking.innerHTML = "";
  scores.sort((a, b) => b.score - a.score);
  for (let player of scores) {
    const li = document.createElement("li");
    li.textContent = `${player.name}: ${player.score}`;
    ranking.appendChild(li);
  }
}
