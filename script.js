const canvas = document.getElementById('pacman-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const overlay = document.getElementById('game-overlay');
const finalScoreDisplay = document.getElementById('final-score');

// --- KONFIGURASI GAME ---
const TILE_SIZE = 30; // Ukuran satu ubin dalam piksel
const GAME_FPS = 10;
let gameInterval;
let foodEaten = 0;
let totalFood = 0;

// 0: Jalan Kosong, 1: Tembok, 2: Titik Makanan, 3: Pintu Keluar
// Catatan: Tata letak ini disederhanakan dari gambar asli (25x25)
let maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,1,1,1,0,0,0,1,1,1,2,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,0,1,1,1,1,1,0,1,2,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,2,2,0,1,1,1,1,1,0,2,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,1,1,1,2,1],
    [1,2,2,2,1,2,2,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,2,2,1],
    [1,1,1,2,1,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,1,2,1,1,1],
    [1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1,2,1],
    [1,2,1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1,2,1],
    [1,2,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,2,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1], // Pintu Keluar di bawah tengah
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
const initialMaze = JSON.parse(JSON.stringify(maze));

// Hitung total makanan
maze.forEach(row => row.forEach(tile => {
    if(tile === 2) totalFood++;
}));


// --- PAC-MAN & HANTU ---
// Posisi awal Pac-Man dan Hantu disesuaikan dengan labirin 25x25
let pacman = { x: 1, y: 1, radius: TILE_SIZE / 2 - 2, direction: 'right', desiredDirection: 'right', speed: 1 };
let ghost = { x: 12, y: 8, color: 'red', direction: 'left', speed: 1 }; // Di tengah area Hantu
let score = 0;


// --- GAME LOOP & LOGIKA ---

function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const tile = maze[y][x];
            const posX = x * TILE_SIZE;
            const posY = y * TILE_SIZE;

            if (tile === 1) { // Tembok
                ctx.fillStyle = 'blue';
                ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
            } else if (tile === 2) { // Titik Makanan
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 3) { // Pintu Keluar (Ubin Hijau)
                ctx.fillStyle = 'green';
                ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillStyle = 'black';
                ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

// (Fungsi drawPacman, drawGhost tetap sama)
function drawPacman() {
    const center_x = pacman.x * TILE_SIZE + TILE_SIZE / 2;
    const center_y = pacman.y * TILE_SIZE + TILE_SIZE / 2;
    
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(center_x, center_y, pacman.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawGhost() {
    const center_x = ghost.x * TILE_SIZE + TILE_SIZE / 2;
    const center_y = ghost.y * TILE_SIZE + TILE_SIZE / 2;
    const size = TILE_SIZE * 0.9;
    
    ctx.fillStyle = ghost.color;
    
    ctx.beginPath();
    ctx.arc(center_x, center_y, size / 2, Math.PI, 0, false); 
    ctx.rect(center_x - size / 2, center_y, size, size * 0.4); 
    ctx.fill();
}

// (Fungsi getNextPosition, canMove, handleDirectionChange, eatFood, checkWinCondition, checkCollision tetap sama)

function getNextPosition(obj, direction) {
    let nextX = obj.x;
    let nextY = obj.y;

    if (direction === 'up') nextY--;
    else if (direction === 'down') nextY++;
    else if (direction === 'left') nextX--;
    else if (direction === 'right') nextX++;

    return { nextX, nextY };
}

function canMove(x, y) {
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return false;
    return maze[y][x] !== 1;
}

function handleDirectionChange(newDirection) {
    pacman.desiredDirection = newDirection;
}

function eatFood() {
    if (maze[pacman.y][pacman.x] === 2) {
        maze[pacman.y][pacman.x] = 0; 
        score += 10;
        foodEaten++;
        scoreDisplay.textContent = `SKOR: ${score}`;
    }
}

function checkWinCondition() {
    if (maze[pacman.y][pacman.x] === 3) { 
        if (foodEaten === totalFood) { 
            clearInterval(gameInterval);
            finalScoreDisplay.textContent = `Skor Akhir: ${score}. SEMPURNA!`;
            overlay.style.display = 'flex';
        } 
    }
}

function checkCollision() {
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
        gameOver();
    }
}

function movePacman() {
    let { nextX, nextY } = getNextPosition(pacman, pacman.desiredDirection);

    // 1. Coba bergerak sesuai desiredDirection
    if (canMove(nextX, nextY)) {
        pacman.x = nextX;
        pacman.y = nextY;
        pacman.direction = pacman.desiredDirection;
        return;
    }

    // 2. Jika tidak bisa, coba lanjutkan dengan arah saat ini
    ({ nextX, nextY } = getNextPosition(pacman, pacman.direction));
    if (canMove(nextX, nextY)) {
        pacman.x = nextX;
        pacman.y = nextY;
    }
}

function moveGhost() {
    let validMoves = [];
    
    // Prioritas: Mengejar Pac-Man
    if (ghost.x < pacman.x && canMove(ghost.x + 1, ghost.y)) validMoves.push('right');
    if (ghost.x > pacman.x && canMove(ghost.x - 1, ghost.y)) validMoves.push('left');
    if (ghost.y < pacman.y && canMove(ghost.x, ghost.y + 1)) validMoves.push('down');
    if (ghost.y > pacman.y && canMove(ghost.x, ghost.y - 1)) validMoves.push('up');

    // Filter balik arah
    validMoves = validMoves.filter(dir => {
        if (ghost.direction === 'up' && dir === 'down') return false;
        if (ghost.direction === 'down' && dir === 'up') return false;
        if (ghost.direction === 'left' && dir === 'right') return false;
        if (ghost.direction === 'right' && dir === 'left') return false;
        return true;
    });

    let chosenDirection = ghost.direction;
    if (validMoves.length > 0) {
        chosenDirection = validMoves[Math.floor(Math.random() * validMoves.length)];
    } else {
        // Jika terpojok, pilih arah valid acak
        let allValid = [];
        if (canMove(ghost.x + 1, ghost.y)) allValid.push('right');
        if (canMove(ghost.x - 1, ghost.y)) allValid.push('left');
        if (canMove(ghost.x, ghost.y + 1)) allValid.push('down');
        if (canMove(ghost.x, ghost.y - 1)) allValid.push('up');
        
        if (allValid.length > 0) {
            chosenDirection = allValid[Math.floor(Math.random() * allValid.length)];
        }
    }

    let { nextX, nextY } = getNextPosition(ghost, chosenDirection);
    
    if (canMove(nextX, nextY)) {
        ghost.x = nextX;
        ghost.y = nextY;
        ghost.direction = chosenDirection;
    }
}


function gameOver() {
    clearInterval(gameInterval); 
    finalScoreDisplay.textContent = `Skor Akhir: ${score}`;
    overlay.style.display = 'flex'; 
}

window.resetGame = function() {
    overlay.style.display = 'none';

    // Reset Labirin, Karakter, dan Skor
    maze = JSON.parse(JSON.stringify(initialMaze));
    pacman = { x: 1, y: 1, radius: TILE_SIZE / 2 - 2, direction: 'right', desiredDirection: 'right', speed: 1 };
    ghost = { x: 12, y: 8, color: 'red', direction: 'left', speed: 1 }; 
    
    score = 0;
    foodEaten = 0;
    scoreDisplay.textContent = `SKOR: 0`;

    startGameLoop();
}

function updateGameLogic() {
    movePacman();
    eatFood();
    moveGhost(); 
    checkCollision();
    checkWinCondition();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    drawMaze();
    drawPacman();
    drawGhost();
}

function startGameLoop() {
    clearInterval(gameInterval); 
    gameInterval = setInterval(() => {
        updateGameLogic();
        drawGame();
    }, 1000 / GAME_FPS); 
}

// Event listener keyboard dan touch tetap ada di file ini.

// --- MULAI PERMAINAN ---
startGameLoop();
