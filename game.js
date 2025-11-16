// --- Inisialisasi dan Konfigurasi ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const statusDisplay = document.getElementById('status');

const TILE_SIZE = 20; 
const MAP_SIZE = canvas.width / TILE_SIZE; 
const GAME_SPEED = 150; // Kecepatan game dalam milidetik (pergerakan per tile)

let score = 0;
let gameOver = false;

let pacman = { x: 1, y: 1, direction: 'right', nextDirection: 'right', size: TILE_SIZE / 2 };
let ghost = { x: 18, y: 18, direction: 'left', size: TILE_SIZE / 2, color: 'red' };

// Peta: 0 = Kosong, 1 = Dinding, 2 = Pellet
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1],
    [1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1],
    [1, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1],
    [1, 2, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1],
    [1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1],
    [1, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1],
    [1, 2, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];


// --- Fungsi Pengecekan Dinding ---
function isWall(x, y) {
    if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) {
        return true;
    }
    return map[y][x] === 1; 
}


// --- Fungsi Menggambar ---

function drawMap() {
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const tile = map[y][x];

            if (tile === 1) { // Dinding
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (tile === 2) { // Pellet
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPacman() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    
    // Logika mulut terbuka (untuk memberikan kesan bergerak)
    let startAngle = 0.25 * Math.PI; 
    let endAngle = 1.75 * Math.PI;  

    if (pacman.direction === 'right') { startAngle = 0.25 * Math.PI; endAngle = 1.75 * Math.PI; }
    else if (pacman.direction === 'down') { startAngle = 0.75 * Math.PI; endAngle = 0.25 * Math.PI; }
    else if (pacman.direction === 'left') { startAngle = 1.25 * Math.PI; endAngle = 0.75 * Math.PI; }
    else if (pacman.direction === 'up') { startAngle = 1.75 * Math.PI; endAngle = 1.25 * Math.PI; }

    ctx.arc(
        pacman.x * TILE_SIZE + TILE_SIZE / 2,
        pacman.y * TILE_SIZE + TILE_SIZE / 2,
        pacman.size,
        startAngle,
        endAngle
    );
    ctx.lineTo(pacman.x * TILE_SIZE + TILE_SIZE / 2, pacman.y * TILE_SIZE + TILE_SIZE / 2);
    ctx.fill();
}

function drawGhost() {
    // Menggambar hantu sederhana
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    // Tubuh hantu (bentuk kurva/setengah lingkaran di atas)
    ctx.arc(ghost.x * TILE_SIZE + TILE_SIZE / 2, ghost.y * TILE_SIZE + TILE_SIZE / 2, ghost.size, Math.PI, 0, false);
    ctx.lineTo(ghost.x * TILE_SIZE + TILE_SIZE + 1, ghost.y * TILE_SIZE + TILE_SIZE);
    ctx.lineTo(ghost.x * TILE_SIZE - 1, ghost.y * TILE_SIZE + TILE_SIZE);
    ctx.closePath();
    ctx.fill();
}

// --- Logika Pergerakan & Tabrakan ---

function getNextPosition(entity, dir) {
    let nextX = entity.x;
    let nextY = entity.y;
    
    if (dir === 'up') nextY -= 1;
    else if (dir === 'down') nextY += 1;
    else if (dir === 'left') nextX -= 1;
    else if (dir === 'right') nextX += 1;

    return { x: nextX, y: nextY };
}

function updatePacman() {
    let successfulMove = false;
    let target = pacman;

    // 1. Coba arah berikutnya yang di-input pengguna
    let posNext = getNextPosition(target, target.nextDirection);
    
    if (!isWall(posNext.x, posNext.y)) {
        target.x = posNext.x;
        target.y = posNext.y;
        target.direction = target.nextDirection;
        successfulMove = true;
    } 
    
    // 2. Jika menabrak, coba arah saat ini
    else {
        let posCurrent = getNextPosition(target, target.direction);
        if (!isWall(posCurrent.x, posCurrent.y)) {
            target.x = posCurrent.x;
            target.y = posCurrent.y;
            successfulMove = true;
        }
    }

    // Cek Pellet
    if (map[target.y][target.x] === 2) {
        map[target.y][target.x] = 0; 
        score += 10;
        scoreDisplay.textContent = score;
    }
}

function updateGhost() {
    // 1. Tentukan arah terbaik (AI dasar: mengejar Pac-Man)
    const possibleMoves = ['up', 'down', 'left', 'right'];
    let bestMove = ghost.direction;
    let minDistance = Infinity;
    
    for (const move of possibleMoves) {
        const { x: nextX, y: nextY } = getNextPosition(ghost, move);
        
        if (!isWall(nextX, nextY)) {
            // Hitung jarak Manhattan ke Pac-Man
            const distance = Math.abs(nextX - pacman.x) + Math.abs(nextY - pacman.y);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMove = move;
            }
        }
    }

    // 2. Gerakkan hantu ke arah terbaik (atau tetap di tempat jika tidak ada jalan)
    const { x: finalX, y: finalY } = getNextPosition(ghost, bestMove);
    
    if (!isWall(finalX, finalY)) {
        ghost.x = finalX;
        ghost.y = finalY;
        ghost.direction = bestMove;
    }
}

function checkCollision() {
    // Cek apakah Pac-Man dan Hantu berada di tile yang sama
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
        gameOver = true;
        statusDisplay.textContent = "GAME OVER! Tertangkap!";
        statusDisplay.style.color = 'red';
    }
}

// --- Input Pengguna ---

document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            pacman.nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
            pacman.nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
            pacman.nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
            pacman.nextDirection = 'right';
            break;
    }
});

// --- Loop Game Utama ---

function gameLoop() {
    if (gameOver) return;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Perbarui Logika 
    updatePacman();
    updateGhost();
    checkCollision();

    // 3. Gambar Ulang
    drawMap();
    drawPacman();
    drawGhost(); // Gambar hantu

    // Loop berulang
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, GAME_SPEED); 
}

// Mulai game saat halaman dimuat
gameLoop();
