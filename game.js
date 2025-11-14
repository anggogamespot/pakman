/* ========= GAME CONSTANTS ========= */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE = 28;     // lebih kecil = peta lebih pas
const ROWS = 20;
const COLS = 20;

canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

/* ========= UI ELEMENTS ========= */
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const highscoreEl = document.getElementById("highscore");

/* ========= SOUNDS ========= */
const sndEat = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
const sndPower = sndEat;
const sndDead = sndEat;
const sndWin = sndEat;

/* ========= LOAD HIGHSCORE ========= */
let highscore = localStorage.getItem("pacman_highscore") || 0;
highscoreEl.textContent = "Highscore: " + highscore;

/* ========= MAP GENERATOR ========= */
function generateLevel(level) {
    // Level makin tinggi, makin banyak ghost
    const base = [
        "11111111111111111111",
        "10000000001100000001",
        "10111101101101111101",
        "10000001000001000001",
        "11101111111111111011",
        "10001000000000010001",
        "10111011101110111001",
        "10000010000010000001",
        "11111011111110111111",
        "10000010000010000001",
        "10111010111010111001",
        "10001000000000010001",
        "11101111111111111011",
        "10000001000001000001",
        "10111101101101111101",
        "10000000001100000001",
        "11111111111111111111"
    ];

    return base.map(row => row.split("").map(x => Number(x)));
}

let map = generateLevel(1);

/* ========= PLAYER ========= */
let player = {
    x: 1,
    y: 1,
    px: 1 * TILE,
    py: 1 * TILE,
    speed: 2,
    dx: 0,
    dy: 0,
    mouth: 0,
    mouthOpen: true,
    powered: 0
};

/* ========= GHOSTS ========= */
let ghosts = [];

function spawnGhosts(level) {
    ghosts = [];
    let count = 2 + level; // level makin tinggi makin banyak ghost
    for (let i = 0; i < count; i++) {
        ghosts.push({
            x: 10,
            y: 8,
            px: 10 * TILE,
            py: 8 * TILE,
            speed: 1.5,
            path: [],
            scared: false
        });
    }
}

spawnGhosts(1);

let score = 0;
let lives = 3;
let level = 1;
/* ========= DRAWING ========= */
function drawTile(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
}

function drawMap() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {

            if (map[y][x] === 1) {
                drawTile(x, y, "#003cff"); // wall
            } else {
                drawTile(x, y, "#000"); // empty
                ctx.fillStyle = "yellow";

                // pellet
                if (map[y][x] === 0) {
                    ctx.beginPath();
                    ctx.arc(x*TILE + TILE/2, y*TILE + TILE/2, 3, 0, Math.PI*2);
                    ctx.fill();
                }

                // power pellet
                if (map[y][x] === 2) {
                    ctx.beginPath();
                    ctx.arc(x*TILE + TILE/2, y*TILE + TILE/2, 7, 0, Math.PI*2);
                    ctx.fillStyle = "white";
                    ctx.fill();
                }
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.powered > 0 ? "cyan" : "yellow";

    ctx.beginPath();
    let angle = player.mouth;

    ctx.moveTo(player.px + TILE/2, player.py + TILE/2);
    ctx.arc(
        player.px + TILE/2,
        player.py + TILE/2,
        TILE/2 - 2,
        angle,
        2*Math.PI - angle
    );
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(g => {
        ctx.fillStyle = g.scared ? "blue" : "red";
        ctx.beginPath();
        ctx.arc(g.px + TILE/2, g.py + TILE/2, TILE/2 - 2, 0, Math.PI*2);
        ctx.fill();
    });
}

/* ========= A* PATHFINDING ========= */
function neighbors(x, y) {
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const list = [];

    for (let d of dirs) {
        let nx = x + d[0];
        let ny = y + d[1];
        if (map[ny] && map[ny][nx] === 0 || map[ny][nx] === 2)
            list.push([nx, ny]);
    }
    return list;
}

function astar(start, goal) {
    let open = [start];
    let came = {};
    let g = {};
    let f = {};

    g[start] = 0;
    f[start] = 1;

    function k(p) { return p[0]+","+p[1]; }

    while (open.length) {
        open.sort((a,b) => f[k(a)] - f[k(b)]);
        let cur = open.shift();
        let ck = k(cur);

        if (cur[0] === goal[0] && cur[1] === goal[1]) {
            let path = [];
            while (ck in came) {
                path.push(cur);
                cur = came[ck];
                ck = k(cur);
            }
            return path.reverse();
        }

        for (let n of neighbors(cur[0], cur[1])) {
            let nk = k(n);
            let tentative = g[ck] + 1;
            if (!(nk in g) || tentative < g[nk]) {
                came[nk] = cur;
                g[nk] = tentative;
                f[nk] = tentative + Math.abs(n[0]-goal[0]) + Math.abs(n[1]-goal[1]);
                if (!open.some(p => p[0]==n[0] && p[1]==n[1])) open.push(n);
            }
        }
    }
    return [];
}
/* ========= MOVEMENT ========= */
function movePlayer() {
    let nx = player.px + player.dx * player.speed;
    let ny = player.py + player.dy * player.speed;

    // grid collision
    let cx = Math.floor(nx / TILE);
    let cy = Math.floor(ny / TILE);

    if (map[cy] && map[cy][cx] !== 1) {
        player.px = nx;
        player.py = ny;
        player.x = cx;
        player.y = cy;
    }

    // pellet
    if (map[player.y][player.x] === 0) {
        map[player.y][player.x] = -1;
        score += 10;
        sndEat.play();
        scoreEl.textContent = "Score: " + score;
    }

    // power pellet
    if (map[player.y][player.x] === 2) {
        map[player.y][player.x] = -1;
        player.powered = 500;
        sndPower.play();
        ghosts.forEach(g => g.scared = true);
    }

    // mouth animation
    if (player.mouthOpen) player.mouth += 0.15;
    else player.mouth -= 0.15;
    if (player.mouth > 0.8) player.mouthOpen = false;
    if (player.mouth < 0.1) player.mouthOpen = true;

    if (player.powered > 0) player.powered--;
    if (player.powered === 0) ghosts.forEach(g => g.scared = false);
}

function moveGhosts() {
    ghosts.forEach(g => {
        if (g.path.length === 0 || Math.random() < 0.01) {
            g.path = astar([g.x,g.y],[player.x,player.y]);
        }
        if (g.path.length > 0) {
            let step = g.path.shift();
            g.x = step[0];
            g.y = step[1];
            g.px = g.x * TILE;
            g.py = g.y * TILE;
        }
    });
}

/* ========= COLLISION ========= */
function checkCollision() {
    ghosts.forEach(g => {
        if (Math.abs(g.px - player.px) < TILE/2 &&
            Math.abs(g.py - player.py) < TILE/2) {

            if (player.powered > 0) {
                // Pacman makan hantu
                score += 200;
                g.x = 10;
                g.y = 8;
                g.px = g.x * TILE;
                g.py = g.y * TILE;
                g.scared = false;
                return;
            }

            // Pacman mati
            lives--;
            livesEl.textContent = "Lives: " + lives;
            sndDead.play();

            if (lives <= 0) {
                alert("Kamu kalah!");
                location.reload();
            }

            // reset posisi
            player.x = 1; player.y = 1;
            player.px = 1*TILE; player.py = 1*TILE;

            ghosts.forEach(g => {
                g.x = 10; g.y = 8;
                g.px = g.x*TILE; g.py = g.y*TILE;
            });
        }
    });
}

/* ========= WIN CHECK ========= */
function checkWin() {
    let remaining = 0;
    for (let row of map)
        for (let cell of row)
            if (cell === 0 || cell === 2)
                remaining++;

    if (remaining === 0) {
        sndWin.play();
        level++;
        levelEl.textContent = "Level: " + level;

        if (score > highscore) {
            localStorage.setItem("pacman_highscore", score);
        }

        map = generateLevel(level);
        spawnGhosts(level);
        player.x = 1;
        player.y = 1;
        player.px = 1*TILE;
        player.py = 1*TILE;
    }
}

/* ========= GAME LOOP ========= */
function gameLoop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawMap();
    drawPlayer();
    drawGhosts();

    movePlayer();
    moveGhosts();

    checkCollision();
    checkWin();

    requestAnimationFrame(gameLoop);
}

gameLoop();

/* ========= KEYBOARD ========= */
document.addEventListener("keydown", e => {
    if (e.key==="ArrowUp") { player.dx=0; player.dy=-1; }
    if (e.key==="ArrowDown") { player.dx=0; player.dy=1; }
    if (e.key==="ArrowLeft") { player.dx=-1; player.dy=0; }
    if (e.key==="ArrowRight") { player.dx=1; player.dy=0; }
});

/* ========= MOBILE BUTTONS ========= */
document.querySelectorAll("#controls button").forEach(btn => {
    btn.addEventListener("click", ()=>{
        let d = btn.dataset.dir;
        if (d==="up") player.dx=0, player.dy=-1;
        if (d==="down") player.dx=0, player.dy=1;
        if (d==="left") player.dx=-1, player.dy=0;
        if (d==="right") player.dx=1, player.dy=0;
    });
});
