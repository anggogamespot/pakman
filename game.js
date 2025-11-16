// Mengambil elemen canvas dan konteks 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

// --- Variabel Konfigurasi ---
const TILE_SIZE = 20; // Ukuran setiap kotak (tile) dalam piksel
const MAP_SIZE = canvas.width / TILE_SIZE; // 400 / 20 = 20x20

let score = 0;
let pacman = { x: 1, y: 1, direction: 'right', nextDirection: 'right', size: TILE_SIZE / 2 };

// Peta: 0 = Kosong (ruang), 1 = Dinding, 2 = Pellet (makanan)
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1],
    [1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1],
    [1, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1],
    [1, 2, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    // ... Tambahkan baris lain hingga 20x20 untuk peta penuh
    // Saya hanya menyertakan bagian kecil untuk contoh
].map(row => [...row, ...row].slice(0, MAP_SIZE)).slice(0, MAP_SIZE); // Membuat peta 20x20 sederhana

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
    // Menggambar Pac-Man sebagai lingkaran
    // Anda bisa menambahkan logika 'mulut terbuka' di sini untuk lebih realistis
    ctx.arc(
        pacman.x * TILE_SIZE + TILE_SIZE / 2,
        pacman.y * TILE_SIZE + TILE_SIZE / 2,
        pacman.size,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// --- Fungsi Logika Game ---

function isWall(x, y) {
    // Memastikan koordinat berada dalam batas
    if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) {
        return true;
    }
    return map[y][x] === 1;
}

function updatePacman() {
    let nextX = pacman.x;
    let nextY = pacman.y;

    // Coba bergerak ke arah yang diinginkan (nextDirection)
    let newDirection = pacman.nextDirection;

    if (newDirection === 'up') nextY -= 1;
    else if (newDirection === 'down') nextY += 1;
    else if (newDirection === 'left') nextX -= 1;
    else if (newDirection === 'right') nextX += 1;

    // Jika arah yang diinginkan tidak menabrak dinding, ganti arah Pac-Man
    if (!isWall(nextX, nextY)) {
        pacman.direction = newDirection;
    } else {
        // Jika menabrak, coba lagi menggunakan arah saat ini
        nextX = pacman.x;
        nextY = pacman.y;

        if (pacman.direction === 'up') nextY -= 1;
        else if (pacman.direction === 'down') nextY += 1;
        else if (pacman.direction === 'left') nextX -= 1;
        else if (pacman.direction === 'right') nextX += 1;
    }

    // Jika pergerakan berhasil (tidak menabrak dinding), perbarui posisi
    if (!isWall(nextX, nextY)) {
        pacman.x = nextX;
        pacman.y = nextY;
    }

    // Cek Pellet
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
            pacman.nextDirection = 'up';
            break;
        case 'ArrowDown':
            pacman.nextDirection = 'down';
            break;
        case 'ArrowLeft':
            pacman.nextDirection = 'left';
            break;
        case 'ArrowRight':
            pacman.nextDirection = 'right';
            break;
    }
});

// --- Loop Game Utama ---

function gameLoop() {
    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Perbarui Logika (misalnya, pergerakan)
    updatePacman();

    // 3. Gambar Ulang
    drawMap();
    drawPacman();

    // Loop berulang
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 100); // Kontrol kecepatan game (100ms per "tick")
}

// Mulai game saat halaman dimuat
gameLoop();
