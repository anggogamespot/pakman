const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

//========== SOUNDS ==========
const soundEat = new Audio();
soundEat.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; // klik pendek

const soundDead = new Audio();
soundDead.src = soundEat.src;

const soundWin = new Audio();
soundWin.src = soundEat.src;

//========== MAP (LEVEL GENERATOR) ==========
let levelString = `
11111111111111
10000010000001
10111010111101
10001000000101
11101111110101
10000010010101
10111010110101
10001000000101
11101111110101
10000010010101
10111010110101
10001000000101
10000000000001
11111111111111`;

let map = levelString
    .trim()
    .split("\n")
    .map(r => r.split("").map(n => parseInt(n)));

const tileSize = 40;

//========== PLAYER ==========
let player = {
    x: 1,
    y: 1,
    dx: 0,
    dy: 0,
    mouth: 0,
    mouthOpen: true
};

//========== GHOST ==========
let ghost = {
    x: 12,
    y: 12,
    path: []
};

//========== GAME STATE ==========
let score = 0;
let lives = 3;

//========== A* PATHFINDING ==========
function heuristic(ax, ay, bx, by) {
    return Math.abs(ax - bx) + Math.abs(ay - by);
}

function aStar(start, goal) {
    let openSet = [start];
    let cameFrom = {};
    let g = {};
    g[start] = 0;

    let f = {};
    f[start] = heuristic(...start, ...goal);

    function key(p) {
        return p[0] + "," + p[1];
    }

    while (openSet.length > 0) {
        openSet.sort((a, b) => f[a] - f[b]);
        let current = openSet.shift();

        if (current[0] === goal[0] && current[1] === goal[1]) {
            let path = [];
            let temp = current;
            while (key(temp) in cameFrom) {
                path.push(temp);
                temp = cameFrom[key(temp)];
            }
            return path.reverse();
        }

        const dirs = [
            [1,0], [-1,0], [0,1], [0,-1]
        ];

        for (let d of dirs) {
            let nx = current[0] + d[0];
            let ny = current[1] + d[1];

            if (map[ny][nx] === 1) continue;

            let neighbor = [nx, ny];

            let tentative = g[current] + 1;
            if (!(neighbor in g) || tentative < g[neighbor]) {
                cameFrom[key(neighbor)] = current;
                g[neighbor] = tentative;
                f[neighbor] = tentative + heuristic(...neighbor, ...goal);

                if (!openSet.some(p => p[0] === nx && p[1] === ny)) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    return [];
}

//========== DRAW FUNCTIONS ==========
function drawMap() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            ctx.fillStyle = map[y][x] === 1 ? "#003cff" : "#000";
            ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);

            if (map[y][x] === 0) {
                ctx.fillStyle = "yellow";
                ctx.beginPath();
                ctx.arc(x*tileSize+20, y*tileSize+20, 5, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    let mouthAngle = player.mouth;

    ctx.moveTo(
        player.x*tileSize+20,
        player.y*tileSize+20
    );
    ctx.arc(
        player.x*tileSize+20,
        player.y*tileSize+20,
        15,
        mouthAngle,
        2*Math.PI - mouthAngle
    );
    ctx.lineTo(player.x*tileSize+20, player.y*tileSize+20);
    ctx.fill();
}

function drawGhost() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ghost.x*tileSize+20, ghost.y*tileSize+20, 15, 0, Math.PI*2);
    ctx.fill();
}

//========== MOVEMENT ==========

function movePlayer() {
    let nx = player.x + player.dx;
    let ny = player.y + player.dy;
    if (map[ny][nx] !== 1) {
        player.x = nx;
        player.y = ny;

        if (map[ny][nx] === 0) {
            map[ny][nx] = 2;
            score += 10;
            soundEat.play();
            scoreEl.textContent = "Score: " + score;
        }
    }

    // mouth animation
    if (player.mouthOpen)
        player.mouth += 0.1;
    else
        player.mouth -= 0.1;

    if (player.mouth >= 0.8) player.mouthOpen = false;
    if (player.mouth <= 0) player.mouthOpen = true;
}

function moveGhost() {
    if (ghost.path.length === 0) {
        ghost.path = aStar([ghost.x, ghost.y], [player.x, player.y]);
    }

    if (ghost.path.length > 0) {
        let step = ghost.path.shift();
        ghost.x = step[0];
        ghost.y = step[1];
    }
}

//========== CHECK ==========
function checkCollisions() {
    if (ghost.x === player.x && ghost.y === player.y) {
        lives--;
        livesEl.textContent = "Lives: " + lives;
        soundDead.play();

        if (lives <= 0) {
            alert("Kamu kalah!");
            location.reload();
        }

        // reset positions
        player.x = 1;
        player.y = 1;
        ghost.x = 12;
        ghost.y = 12;
    }

    // Win condition
    let remaining = 0;
    for (let row of map)
        for (let cell of row)
            if (cell === 0) remaining++;

    if (remaining === 0) {
        soundWin.play();
        alert("Kamu menang!");
        location.reload();
    }
}

//========== GAME LOOP ==========
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    drawPlayer();
    drawGhost();

    movePlayer();
    moveGhost();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

gameLoop();

//========== CONTROLS ==========
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp")    { player.dx=0; player.dy=-1; }
    if (e.key === "ArrowDown")  { player.dx=0; player.dy=1; }
    if (e.key === "ArrowLeft")  { player.dx=-1; player.dy=0; }
    if (e.key === "ArrowRight") { player.dx=1; player.dy=0; }
});

//==== MOBILE TOUCH CONTROLS ====
document.querySelectorAll("#controls button").forEach(btn => {
    btn.addEventListener("click", () => {
        let d = btn.getAttribute("data-dir");
        if (d === "up")    { player.dx=0; player.dy=-1; }
        if (d === "down")  { player.dx=0; player.dy=1; }
        if (d === "left")  { player.dx=-1; player.dy=0; }
        if (d === "right") { player.dx=1; player.dy=0; }
    });
});
