const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const floorHeight = 50;
const playerImage = new Image();
playerImage.src = 'circle.png';
const obstacleImage = new Image();
obstacleImage.src = 'obstacle1.png';

const player = {
    x: 50,
    y: canvas.height - 150,
    width: 50,
    height: 50,
    velocity: 0,
    gravity: 0.8,
    jumpPower: -15,
    isJumping: false,
    grounded: true,
    rotation: 0
};

const obstacles = [];
let score = 0;
let gameOver = false;
let obstacleSpeed = 6;
const collisionBuffer = 10;
const gameOverScreen = document.querySelector('.gameOverScreen');
const finalScore = document.getElementById('finalScore');
const scoreDisplay = document.getElementById('scoreDisplay');

let lastObstacleSpawnTime = 0;
let spawnInterval = 2000;

const selectedDifficulty = localStorage.getItem('difficulty') || 'easy';

if (selectedDifficulty === 'easy') {
    obstacleSpeed = 4;
    spawnInterval = 2500;
} else if (selectedDifficulty === 'medium') {
    obstacleSpeed = 6;
    spawnInterval = 2000;
} else if (selectedDifficulty === 'hard') {
    obstacleSpeed = 8;
    spawnInterval = 1500;
}

function createObstacle() {
    const maxObstacleHeight = 120;
    const minObstacleHeight = 60;
    const obstacleHeight = Math.random() * (maxObstacleHeight - minObstacleHeight) + minObstacleHeight;

    const obstacle = {
        x: canvas.width,
        y: canvas.height - floorHeight - obstacleHeight,
        width: 50,
        height: obstacleHeight,
        speed: obstacleSpeed
    };
    obstacles.push(obstacle);
}

function drawObstacles() {
    obstacles.forEach((obstacle, index) => {
        ctx.save();
        ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
        ctx.scale(1, -1);
        ctx.drawImage(obstacleImage, -obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
        ctx.restore();

        obstacle.x -= obstacle.speed;

        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }

        if (
            player.x + player.width - collisionBuffer > obstacle.x &&
            player.x + collisionBuffer < obstacle.x + obstacle.width &&
            player.y + player.height - collisionBuffer > obstacle.y &&
            player.y + collisionBuffer < obstacle.y + obstacle.height
        ) {
            gameOver = true;
            finalScore.textContent = score;
            gameOverScreen.style.display = 'block';
        }
    });
}

function movePlayer() {
    if (player.isJumping && player.grounded) {
        player.velocity = player.jumpPower;
        player.isJumping = false;
        player.grounded = false;
    }

    player.y += player.velocity;
    player.velocity += player.gravity;

    if (player.y + player.height >= canvas.height - floorHeight) {
        player.y = canvas.height - floorHeight - player.height;
        player.velocity = 0;
        player.grounded = true;
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    player.rotation += 0.1;
    ctx.rotate(player.rotation);
    ctx.drawImage(playerImage, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
}

function drawFloor() {
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height - floorHeight, canvas.width, floorHeight);
}

let lastFrameTime = 0;
let isPaused = false;

function update(timestamp) {
    if (isPaused) return;

    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    score++;
    if (Date.now() - lastObstacleSpawnTime > spawnInterval) {
        createObstacle();
        lastObstacleSpawnTime = Date.now();
    }

    drawObstacles();
    movePlayer();
    drawPlayer();
    drawFloor();

    scoreDisplay.textContent = `Score: ${score}`;

    if (!gameOver) {
        requestAnimationFrame(update);
    }
}

const pauseButton = document.getElementById('pauseButton');
const pauseMenu = document.getElementById('pauseMenu');
const resumeButton = document.getElementById('resumeButton');
const homeButton = document.getElementById('homeButton');

pauseButton.addEventListener('click', () => {
    isPaused = true;
    pauseMenu.style.display = 'block';
    pauseButton.style.display = 'none';
});

resumeButton.addEventListener('click', () => {
    isPaused = false;
    pauseMenu.style.display = 'none';
    pauseButton.style.display = 'block';
    requestAnimationFrame(update);
});

homeButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (player.grounded) {
            player.isJumping = true;
        }
    }
});

window.addEventListener('touchstart', () => {
    if (player.grounded) {
        player.isJumping = true;
    }
});

gameOverScreen.addEventListener('click', () => {
    gameOver = false;
    score = 0;
    obstacles.length = 0;
    player.y = canvas.height - 150;
    gameOverScreen.style.display = 'none';
    requestAnimationFrame(update);
});

update(0);