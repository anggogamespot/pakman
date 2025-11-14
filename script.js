const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 40;

// 14x14 grid map
// 1 = wall, 0 = pellet
const map = [
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
 [1,0,0,0,0,0,1,0,0,0,0,0,0,1],
 [1,0,1,1,1,0,1,0,1,1,1,1,0,1],
 [1,0,0,0,1,0,0,0,0,0,0,1,0,1],
 [1,1,1,0,1,1,1,1,1,1,0,1,0,1],
 [1,0,0,0,0,0,1,0,0,1,0,1,0,1],
 [1,0,1,1,1,0,1,0,1,1,0,1,0,1],
 [1,0,0,0,1,0,0,0,0,0,0,1,0,1],
 [1,1,1,0,1,1,1,1,1,1,0,1,0,1],
 [1,0,0,0,0,0,1,0,0,1,0,1,0,1],
 [1,0,1,1,1,0,1,0,1,1,0,1,0,1],
 [1,0,0,0,1,0,0,0,0,0,0,1,0,1],
 [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

let player = { x: 1, y: 1, dx: 0, dy: 0 };
let ghost = { x: 12, y: 12, dirTimer: 0 };

function drawMap() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 1) {
                ctx.fillStyle = "#003cff";
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                ctx.fillStyle = "#000";
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

                // pellets
                if (map[y][x] === 0) {
                    ctx.fillStyle = "yellow";
                    ctx.beginPath();
                    ctx.arc(
                        x * tileSize + tileSize / 2,
                        y * tileSize + tileSize / 2,
                        5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(
        player.x * tileSize + tileSize / 2,
        player.y * tileSize + tileSize / 2,
        15,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawGhost() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
        ghost.x * tileSize + tileSize / 2,
        ghost.y * tileSize + tileSize / 2,
        15,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function movePlayer() {
    let nx = player.x + player.dx;
    let ny = player.y + player.dy;

    if (map[ny][nx] !== 1) {
        player.x = nx;
        player.y = ny;

        // eat pellet
        if (map[ny][nx] === 0)
            map[ny][nx] = 2; 
    }
}

function moveGhost() {
    ghost.dirTimer--;
    if (ghost.dirTimer <= 0) {
        // choose new random direction
        const dirs = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        ghost.dx = d.dx;
        ghost.dy = d.dy;
        ghost.dirTimer = 20;
    }

    let nx = ghost.x + ghost.dx;
    let ny = ghost.y + ghost.dy;

    if (map[ny][nx] !== 1) {
        ghost.x = nx;
        ghost.y = ny;
    }
}

function checkWinLose() {
    // lose
    if (player.x === ghost.x && player.y === ghost.y) {
        alert("Kamu kalah!");
        location.reload();
    }

    // win
    let remaining = 0;
    for (let row of map)
        for (let cell of row)
            if (cell === 0) remaining++;

    if (remaining === 0) {
        alert("Kamu menang!");
        location.reload();
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    drawPlayer();
    drawGhost();

    movePlayer();
    moveGhost();
    checkWinLose();

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp")    { player.dx = 0; player.dy = -1; }
    if (e.key === "ArrowDown")  { player.dx = 0; player.dy = 1; }
    if (e.key === "ArrowLeft")  { player.dx = -1; player.dy = 0; }
    if (e.key === "ArrowRight") { player.dx = 1; player.dy = 0; }
});

gameLoop();
