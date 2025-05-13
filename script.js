const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let apple;
let dx;
let dy;
let score;
let gameInterval;
let gameStarted = false;
let gameTime;
let startTime;

// Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyC58EgXUd82-r_x6NO_mt6oMl8hDFi5q0Q",
    authDomain: "game-bc199.firebaseapp.com",
    databaseURL: "https://game-bc199-default-rtdb.firebaseio.com",
    projectId: "game-bc199",
    storageBucket: "game-bc199.firebasestorage.app",
    messagingSenderId: "319830123252",
    appId: "1:319830123252:web:e1e497590dabef4e9ef4a1"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function initGame() {
    snake = [{ x: 10, y: 10 }];
    apple = { x: 5, y: 5 };
    dx = 1;
    dy = 0;
    score = 0;
    gameTime = 0;
    startTime = Date.now();
}

function gameLoop() {
    if (!gameStarted) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (
        head.x < 0 || head.y < 0 ||
        head.x >= tileCount || head.y >= tileCount ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
        score++;
        apple = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } else {
        snake.pop();
    }

    draw();
    gameTime = Math.floor((Date.now() - startTime) / 1000); // 計算遊玩秒數
}

function draw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "lime";
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2);
}

document.addEventListener("keydown", e => {
    if (!gameStarted) return;
    switch (e.key) {
        case "ArrowUp": if (dy === 0) { dx = 0; dy = -1; } break;
        case "ArrowDown": if (dy === 0) { dx = 0; dy = 1; } break;
        case "ArrowLeft": if (dx === 0) { dx = -1; dy = 0; } break;
        case "ArrowRight": if (dx === 0) { dx = 1; dy = 0; } break;
    }
});

function startGame() {
    initGame();
    document.getElementById("startScreen").style.display = "none";
    gameStarted = true;
    gameInterval = setInterval(gameLoop, 100);
}

function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;
    document.getElementById("finalScore").textContent = score;
    document.getElementById("gameOverScreen").style.display = "flex";
}

function saveScore() {
    const playerName = document.getElementById("playerName").value || "匿名玩家";
    const now = new Date().toISOString();

    const scoreData = {
        name: playerName,
        score: score,
        time: gameTime,
        savedAt: now
    };

    // 將分數儲存到 Firebase
    database.ref("scores").push(scoreData)
        .then(() => {
            alert("分數已儲存！");
            document.getElementById("gameOverScreen").style.display = "none";
            showLeaderboard(); // 儲存後顯示排行榜
        })
        .catch(error => {
            console.error("儲存分數失敗:", error);
            alert("儲存分數失敗，請稍後再試。");
        });
}

function showLeaderboard() {
    const scoreList = document.getElementById("scoreList");
    scoreList.innerHTML = ""; // 清空排行榜

    // 從 Firebase 讀取分數並顯示
    database.ref("scores").orderByChild("score").limitToLast(10).once("value", snapshot => {
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            const li = document.createElement("li");
            li.textContent = `${data.name} - 分數: ${data.score}, 時間: ${data.time} 秒`;
            scoreList.appendChild(li);
        });
        document.getElementById("leaderboard").style.display = "block";
    });
}

function showStartScreen() {
    document.getElementById("leaderboard").style.display = "none";
    document.getElementById("startScreen").style.display = "flex";
}