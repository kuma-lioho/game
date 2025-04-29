let canvas, ctx;
let box = 20;
let snake = [];
let computerSnake = [];
let direction = "RIGHT";
let computerDirection = "LEFT";
let food = {};
let score = 0;
let computerScore = 0;
let gameInterval;
let isPaused = false;

let speed = 200;
const minSpeed = 60;
const speedStep = 10;

let playerName = "";
let leaderboard = [];

window.onload = function() {
  document.getElementById("startBtn").addEventListener("click", startGame);
  const storedLeaderboard = localStorage.getItem("leaderboard");
  if (storedLeaderboard) leaderboard = JSON.parse(storedLeaderboard);
};

function startGame() {
  playerName = document.getElementById("playerName").value;
  if (!playerName) {
    alert("請輸入玩家名稱！");
    return;
  }

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.getElementById("restartBtn").style.display = "none";
  document.getElementById("pauseBtn").style.display = "inline-block";
  document.getElementById("pauseBtn").innerText = "暫停";
  isPaused = false;

  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  snake = [{ x: 8 * box, y: 10 * box }];
  computerSnake = [{ x: 12 * box, y: 10 * box }];
  direction = "RIGHT";
  computerDirection = "LEFT";
  score = 0;
  computerScore = 0;
  speed = 200;
  document.getElementById("score").innerText = "分數：" + score;

  placeFood();

  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
  document.removeEventListener("keydown", changeDirection);
  document.addEventListener("keydown", changeDirection);
}

function placeFood() {
  const maxCols = canvas.width / box;
  const maxRows = canvas.height / box;

  let newFood;
  let overlapping;
  do {
    overlapping = false;
    newFood = {
      x: Math.floor(Math.random() * maxCols) * box,
      y: Math.floor(Math.random() * maxRows) * box
    };
    for (let s of snake.concat(computerSnake)) {
      if (s.x === newFood.x && s.y === newFood.y) {
        overlapping = true;
        break;
      }
    }
  } while (overlapping);

  food = newFood;
}

function changeDirection(event) {
  const key = event.keyCode;
  if (key === 37 && direction !== "RIGHT") direction = "LEFT";
  else if (key === 38 && direction !== "DOWN") direction = "UP";
  else if (key === 39 && direction !== "LEFT") direction = "RIGHT";
  else if (key === 40 && direction !== "UP") direction = "DOWN";
}

function togglePause() {
  if (isPaused) {
    gameInterval = setInterval(draw, speed);
    document.getElementById("pauseBtn").innerText = "暫停";
  } else {
    clearInterval(gameInterval);
    document.getElementById("pauseBtn").innerText = "繼續";
  }
  isPaused = !isPaused;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#0f0" : "#fff";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  for (let i = 0; i < computerSnake.length; i++) {
    ctx.fillStyle = i === 0 ? "#f00" : "#fff";
    ctx.fillRect(computerSnake[i].x, computerSnake[i].y, box, box);
  }

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;

  if (headX === food.x && headY === food.y) {
    score++;
    document.getElementById("score").innerText = "分數：" + score;
    placeFood();
    if (speed > minSpeed) {
      speed -= speedStep;
      clearInterval(gameInterval);
      gameInterval = setInterval(draw, speed);
    }
  } else {
    snake.pop();
  }

  let newHead = { x: headX, y: headY };
  snake.unshift(newHead);

  let computerHeadX = computerSnake[0].x;
  let computerHeadY = computerSnake[0].y;

  if (computerDirection === "LEFT") computerHeadX -= box;
  if (computerDirection === "RIGHT") computerHeadX += box;
  if (computerDirection === "UP") computerHeadY -= box;
  if (computerDirection === "DOWN") computerHeadY += box;

  if (computerHeadX === food.x && computerHeadY === food.y) {
    computerScore++;
    placeFood();
  } else {
    computerSnake.pop();
  }

  let computerNewHead = { x: computerHeadX, y: computerHeadY };
  computerSnake.unshift(computerNewHead);

  if (
    collision(headX, headY, snake) ||
    headX < 0 || headX >= canvas.width ||
    headY < 0 || headY >= canvas.height
  ) {
    clearInterval(gameInterval);
    alert("遊戲結束！你的分數是：" + score);
    saveScore();
    return;
  }

  if (collision(headX, headY, computerSnake)) {
    clearInterval(gameInterval);
    alert("你被電腦撞到了！你的分數是：" + score);
    saveScore();
    return;
  }

  const directions = ["LEFT", "RIGHT", "UP", "DOWN"];
  computerDirection = directions[Math.floor(Math.random() * directions.length)];
}

function collision(x, y, snakeArray) {
  for (let i = 1; i < snakeArray.length; i++) {
    if (x === snakeArray[i].x && y === snakeArray[i].y) return true;
  }
  return false;
}

function saveScore() {
  leaderboard.push({ name: playerName, score: score });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  displayLeaderboard();
}

function displayLeaderboard() {
  const leaderboardList = document.getElementById("leaderboard-list");
  leaderboardList.innerHTML = "";
  leaderboard.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    leaderboardList.appendChild(li);
  });
  document.getElementById("leaderboard").style.display = "block";
  document.getElementById("game-container").style.display = "none";
}

function backToStart() {
  document.getElementById("leaderboard").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
}
