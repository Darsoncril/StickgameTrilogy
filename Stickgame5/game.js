// =========================================================================
// ЧАСТЬ 1: НАСТРОЙКИ, ИНИЦИАЛИЗАЦИЯ И ПЕРЕМЕННЫЕ
// =========================================================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth < 800 ? window.innerWidth : 800;
canvas.height = window.innerHeight * 0.7;
let groundY = canvas.height - 40;

function resizeCanvas() {
    canvas.width = window.innerWidth < 800 ? window.innerWidth : 800;
    canvas.height = window.innerHeight * 0.7;
    groundY = canvas.height - 40;
}

let currentLevel = 1;
let keys = { left: false, right: false, up: false };

const player = { x: 50, y: 100, width: 20, height: 40, velX: 0, velY: 0, speed: 4.5, jumpForce: 11.5, grounded: false };
const camera = { x: 0, y: 0 };
let totalDeaths = 0;
let isGameRunning = false;

const bossImg = new Image();
bossImg.src = "image_U2Jm8_.png"; 

let bossPhase2Triggered = false; 

let boss = {
    x: 340, y: groundY - 140, w: 120, h: 100,
    active: false,
    shootTimer: 0,
    phase: 1,
    phaseTimer: 0,
    ballsCollected: 0
};

let collectibles = []; 
let bossMinions = [];  
let backgroundTrees = []; 

let currentEnemies = [];
let currentShooters = [];
let enemyProjectiles = [];

const bgMusic = document.getElementById("bgMusic");
const bossMusic = document.getElementById("bossMusic");

function playAudio(audio) { if(audio) audio.play().catch(()=>{}); }
function stopAudio(audio) { if(audio) { audio.pause(); audio.currentTime = 0; } }

function generateTrees() {
    backgroundTrees = [];
    for(let i = 0; i < 40; i++) {
        backgroundTrees.push({
            x: i * 80 + Math.random() * 30,
            height: 80 + Math.random() * 100,
            width: 15 + Math.random() * 15
        });
    }
}

// =========================================================================
// ЧАСТЬ 2: СЕТКА ИСПРАВЛЕННЫХ УРОВНЕЙ ТЁМНОГО МИРА (1-20)
// =========================================================================
const levels = {
    1: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 350, y: groundY - 60, w: 120, h: 40}, {x: 550, y: groundY - 120, w: 150, h: 40}, {x: 780, y: groundY, w: 500, h: 40}], spikes: [{x: 270, y: groundY, count: 4}], enemies: [{x: 850, y: groundY, w: 20, h: 40, speed: 2.8, minX: 790, maxX: 1050}], shooters: [], goal: {x: 1150, y: groundY - 50, w: 30, h: 50} },
    2: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 280, y: groundY - 60, w: 80, h: 20, type: "vanish", timer: -1}, {x: 440, y: groundY - 120, w: 80, h: 20, type: "vanish", timer: -1}, {x: 600, y: groundY - 40, w: 90, h: 20}, {x: 780, y: groundY, w: 450, h: 40}], spikes: [{x: 210, y: groundY, count: 28}], enemies: [], shooters: [], goal: {x: 1100, y: groundY - 50, w: 30, h: 50} },
    3: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 400, y: groundY - 70, w: 130, h: 20}, {x: 620, y: groundY - 140, w: 130, h: 20}, {x: 850, y: groundY, w: 400, h: 40}], spikes: [{x: 890, y: groundY, count: 5}], enemies: [], shooters: [{x: 980, y: groundY, w: 20, h: 40, timer: 0}], goal: {x: 1180, y: groundY - 50, w: 30, h: 50} },
    4: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 280, y: groundY - 50, w: 120, h: 20}, {x: 480, y: groundY - 100, w: 120, h: 20}, {x: 680, y: groundY - 40, w: 120, h: 20}, {x: 880, y: groundY, w: 350, h: 40}], spikes: [{x: 320, y: groundY - 50, count: 2}], enemies: [{x: 920, y: groundY, w: 20, h: 40, speed: 3.5, minX: 890, maxX: 1100}], shooters: [], goal: {x: 1100, y: groundY - 50, w: 30, h: 50} },
    5: { platforms: [{x: 0, y: groundY, w: 180, h: 40}, {x: 240, y: groundY - 60, w: 70, h: 20, type: "vanish", timer: -1}, {x: 380, y: groundY - 120, w: 70, h: 20, type: "vanish", timer: -1}, {x: 520, y: groundY - 180, w: 70, h: 20, type: "vanish", timer: -1}, {x: 660, y: groundY - 80, w: 100, h: 20}, {x: 820, y: groundY, w: 400, h: 40}], spikes: [{x: 180, y: groundY, count: 32}], enemies: [], shooters: [], goal: {x: 1100, y: groundY - 50, w: 30, h: 50} },
    6: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 340, y: groundY - 40, w: 150, h: 20}, {x: 580, y: groundY - 100, w: 150, h: 20}, {x: 820, y: groundY, w: 400, h: 40}], spikes: [{x: 360, y: groundY - 40, count: 3}], enemies: [], shooters: [{x: 900, y: groundY, w: 20, h: 40, timer: 15}], goal: {x: 1100, y: groundY - 50, w: 30, h: 50} },
    7: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 420, y: groundY, w: 250, h: 40}, {x: 750, y: groundY, w: 400, h: 40}], spikes: [{x: 340, y: groundY, count: 4}], enemies: [{x: 800, y: groundY, w: 20, h: 40, speed: 3.2, minX: 760, maxX: 1000}], shooters: [], goal: {x: 1050, y: groundY - 50, w: 30, h: 50} },
    8: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 220, y: groundY - 60, w: 60, h: 20, type: "vanish", timer: -1}, {x: 340, y: groundY - 120, w: 60, h: 20, type: "vanish", timer: -1}, {x: 460, y: groundY - 180, w: 60, h: 20, type: "vanish", timer: -1}, {x: 580, y: groundY - 120, w: 60, h: 20, type: "vanish", timer: -1}, {x: 700, y: groundY, w: 400, h: 40}], spikes: [{x: 150, y: groundY, count: 27}], enemies: [], shooters: [{x: 850, y: groundY, w: 20, h: 40, timer: 30}], goal: {x: 1000, y: groundY - 50, w: 30, h: 50} },
    9: { platforms: [{x: 0, y: groundY, w: 350, h: 40}, {x: 450, y: groundY - 70, w: 180, h: 20}, {x: 720, y: groundY, w: 450, h: 40}], spikes: [{x: 760, y: groundY, count: 6}], enemies: [{x: 850, y: groundY, w: 20, h: 40, speed: 3.8, minX: 730, maxX: 1050}], shooters: [], goal: {x: 1080, y: groundY - 50, w: 30, h: 50} },
    10: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 340, y: groundY - 50, w: 150, h: 20}, {x: 560, y: groundY - 110, w: 150, h: 20}, {x: 780, y: groundY, w: 400, h: 40}], spikes: [{x: 380, y: groundY - 50, count: 3}], enemies: [], shooters: [{x: 850, y: groundY, w: 20, h: 40, timer: 0}], goal: {x: 1050, y: groundY - 50, w: 30, h: 50} },
    11: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 280, y: groundY - 60, w: 80, h: 20, type: "vanish", timer: -1}, {x: 420, y: groundY - 120, w: 80, h: 20, type: "vanish", timer: -1}, {x: 560, y: groundY - 60, w: 80, h: 20, type: "vanish", timer: -1}, {x: 700, y: groundY, w: 450, h: 40}], spikes: [{x: 200, y: groundY, count: 25}], enemies: [{x: 820, y: groundY, w: 20, h: 40, speed: 2.5, minX: 720, maxX: 1000}], shooters: [], goal: {x: 1050, y: groundY - 50, w: 30, h: 50} },
    12: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 320, y: groundY - 60, w: 140, h: 20}, {x: 540, y: groundY - 120, w: 140, h: 20}, {x: 760, y: groundY, w: 400, h: 40}], spikes: [], enemies: [], shooters: [{x: 850, y: groundY, w: 20, h: 40, timer: 25}], goal: {x: 1050, y: groundY - 50, w: 30, h: 50} },
    13: { platforms: [{x: 0, y: groundY, w: 350, h: 40}, {x: 440, y: groundY - 60, w: 180, h: 20}, {x: 700, y: groundY, w: 400, h: 40}], spikes: [{x: 460, y: groundY - 60, count: 3}], enemies: [{x: 780, y: groundY, w: 20, h: 40, speed: 4.0, minX: 720, maxX: 980}], shooters: [], goal: {x: 1020, y: groundY - 50, w: 30, h: 50} },
    14: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 230, y: groundY - 50, w: 70, h: 20, type: "vanish", timer: -1}, {x: 370, y: groundY - 110, w: 70, h: 20, type: "vanish", timer: -1}, {x: 510, y: groundY - 170, w: 70, h: 20, type: "vanish", timer: -1}, {x: 650, y: groundY - 100, w: 100, h: 20}, {x: 800, y: groundY, w: 400, h: 40}], spikes: [{x: 150, y: groundY, count: 32}], enemies: [], shooters: [{x: 900, y: groundY, w: 20, h: 40, timer: 0}], goal: {x: 1100, y: groundY - 50, w: 30, h: 50} },
    15: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 420, y: groundY - 60, w: 160, h: 20}, {x: 660, y: groundY - 120, w: 160, h: 20}, {x: 880, y: groundY, w: 400, h: 40}], spikes: [{x: 920, y: groundY, count: 5}], enemies: [{x: 960, y: groundY, w: 20, h: 40, speed: 4.2, minX: 900, maxX: 1150}], shooters: [], goal: {x: 1180, y: groundY - 50, w: 30, h: 50} },
    16: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 290, y: groundY - 60, w: 140, h: 20}, {x: 500, y: groundY - 120, w: 140, h: 20}, {x: 710, y: groundY - 60, w: 140, h: 20}, {x: 900, y: groundY, w: 350, h: 40}], spikes: [{x: 320, y: groundY - 60, count: 2}], enemies: [], shooters: [{x: 1000, y: groundY, w: 20, h: 40, timer: 45}], goal: {x: 1120, y: groundY - 50, w: 30, h: 50} },
    17: { platforms: [{x: 0, y: groundY, w: 180, h: 40}, {x: 250, y: groundY - 70, w: 70, h: 20, type: "vanish", timer: -1}, {x: 390, y: groundY - 130, w: 70, h: 20, type: "vanish", timer: -1}, {x: 530, y: groundY - 70, w: 70, h: 20, type: "vanish", timer: -1}, {x: 680, y: groundY, w: 500, h: 40}], spikes: [{x: 180, y: groundY, count: 25}], enemies: [{x: 750, y: groundY, w: 20, h: 40, speed: 4.5, minX: 700, maxX: 1000}], shooters: [], goal: {x: 1080, y: groundY - 50, w: 30, h: 50} },
    18: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 350, y: groundY - 50, w: 150, h: 20}, {x: 560, y: groundY - 110, w: 150, h: 20}, {x: 780, y: groundY, w: 400, h: 40}], spikes: [{x: 400, y: groundY - 50, count: 3}], enemies: [], shooters: [{x: 880, y: groundY, w: 20, h: 40, timer: 20}], goal: {x: 1050, y: groundY - 50, w: 30, h: 50} },
    19: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 300, y: groundY - 60, w: 180, h: 20}, {x: 550, y: groundY - 120, w: 180, h: 20}, {x: 800, y: groundY, w: 450, h: 40}], spikes: [{x: 840, y: groundY, count: 6}], enemies: [{x: 900, y: groundY, w: 20, h: 40, speed: 4.8, minX: 820, maxX: 1100}], shooters: [], goal: {x: 1150, y: groundY - 50, w: 30, h: 50} },
    20: { 
        platforms: [
            {x: 0, y: groundY, w: 800, h: 40}, 
            {x: 60, y: groundY - 100, w: 150, h: 15}, 
            {x: 590, y: groundY - 100, w: 150, h: 15}, 
            {x: 275, y: groundY - 180, w: 250, h: 15}  
        ],
        spikes: [], enemies: [], shooters: [], goal: null
    }
};const startBtn = document.getElementById("startBtn");
const mainMenu = document.getElementById("mainMenu");
const ui = document.getElementById("ui");
const levelNum = document.getElementById("levelNum");
const deathCount = document.getElementById("deathCount");
const bossTimerContainer = document.getElementById("bossTimerContainer");
const bossTimer = document.getElementById("bossTimer");
const introScreen = document.getElementById("introScreen");
const introNextBtn = document.getElementById("introNextBtn");
const outroScreen = document.getElementById("outroScreen");
const outroCloseBtn = document.getElementById("outroCloseBtn");
const resDeaths = document.getElementById("resDeaths");

startBtn.addEventListener("click", () => { mainMenu.style.display = "none"; introScreen.style.display = "flex"; });
introNextBtn.addEventListener("click", () => { introScreen.style.display = "none"; totalDeaths = 0; bossPhase2Triggered = false; initGame(1); });

function initGame(level) {
    currentLevel = level;
    resizeCanvas();
    generateTrees();
    
    player.x = 50; 
    player.y = groundY - 120; 
    player.velX = 0; 
    player.velY = 0; 
    player.grounded = false;
    
    let lvD = levels[currentLevel];
    if(lvD.platforms) {
        lvD.platforms.forEach(p => { 
            if(p.h === 40) p.y = groundY; 
            if(p.type === "vanish") p.timer = -1; 
        });
    }
    if(lvD.enemies) lvD.enemies.forEach(e => { e.y = groundY; });
    if(lvD.shooters) lvD.shooters.forEach(s => { s.y = groundY; });

    currentEnemies = JSON.parse(JSON.stringify(lvD.enemies || []));
    currentShooters = JSON.parse(JSON.stringify(lvD.shooters || []));
    enemyProjectiles = [];
    collectibles = [];
    bossMinions = [];
    
    bossTimerContainer.style.display = "none";
    boss.active = false;

    if(currentLevel === 20) {
        bossTimerContainer.style.display = "block";
        boss.active = true;
        boss.shootTimer = 0;
        boss.x = 340;
        boss.y = groundY - 140;
        boss.ballsCollected = 0;

        boss.phase = 1; 
        boss.phaseTimer = 1800; 
        bossTimer.innerHTML = `<span style="color:#1a331e;">Фаза 1: Выживание (${Math.ceil(boss.phaseTimer/60)}с)</span>`;

        stopAudio(bgMusic); playAudio(bossMusic);
    } else {
        stopAudio(bossMusic); playAudio(bgMusic);
    }

    if(!isGameRunning) { isGameRunning = true; requestAnimationFrame(update); }
    introScreen.style.display = "none"; outroScreen.style.display = "none";
    canvas.style.display = "block"; ui.style.display = "flex"; document.getElementById("gameControls").style.display = "flex";
    levelNum.textContent = currentLevel; deathCount.textContent = totalDeaths;
}

window.addEventListener("keydown", (e) => {
    if(e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
    if(e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
    if(e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") keys.up = true;
});
window.addEventListener("keyup", (e) => {
    if(e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
    if(e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
    if(e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") keys.up = false;
});

const setupBtn = (id, key) => {
    const el = document.getElementById(id);
    if(el) {
        el.addEventListener("touchstart", (e) => { e.preventDefault(); keys[key] = true; });
        el.addEventListener("touchend", (e) => { e.preventDefault(); keys[key] = false; });
        el.addEventListener("mousedown", () => keys[key] = true); el.addEventListener("mouseup", () => keys[key] = false);
    }
};
setupBtn("btnLeft", "left"); setupBtn("btnRight", "right"); setupBtn("btnJump", "up");

function playerDeath() { totalDeaths++; initGame(currentLevel); }
function checkCollision(r1, r2) { return r1.x < r2.x + r2.w && r1.x + r1.width > r2.x && r1.y < r2.y + r2.h && r1.y + r1.height > r2.y; }

// =========================================================================
// ЧАСТЬ 4.1: ДВИЖОК UPDATE И ЛОГИКА СМЕНЫ ФАЗ ФИНАЛЬНОГО БОССА
// =========================================================================
function update() {
    if(!isGameRunning) return;
    let currentGravity = 0.45; let currentJumpForce = 11.5;

    if (keys.left) player.velX = -player.speed;
    else if (keys.right) player.velX = player.speed;
    else player.velX = 0;

    if (keys.up && player.grounded) { player.velY = -currentJumpForce; player.grounded = false; }
    player.velY += currentGravity; player.x += player.velX; player.y += player.velY; player.grounded = false;

    const lvl = levels[currentLevel];
    if(lvl && lvl.platforms) {
        lvl.platforms.forEach(p => {
            if (p.type === "vanish" && p.timer === 0) return; 
            if (player.x < p.x + p.w && player.x + player.width > p.x && player.y < p.y + p.h && player.y + player.height > p.y) {
                if (player.velY > 0 && player.y + player.height - player.velY <= p.y + 7) {
                    player.y = p.y - player.height; player.velY = 0; player.grounded = true;
                    if(p.type === "vanish" && p.timer === -1) p.timer = 35; 
                }
            }
        });
        lvl.platforms.forEach(p => { if(p.type === "vanish" && p.timer > 0) p.timer--; });
    }

    if(player.x < 0) player.x = 0; if(player.y > canvas.height + 150) playerDeath();
    camera.x = player.x - canvas.width / 3; if(camera.x < 0) camera.x = 0; camera.y = 0;

    currentEnemies.forEach(enemy => {
        enemy.x += enemy.speed; if(enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) enemy.speed = -enemy.speed;
        if(checkCollision(player, { x: enemy.x, y: enemy.y - enemy.h, w: enemy.w, h: enemy.h })) playerDeath();
    });

    currentShooters.forEach(sh => {
        sh.timer++; if(sh.timer >= 90) { enemyProjectiles.push({ x: sh.x, y: sh.y - 25, w: 12, h: 6, speedX: -4.5, speedY: 0 }); sh.timer = 0; }
        if(checkCollision(player, {x: sh.x, y: sh.y - 40, w: sh.w, h: 40})) playerDeath();
    });

    if(lvl && lvl.spikes) {
        lvl.spikes.forEach(s => { for(let i=0; i<s.count; i++) { if(checkCollision(player, { x: s.x + (i * 20), y: groundY - 20, w: 20, h: 20 })) playerDeath(); } });
    }    if(currentLevel === 20 && boss.active) {
        boss.shootTimer++;
        if(boss.shootTimer >= 40) {
            let bx = boss.x + boss.w / 2; let by = boss.y + boss.h / 2;
            let dx = (player.x + 10) - bx; let dy = (player.y + 20) - by; let dist = Math.sqrt(dx * dx + dy * dy);
            if(dist > 0) enemyProjectiles.push({ x: bx, y: by, w: 14, h: 14, speedX: (dx / dist) * 4.8, speedY: (dy / dist) * 4.8 });
            boss.shootTimer = 0;
        }

        bossMinions.forEach(m => { m.x += m.speed; if(m.x <= m.minX || m.x >= m.maxX) m.speed = -m.speed; if(checkCollision(player, { x: m.x, y: groundY - 40, w: 20, h: 40 })) playerDeath(); });

        collectibles.forEach(ball => {
            if(!ball.collected && checkCollision(player, ball)) {
                ball.collected = true; boss.ballsCollected++;
                if(boss.phase === 2) {
                    bossTimer.innerHTML = `<span style="color:#a020f0;">Фаза 2: Кристалл (${boss.ballsCollected}/3)</span>`;
                    if(boss.ballsCollected === 3) {
                        boss.phase = 3; boss.ballsCollected = 0;
                        collectibles = [{ x: 90, y: groundY - 20, w: 16, h: 16, collected: false }, { x: 710, y: groundY - 20, w: 16, h: 16, collected: false }, { x: 390, y: groundY - 220, w: 16, h: 16, collected: false }];
                        bossTimer.innerHTML = `<span style="color:#ff3333;">ФИНАЛ: Уничтожь Босса (${boss.ballsCollected}/3)</span>`;
                    }
                } else if(boss.phase === 3 && boss.ballsCollected === 3) { endGame(); return; }
            }
        });

        if(boss.phase === 1) {
            boss.phaseTimer--; bossTimer.innerHTML = `<span style="color:#1a331e;">Фаза 1: Выживание (${Math.ceil(boss.phaseTimer/60)}с)</span>`;
            if(boss.phaseTimer <= 0) {
                boss.phase = 2; boss.ballsCollected = 0;
                collectibles = [{ x: 130, y: groundY - 140, w: 16, h: 16, collected: false }, { x: 660, y: groundY - 140, w: 16, h: 16, collected: false }, { x: 400, y: groundY - 220, w: 16, h: 16, collected: false }];
                bossMinions = [{ x: 80, y: groundY, speed: 2.2, minX: 20, maxX: 220 }, { x: 700, y: groundY, speed: -2.2, minX: 580, maxX: 780 }];
            }
        }
    }

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        let p = enemyProjectiles[i]; p.x += p.speedX; p.y += p.speedY; if(checkCollision(player, p)) { playerDeath(); break; }
        if(p.x < camera.x - 100 || p.x > camera.x + canvas.width + 100 || p.y < 0 || p.y > canvas.height + 100) enemyProjectiles.splice(i, 1);
    }
    if(lvl && lvl.goal && checkCollision(player, lvl.goal)) initGame(currentLevel + 1);
    render(); requestAnimationFrame(update);
}

// =========================================================================
// ЧАСТЬ 4.2: ФУНКЦИЯ КРАСНОГО ИГРОКА, ТРЕЩИНЫ КРИСТАЛЛА И ФИКС КНОПКИ МЕНЮ
// =========================================================================
function drawStickman(x, y, color, isAlien = false) {
    let cx = x + 10; let cy = y + 10;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if(isAlien) { ctx.strokeStyle = "#1a331e"; ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy - 12); ctx.stroke(); }
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx, cy + 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 10, cy + 12); ctx.lineTo(cx + 10, cy + 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 24); ctx.lineTo(cx - 8, cy + 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 24); ctx.lineTo(cx + 8, cy + 38); ctx.stroke();
}function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.translate(-camera.x, -camera.y);

    ctx.fillStyle = "#0a0314";
    backgroundTrees.forEach(t => {
        ctx.fillRect(t.x, groundY - t.height, t.width, t.height);
        ctx.beginPath(); ctx.moveTo(t.x + t.width/2, groundY - t.height);
        ctx.lineTo(t.x - 20, groundY - t.height - 20); ctx.lineTo(t.x + t.width + 20, groundY - t.height - 15); ctx.stroke();
    });

    const lvl = levels[currentLevel];
    if(currentLevel === 20 && boss.phase < 3) {
        ctx.fillStyle = "#3a1050"; ctx.shadowColor = "#3a1050"; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.moveTo(400, groundY - 300); ctx.lineTo(430, groundY - 250);
        ctx.lineTo(400, groundY - 200); ctx.lineTo(370, groundY - 250); ctx.fill(); ctx.shadowBlur = 0;
        
        if(boss.phase === 2 && boss.ballsCollected > 0) {
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
            if(boss.ballsCollected >= 1) { ctx.beginPath(); ctx.moveTo(400, groundY - 300); ctx.lineTo(395, groundY - 260); ctx.lineTo(410, groundY - 240); ctx.stroke(); }
            if(boss.ballsCollected >= 2) { ctx.beginPath(); ctx.moveTo(430, groundY - 250); ctx.lineTo(405, groundY - 245); ctx.lineTo(385, groundY - 220); ctx.stroke(); }
        }
    }

    if(lvl && lvl.platforms) {
        lvl.platforms.forEach(p => {
            if(p.type === "vanish" && p.timer === 0) return;
            ctx.fillStyle = (p.type === "vanish" && p.timer > 0 && p.timer % 4 < 2) ? "#1a331e" : "#0d0314";
            ctx.fillRect(p.x, p.y, p.w, p.h); ctx.fillStyle = "#1a331e"; ctx.fillRect(p.x, p.y, p.w, 4);
        });
    }

    if (lvl && lvl.spikes) {
        lvl.spikes.forEach(s => {
            ctx.fillStyle = "#05010a";
            for (let i = 0; i < s.count; i++) {
                let sx = s.x + (i * 20); ctx.beginPath(); ctx.moveTo(sx, groundY); ctx.lineTo(sx + 10, groundY - 20); ctx.lineTo(sx + 20, groundY); ctx.fill();
                ctx.strokeStyle = "#1a331e"; ctx.lineWidth = 1.5; ctx.stroke();
            }
        });
    }

    collectibles.forEach(b => { if(!b.collected) { ctx.fillStyle = "#3a1050"; ctx.beginPath(); ctx.arc(b.x + 8, b.y + 8, 8, 0, Math.PI * 2); ctx.fill(); } });
    currentEnemies.forEach(e => { drawStickman(e.x, e.y - e.h, "#000000", true); });
    currentShooters.forEach(sh => { drawStickman(sh.x, sh.y - 40, "#000000", true); });
    bossMinions.forEach(m => { drawStickman(m.x, groundY - 40, "#000000", true); });
    enemyProjectiles.forEach(p => { ctx.fillStyle = "#3a1050"; ctx.beginPath(); ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2); ctx.fill(); });

    if (currentLevel === 20 && boss.active) {
        if(bossImg.complete && bossImg.src) ctx.drawImage(bossImg, boss.x, boss.y, boss.w, boss.h);
        else { ctx.fillStyle = "#3a1050"; ctx.fillRect(boss.x, boss.y, boss.w, boss.h); }

        if(boss.phase < 3) {
            ctx.strokeStyle = "rgba(58, 16, 80, 0.6)"; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(boss.x + boss.w/2, boss.y + boss.h/2, 85, 0, Math.PI * 2); ctx.stroke();
            if(Math.sqrt(Math.pow((player.x+10) - (boss.x+60), 2) + Math.pow((player.y+20) - (boss.y+50), 2)) < 95) playerDeath();
        }
    }

    if (lvl && lvl.goal) { ctx.fillStyle = "#1a331e"; ctx.fillRect(lvl.goal.x, lvl.goal.y, lvl.goal.w, lvl.goal.h); }
    drawStickman(player.x, player.y, "#ff1111", false); ctx.restore();
}

function endGame() {
    isGameRunning = false; stopAudio(bgMusic); stopAudio(bossMusic);
    canvas.style.display = "none"; ui.style.display = "none"; document.getElementById("gameControls").style.display = "none";
    resDeaths.textContent = totalDeaths; outroScreen.style.display = "flex";
}

outroCloseBtn.addEventListener("click", () => { outroScreen.style.display = "none"; mainMenu.style.display = "flex"; currentLevel = 1; totalDeaths = 0; });
window.addEventListener("resize", resizeCanvas);