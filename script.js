const canvas = document.getElementById('pacman-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

// --- KONFIGURASI GAME ---
const TILE_SIZE = 30; // Ukuran satu ubin (tile) dalam piksel
const GAME_FPS = 10; // Frame per second, kontrol kecepatan game
const GHOST_SPEED_FACTOR = 0.8; // Kecepatan hantu relatif terhadap Pac-Man

// 0: Jalan Kosong, 1: Tembok, 2: Titik Makanan, 3: Pintu Keluar
let maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1], // 0 di tengah adalah area awal hantu
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1], // 3 adalah pintu keluar
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Salinan maze awal untuk reset
const initialMaze = JSON.parse(JSON.stringify(maze));

// --- PAC-MAN & GAME STATE ---
let pacman = {
    x: 1, // kolom
    y: 1, // baris
    radius: TILE_SIZE / 2 - 2,
    direction: 'right', // Arah saat ini
    desiredDirection: 'right' // Arah yang diinginkan (untuk "cornering")
};
let score = 0;
let totalFood = 0; // Untuk menghitung berapa banyak makanan yang ada

// Hitung total makanan di awal
for(let r=0; r < maze.length; r++) {
    for(let c=0; c < maze[r].length; c++) {
        if(maze[r][c] === 2) totalFood++;
    }
}

// --- HANTU MERAH (MUSUH) ---
let ghost = {
    x: 7, // kolom
    y: 4, // baris
    color: 'red',
    direction: 'left', // Arah awal hantu
    targetX: pacman.x,
    targetY: pacman.y
};

let gameInterval; // Untuk menyimpan ID interval game loop

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
            } else if (tile === 2) { // Titik Makanan
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 3) { // Pintu Keluar
                ctx.fillStyle = 'green';
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
    // Gambar Pac-Man sebagai lingkaran penuh untuk kesederhanaan
    ctx.arc(center_x, center_y, pacman.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawGhost() {
    const center_x = ghost.x * TILE_SIZE + TILE_SIZE / 2;
    const center_y = ghost.y * TILE_SIZE + TILE_SIZE / 2;
    const size = TILE_SIZE * 0.9;
    
    ctx.fillStyle = ghost.color;
    
    // Tubuh hantu
    ctx.beginPath();
    ctx.arc(center_x, center_y, size / 2, Math.PI, 0, false); // Bagian atas bulat
    ctx.rect(center_x - size / 2, center_y, size, size * 0.4); // Bagian bawah persegi
    ctx.fill();
}

// --- LOGIKA KONTROL MOBILE ---

function handleDirectionChange(newDirection) {
    // Periksa apakah arah yang diinginkan valid (tidak langsung menabrak tembok)
    let nextX = pacman.x;
    let nextY = pacman.y;

    if (newDirection === 'up') nextY--;
    else if (newDirection === 'down') nextY++;
    else if (newDirection === 'left') nextX--;
    else if (newDirection === 'right') nextX++;

    // Jika arah baru tidak menabrak tembok, baru ubah desiredDirection
    if (maze[nextY] && maze[nextY][nextX] !== 1) {
        pacman.desiredDirection = newDirection;
    }
}

// Event listener untuk tombol kontrol
const controlBtns = document.querySelectorAll('.mobile-controls .control-btn');
controlBtns.forEach(btn => {
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
    // Juga tambahkan mousedown untuk pengujian di desktop
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


// --- LOGIKA GAME ---

function movePacman() {
    let nextX = pacman.x;
    let nextY = pacman.y;

    // Coba bergerak sesuai desiredDirection terlebih dahulu
    if (pacman.desiredDirection === 'up') nextY--;
    else if (pacman.desiredDirection === 'down') nextY++;
    else if (pacman.desiredDirection === 'left') nextX--;
    else if (pacman.desiredDirection === 'right') nextX++;

    // Jika desiredDirection valid, gunakan itu
    if (maze[nextY] && maze[nextY][nextX] !== 1) {
        pacman.x = nextX;
        pacman.y = nextY;
        pacman.direction = pacman.desiredDirection; // Update arah aktual
    } else {
        // Jika desiredDirection tidak valid, coba lanjutkan dengan arah saat ini
        nextX = pacman.x;
        nextY = pacman.y;
        if (pacman.direction === 'up') nextY--;
        else if (pacman.direction === 'down') nextY++;
        else if (pacman.direction === 'left') nextX--;
        else if (pacman.direction === 'right') nextX++;

        if (maze[nextY] && maze[nextY][nextX] !== 1) {
            pacman.x = nextX;
            pacman.y = nextY;
        }
    }
}

function eatFood() {
    if (maze[pacman.y][pacman.x] === 2) {
        maze[pacman.y][pacman.x] = 0; // Hapus makanan
        score += 10;
        scoreDisplay.textContent = `SKOR: ${score}`;
        totalFood--; // Kurangi hitungan makanan
    }
}

function checkWinCondition() {
    if (maze[pacman.y][pacman.x] === 3) { // Pac-Man mencapai pintu keluar
        if (totalFood <= 0) { // Hanya bisa keluar jika semua makanan sudah dimakan
            clearInterval(gameInterval);
            setTimeout(() => {
                alert(`SELAMAT! Anda berhasil keluar dengan skor ${score}!`);
                resetGame();
            }, 100);
        } else {
            // Opsional: berikan pesan bahwa masih ada makanan
            // console.log("Anda harus makan semua makanan sebelum keluar!");
        }
    }
}


function moveGhost() {
    // AI sederhana: hantu mencoba bergerak menuju Pac-Man
    // Ini adalah implementasi AI yang sangat dasar.
    // Hantu akan langsung bergerak ke Pac-Man jika tidak ada tembok.
    
    // Tentukan arah yang lebih baik: horizontal atau vertikal?
    let possibleMoves = [];

    // Prioritaskan bergerak menuju Pac-Man
    if (ghost.x < pacman.x && maze[ghost.y][ghost.x + 1] !== 1) possibleMoves.push('right');
    if (ghost.x > pacman.x && maze[ghost.y][ghost.x - 1] !== 1) possibleMoves.push('left');
    if (ghost.y < pacman.y && maze[ghost.y + 1][ghost.x] !== 1) possibleMoves.push('down');
    if (ghost.y > pacman.y && maze[ghost.y - 1][ghost.x] !== 1) possibleMoves.push('up');

    // Jika ada gerakan yang menuntun ke Pac-Man, pilih secara acak dari itu
    if (possibleMoves.length > 0) {
        ghost.direction = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else {
        // Jika tidak ada jalur langsung ke Pac-Man, bergerak secara acak
        let validDirections = [];
        if (maze[ghost.y][ghost.x + 1] !== 1) validDirections.push('right');
        if (maze[ghost.y][ghost.x - 1] !== 1) validDirections.push('left');
        if (maze[ghost.y + 1] && maze[ghost.y + 1][ghost.x] !== 1) validDirections.push('down');
        if (maze[ghost.y - 1] && maze[ghost.y - 1][ghost.x] !== 1) validDirections.push('up');

        // Pastikan hantu tidak langsung berbalik arah
        validDirections = validDirections.filter(dir => {
            if (ghost.direction === 'up' && dir === 'down') return false;
            if (ghost.direction === 'down' && dir === 'up') return false;
            if (ghost.direction === 'left' && dir === 'right') return false;
            if (ghost.direction === 'right' && dir === 'left') return false;
            return true;
        });

        if (validDirections.length > 0) {
            ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
        }
    }

    // Lakukan pergerakan
    let nextX = ghost.x;
    let nextY = ghost.y;

    if (ghost.direction === 'up') nextY--;
    else if (ghost.direction === 'down') nextY++;
    else if (ghost.direction === 'left') nextX--;
    else if (ghost.direction === 'right') nextX++;

    if (maze[nextY] && maze[nextY][nextX] !== 1) {
        ghost.x = nextX;
        ghost.y = nextY;
    }
}


function checkCollision() {
    // Periksa tabrakan Pac-Man dengan Hantu
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
        gameOver();
    }
}

function gameOver() {
    clearInterval(gameInterval); // Hentikan game loop
    setTimeout(() => { // Tunda alert sedikit agar rendering selesai
        alert(`GAME OVER! Anda tersentuh hantu. Skor Anda: ${score}`);
        resetGame();
    }, 100);
}

function resetGame() {
    // Reset maze ke kondisi awal
    maze = JSON.parse(JSON.stringify(initialMaze));
    
    // Reset Pac-Man
    pacman.x = 1;
    pacman.y = 1;
    pacman.direction = 'right';
    pacman.desiredDirection = 'right';

    // Reset Hantu
    ghost.x = 7;
    ghost.y = 4;
    ghost.direction = 'left';

    // Reset Skor
    score = 0;
    scoreDisplay.textContent = `SKOR: ${score}`;

    // Hitung ulang total makanan
    totalFood = 0;
    for(let r=0; r < maze.length; r++) {
        for(let c=0; c < maze[r].length; c++) {
            if(initialMaze[r][c] === 2) totalFood++;
        }
    }

    // Mulai ulang game loop
    startGameLoop();
}


function updateGameLogic() {
    movePacman();
    eatFood();
    moveGhost(); // Hantu bergerak setiap frame
    checkCollision();
    checkWinCondition();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan layar
    drawMaze();
    drawPacman();
    drawGhost();
}

function startGameLoop() {
    // Menggunakan setInterval untuk game loop dengan FPS yang terkontrol
    clearInterval(gameInterval); // Pastikan tidak ada interval lama yang berjalan
    gameInterval = setInterval(() => {
        updateGameLogic();
        drawGame();
    }, 1000 / GAME_FPS); // Waktu dalam milidetik per frame
}

// --- MULAI PERMAINAN PERTAMA KALI ---
startGameLoop();
