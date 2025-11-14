// Mengambil Canvas dan konteks gambar 2D
const canvas = document.getElementById('pacman-canvas');
const ctx = canvas.getContext('2d');

// Definisikan ukuran blok/ubin (tile)
const TILE_SIZE = 30;

// Definisikan Labirin (menggunakan array 2D)
// Contoh sederhana: 0=Jalan, 1=Tembok, 2=Titik Makanan
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Posisi Pac-Man (dalam koordinat grid)
let pacman = {
    x: 1, // kolom
    y: 1, // baris
    direction: 'right'
};

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
                // Menggambar lingkaran kecil di tengah blok
                ctx.beginPath();
                ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPacman() {
    const center_x = pacman.x * TILE_SIZE + TILE_SIZE / 2;
    const center_y = pacman.y * TILE_SIZE + TILE_SIZE / 2;
    const radius = TILE_SIZE / 2 - 2;

    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    // Gambar Pac-Man sebagai busur (arc)
    ctx.arc(center_x, center_y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// *** Lanjut di sini untuk logika pergerakan, tabrakan, dan Game Loop ***
// Anda perlu menambahkan:
// 1. Event listener untuk tombol panah.
// 2. Fungsi untuk memindahkan Pac-Man (memperbarui pacman.x dan pacman.y).
// 3. Logika untuk mencegah melewati tembok (tile === 1).
// 4. Logika untuk "memakan" titik makanan (mengubah tile === 2 menjadi 0).
// 5. Game Loop dengan `requestAnimationFrame` untuk memperbarui tampilan.

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan layar
    drawMaze();
    drawPacman();
    // Tambahkan drawGhosts() di sini
    // Tambahkan updatePacmanPosition() di sini
    // Tambahkan checkCollisions() di sini

    requestAnimationFrame(gameLoop); // Ulangi loop
}

// Mulai permainan
gameLoop();
// --- BAGIAN BARU UNTUK KONTROL MOBILE ---

// Ambil semua tombol kontrol
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// Fungsi untuk memperbarui arah (sama seperti saat menggunakan tombol panah)
function handleDirectionChange(newDirection) {
    // Asumsi: Anda memiliki variabel global 'desiredDirection'
    // yang digunakan oleh Game Loop untuk memindahkan Pac-Man.
    // Jika Anda menggunakan logika langsung:
    pacman.direction = newDirection; 
    // Anda mungkin perlu memanggil fungsi update posisi atau game loop di sini
    // atau biarkan Game Loop yang menangani pergerakan berikutnya.
}

// Menambahkan Event Listener untuk setiap tombol
upBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Mencegah pergerakan layar
    handleDirectionChange('up');
});
upBtn.addEventListener('mousedown', () => {
    handleDirectionChange('up');
});

downBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleDirectionChange('down');
});
downBtn.addEventListener('mousedown', () => {
    handleDirectionChange('down');
});

leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleDirectionChange('left');
});
leftBtn.addEventListener('mousedown', () => {
    handleDirectionChange('left');
});

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleDirectionChange('right');
});
rightBtn.addEventListener('mousedown', () => {
    handleDirectionChange('right');
});

// Anda mungkin juga ingin mengganti event listener keyboard Anda 
// dengan fungsi `handleDirectionChange` yang sama.

// Contoh modifikasi di event listener keyboard (di script.js Anda):
/*
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            handleDirectionChange('up');
            break;
        case 'ArrowDown':
            handleDirectionChange('down');
            break;
        case 'ArrowLeft':
            handleDirectionChange('left');
            break;
        case 'ArrowRight':
            handleDirectionChange('right');
            break;
    }
});
*/
