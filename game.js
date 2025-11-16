// --- Inisialisasi dan Konfigurasi ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

const TILE_SIZE = 20; // Ukuran setiap kotak (tile) dalam piksel
const MAP_SIZE = canvas.width / TILE_SIZE; // 400 / 20 = 20x20

let score = 0;
let pacman = { x: 1, y: 1, direction: 'right', nextDirection: 'right', size: TILE_SIZE / 2 };

// Peta: 0 = Kosong (ruang), 1 = Dinding, 2 = Pellet (makanan)
// Peta 20x20 sederhana
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
                // Menggambar lingkaran kecil di tengah tile
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
    
    // Logika untuk membuat mulut terbuka (animasi dasar)
    let startAngle = 0.25 * Math.PI; // Sudut mulai 45 derajat
    let endAngle = 1.75 * Math.PI;  // Sudut akhir 315 derajat

    // Sesuaikan sudut berdasarkan arah Pac-Man untuk efek visual yang lebih baik
    if (pacman.direction === 'right') {
        startAngle = 0.25 * Math.PI; 
        endAngle = 1.75 * Math.PI;
    } else if (pacman.direction === 'down') {
        startAngle = 0.75 * Math.PI; 
        endAngle = 0.25 * Math.PI;
    } else if (pacman.direction === 'left') {
        startAngle = 1.25 * Math.PI; 
        endAngle = 0.75 * Math.PI;
    } else if (pacman.direction === 'up') {
        startAngle = 1.75 * Math.PI; 
        endAngle = 1.25 * Math.PI;
    }

    ctx.arc(
        pacman.x * TILE_SIZE + TILE_SIZE / 2,
        pacman.y * TILE_SIZE + TILE_SIZE / 2,
        pacman.size,
        startAngle,
        endAngle
    );
    ctx.lineTo(pacman.x * TILE_SIZE + TILE_SIZE / 2, pacman.y * TILE_SIZE + TILE_SIZE / 2); // Garis ke tengah untuk efek mulut
    ctx.fill();
}

// --- Fungsi Logika Game ---

function isWall(x, y) {
    // Memastikan koordinat berada dalam batas
    if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) {
        return true;
    }
    // Mengembalikan true jika tile adalah Dinding (kode 1)
    return map[y][x] === 1; 
}

function updatePacman() {
    let targetX = pacman.x;
    let targetY = pacman.y;
    let successfulMove = false;
    let finalDirection = pacman.direction;

    // 1. Coba bergerak menggunakan arah yang di-input pengguna (nextDirection)
    let tempX_next = pacman.x;
    let tempY_next = pacman.y;

    if (pacman.nextDirection === 'up') tempY_next -= 1;
    else if (pacman.nextDirection === 'down') tempY_next += 1;
    else if (pacman.nextDirection === 'left') tempX_next -= 1;
    else if (pacman.nextDirection === 'right') tempX_next += 1;

    // Jika arah nextDirection valid (bukan dinding), gunakan arah itu
    if (!isWall(tempX_next, tempY_next)) {
        targetX = tempX_next;
        targetY = tempY_next;
        finalDirection = pacman.nextDirection;
        successfulMove = true;
    } 
    
    // 2. Jika nextDirection menabrak dinding, coba arah saat ini (direction)
    else {
        let tempX_current = pacman.x;
        let tempY_current = pacman.y;

        if (pacman.direction === 'up') tempY_current -= 1;
        else if (pacman.direction === 'down') tempY_current += 1;
        else if (pacman.direction === 'left') tempX_current -= 1;
        else if (pacman.direction === 'right') tempX_current += 1;

        // Jika arah saat ini valid, gunakan arah itu
        if (!isWall(tempX_current, tempY_current)) {
            targetX = tempX_current;
            targetY = tempY_current;
            successfulMove = true;
        }
    }

    // 3. Perbarui posisi dan arah Pac-Man jika pergerakan berhasil
    if (successfulMove) {
        pacman.x = targetX;
        pacman.y = targetY;
        pacman.direction = finalDirection; 
    }

    // 4. Cek Pellet (Makan)
    if (map[pacman.y][pacman.x] === 2) {
        map[pacman.y][pacman.x] = 0; // Hapus pellet
        score += 10;
        scoreDisplay.textContent = score;
    }
}

// --- Input Pengguna ---

document.addEventListener('keydown', (e) => {
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
    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Perbarui Logika (pergerakan dan tabrakan)
    updatePacman();

    // 3. Gambar Ulang
    drawMap();
    drawPacman();

    // Loop berulang
    // Menggunakan timeout 100ms untuk kontrol pergerakan berbasis tile
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 100); 
}

// Mulai game saat halaman dimuat
gameLoop();
