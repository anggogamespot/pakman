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
