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
// ...
function gameLoop() {
    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Perbarui Logika (pergerakan dan tabrakan)
    updatePacman();

    // 3. Gambar Ulang
    drawMap();
    drawPacman();

    // Loop berulang dengan penundaan 100ms
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 100); 
}
// ...
