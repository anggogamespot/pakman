const canvas = document.getElementById('pacman-canvas');
const ctx = canvas.getContext('2d');

// --- KONFIGURASI GAME ---
const TILE_SIZE = 30;
const MAP_WIDTH = canvas.width / TILE_SIZE;
const MAP_HEIGHT = canvas.height / TILE_SIZE;

// 0: Jalan Kosong, 1: Tembok, 2: Titik Makanan, 3: Titik Kekuatan (Power Pellet)
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 3, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1], // 0 di tengah adalah area hantu
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// --- PAC-MAN & GAME STATE ---
let pacman = {
    x: 1,
    y: 1,
    radius: TILE_SIZE / 2 - 2,
    direction: 'right', // Arah saat ini
    desiredDirection: 'right' // Arah yang diinginkan (untuk "cornering")
};
let score = 0;

// --- STRUKTUR MUSUH (HANTU) ---
// Hantu Pac-Man memiliki AI yang berbeda (Blinky, Pinky, Inky, Clyde)
class Ghost {
    constructor(x, y, color, targetLogic) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.direction = 'up';
        this.targetLogic = targetLogic; // Fungsi untuk menentukan target Pac-Man
    }

    draw() {
        // Logika menggambar hantu (lingkaran di atas, persegi di bawah)
        const center_x = this.x * TILE_SIZE + TILE_SIZE / 2;
        const center_y = this.y * TILE_SIZE + TILE_SIZE / 2;
        const size = TILE_SIZE * 0.9;
        
        ctx.fillStyle = this.color;
        
        // Tubuh
        ctx.beginPath();
        ctx.arc(center_x, center_y, size / 2, Math.PI, 0, false);
        ctx.rect(center_x - size / 2, center_y, size, size * 0.3);
        ctx.fill();
        
        // Mata (untuk referensi, perlu ditambahkan logika gambar mata)
        // 
    }

    // Fungsi AI utama: menghitung langkah terbaik berdasarkan target
    move() {
        // Implementasi logika AI di sini. 
        // Contoh: menggunakan algoritma A* atau BFS untuk menemukan jalur terpendek ke (targetX, targetY).
        // Blinky (merah) menargetkan posisi Pac-Man secara langsung.
        // Pinky (pink) menargetkan 4 ubin di depan Pac-Man.
        // ... dst.
    }
}

// Inisialisasi 4 Hantu (posisi di sekitar area tengah/0)
const ghosts = [
    new Ghost(7, 4, 'red', (p) => ({x: p.x, y: p.y})),        // Blinky (Pengejar)
    new Ghost(6, 4, 'pink', (p) => ({x: p.x + 4, y: p.y})),   // Pinky (Ambusher)
    new Ghost(8, 4, 'cyan', (p) => ({x: p.x, y: p.y})),       // Inky
    new Ghost(7, 5, 'orange', (p) => ({x: p.x, y: p.y}))      // Clyde
];

// --- LOGIKA KONTROL MOBILE (PENTING!) ---

function handleDirectionChange(newDirection) {
    pacman.desiredDirection = newDirection;
    // Logika yang lebih baik: coba langsung pindah ke arah yang diinginkan
    // jika tembok tidak menghalangi.
}

// Ambil semua tombol kontrol
const controlBtns = document.querySelectorAll('.mobile-controls .control-btn');

controlBtns.forEach(btn => {
    // Gunakan touchstart untuk respons sentuh yang cepat dan alami di Android
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Mencegah scrolling layar
        
        let direction = '';
        if (btn.id === 'up-btn') direction = 'up';
        else if (btn.id === 'down-btn') direction = 'down';
        else if (btn.id === 'left-btn') direction = 'left';
        else if (btn.id === 'right-btn') direction = 'right';
        
        if (direction) {
            handleDirectionChange(direction);
        }
    });

    // Tambahkan event mouseup/touchend untuk memastikan tidak ada input ganda, 
    // atau biarkan hanya touchstart/mousedown
    btn.addEventListener('mousedown', () => {
        // Tambahkan fallback untuk desktop
        // (opsional: agar bisa diuji di desktop)
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


// --- GAME LOOP & GAMBAR (Lanjutan) ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Gambar Labirin dan Titik Makanan
    // (Implementasikan logika drawMaze() di sini)

    // 2. Gambar Pac-Man
    // (Implementasikan logika drawPacman() di sini)
    
    // 3. Gambar Hantu
    ghosts.forEach(ghost => ghost.draw());
}

function update() {
    // 1. Logika Pergerakan Pac-Man (berdasarkan desiredDirection)
    // 2. Logika "Makan" Titik (update maze array dan score)
    // 3. Logika Pergerakan Hantu (ghost.move())
    // 4. Logika Tabrakan Pac-Man vs Hantu (Jika bertabrakan: Game Over atau Hantu dimakan)
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Mulai Game
gameLoop();

// Catatan: Anda masih perlu mengimplementasikan fungsi drawMaze(), drawPacman(),
// update() secara penuh, dan logika AI Hantu yang kompleks.
