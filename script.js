const canvas = document.getElementById('pacman-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const overlay = document.getElementById('game-overlay');
const finalScoreDisplay = document.getElementById('final-score');

// --- KONFIGURASI GAME ---
const TILE_SIZE = 30; 
const GAME_FPS = 10; 
let gameInterval; 
let totalFood = 0; 
let foodEaten = 0;

// 0: Jalan Kosong, 1: Tembok, 2: Titik Makanan, 3: Pintu Keluar
let maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1], // 0: Start Hantu
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1], // 3: Pintu Keluar
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
const initialMaze = JSON.parse(JSON.stringify(maze));

// Hitung total makanan di awal
initialMaze.forEach(row => row.forEach(tile => {
    if(tile === 2) totalFood++;
}));


// --- PAC-MAN & HANTU ---
let pacman = { x: 1, y: 1, radius: TILE_SIZE / 2 - 2, direction: 'right', desiredDirection: 'right', speed: 1 };
let ghost = { x: 7, y: 4, color: 'red', speed: 1 }; // Hantu Merah saja

let score = 0;

// --- FUNGSI MENGGAMBAR ---

function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const tile = maze[y][x];
            const posX = x * TILE_SIZE;
            const posY = y * TILE_SIZE;

            if (tile === 1) { // Tembok
                ctx.fillStyle = 'blue';
                ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
            } else if (tile === 2) { // Titik Makanan (Bola Putih)
                // Bola Putih diabaikan hantu, tetapi dimakan Pac-Man
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 3) { // Pintu Keluar
                ctx.fillStyle = 'green';
                ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
            } else {
                // Jalan kosong (0) harus digambar hitam
                ctx.fillStyle = 'black';
                ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

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
    
    // Menggambar hantu merah
    ctx.beginPath();
    ctx.arc(center_x, center_y, size / 2, Math.PI, 0, false); 
    ctx.rect(center_x - size / 2, center_y, size, size * 0.4); 
    ctx.fill();
}

// --- LOGIKA KONTROL MOBILE ---

function handleDirectionChange(newDirection) {
    // Memungkinkan Pac-Man untuk antri arah (desiredDirection)
    pacman.desiredDirection = newDirection;
}

// Event listener untuk tombol kontrol
const controlBtns = document.querySelectorAll('.mobile-controls .control-btn');
controlBtns.forEach(btn => {
    // Tambahkan touchstart untuk mobile
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        let direction = '';
        if (btn.id === 'up-btn') direction = 'up';
        else if (btn.id === 'down-btn') direction = 'down';
        else if (btn.id === 'left-btn') direction = 'left';
        else if (btn.id === 'right-btn') direction = 'right';
        if (direction) {
            handleDirectionChange(direction);
        }
    });
    // Tambahkan mousedown untuk desktop
    btn.addEventListener('mousedown', () => {
        let direction = '';
        if (btn.id === 'up-btn') direction = 'up';
        else if (btn.id === 'down-btn') direction = 'down';
        else if (btn.id === 'left-btn') direction = 'left';
        else if (btn.id === 'right-btn') direction = 'right';
        if (direction) {
            handleDirectionChange(direction);
        }
    });
});

// Event listener keyboard untuk desktop
document.addEventListener('keydown', (e) => {
    let direction = '';
    switch (e.key) {
        case 'ArrowUp':    direction = 'up'; break;
        case 'ArrowDown':  direction = 'down'; break;
        case 'ArrowLeft':  direction = 'left'; break;
        case 'ArrowRight': direction = 'right'; break;
    }
    if (direction) {
        handleDirectionChange(direction);
    }
});


// --- LOGIKA UTAMA GAME ---

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
    // Periksa batas dan tembok
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return false;
    return maze[y][x] !== 1;
}

function movePacman() {
    let { nextX, nextY } = getNextPosition(pacman, pacman.desiredDirection);

    // 1. Coba bergerak sesuai desiredDirection (memungkinkan belok di tikungan)
    if (canMove(nextX, nextY)) {
        pacman.x = nextX;
        pacman.y = nextY;
        pacman.direction = pacman.desiredDirection;
        return;
    }

    // 2. Jika tidak bisa, coba lanjutkan dengan arah saat ini (direction)
    ({ nextX, nextY } = getNextPosition(pacman, pacman.direction));
    if (canMove(nextX, nextY)) {
        pacman.x = nextX;
        pacman.y = nextY;
    }
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
    if (maze[pacman.y][pacman.x] === 3) { // Pac-Man mencapai Pintu Keluar
        if (foodEaten === totalFood) { 
            clearInterval(gameInterval);
            finalScoreDisplay.textContent = `Skor Akhir: ${score}. SEMPURNA!`;
            overlay.style.display = 'flex';
        } 
        // Jika makanan belum habis, Pac-Man hanya berdiri di pintu keluar
    }
}

function moveGhost() {
    // AI sederhana: Hantu (merah) selalu mencoba menuju Pac-Man
    let validMoves = [];
    
    // Prioritas 1: Bergerak menuju Pac-Man (vertikal/horizontal)
    if (ghost.x < pacman.x && canMove(ghost.x + 1, ghost.y)) validMoves.push('right');
    if (ghost.x > pacman.x && canMove(ghost.x - 1, ghost.y)) validMoves.push('left');
    if (ghost.y < pacman.y && canMove(ghost.x, ghost.y + 1)) validMoves.push('down');
    if (ghost.y > pacman.y && canMove(ghost.x, ghost.y - 1)) validMoves.push('up');

    // Filter agar hantu tidak langsung berbalik arah
    validMoves = validMoves.filter(dir => {
        if (ghost.direction === 'up' && dir === 'down') return false;
        if (ghost.direction === 'down' && dir === 'up') return false;
        if (ghost.direction === 'left' && dir === 'right') return false;
        if (ghost.direction === 'right' && dir === 'left') return false;
        return true;
    });

    let chosenDirection = ghost.direction;
    if (validMoves.length > 0) {
        // Jika ada jalur bagus, pilih secara acak dari yang terbaik (memberi sedikit randomness)
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
    // Catatan: Hantu mengabaikan Titik Makanan (bola putih) karena logika canMove hanya memeriksa Tembok (1)
}


function checkCollision() {
    // Tabrakan terjadi jika posisi Pac-Man dan Hantu sama
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
        gameOver();
    }
}

function gameOver() {
    clearInterval(gameInterval); 
    finalScoreDisplay.textContent = `Skor Akhir: ${score}`;
    overlay.style.display = 'flex'; // Tampilkan popup
}

window.resetGame = function() { // Dibuat global agar bisa dipanggil dari HTML
    // Sembunyikan popup
    overlay.style.display = 'none';

    // Reset maze, Pac-Man, Hantu, dan Skor
    maze = JSON.parse(JSON.stringify(initialMaze));
    pacman = { x: 1, y: 1, radius: TILE_SIZE / 2 - 2, direction: 'right', desiredDirection: 'right', speed: 1 };
    ghost = { x: 7, y: 4, color: 'red', direction: 'left', speed: 1 }; 
    
    score = 0;
    foodEaten = 0;
    scoreDisplay.textContent = `SKOR: 0`;

    // Mulai ulang game loop
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
    // Menggunakan setInterval untuk mengontrol kecepatan Pac-Man dan Hantu
    gameInterval = setInterval(() => {
        updateGameLogic();
        drawGame();
    }, 1000 / GAME_FPS); 
}

// Mulai Permainan
startGameLoop();
