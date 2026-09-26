const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth < 800 ? window.innerWidth : 800;
canvas.height = window.innerHeight * 0.7;
let groundY = canvas.height - 40;

function resizeCanvas() {
    canvas.width = window.innerWidth < 800 ? window.innerWidth : 800;
    canvas.height = window.innerHeight * 0.7;
    groundY = canvas.height - 40;
    bossCube.y = canvas.height - 110;
    boss.y = bossCube.y - 50;
}

let currentLevel = 1;
let keys = { left: false, right: false, up: false };
const player = { x: 50, y: 100, width: 20, height: 40, velX: 0, velY: 0, speed: 4, jumpForce: 11, grounded: false };
const gravity = 0.5;
const camera = { x: 0, y: 0 };
let totalDeaths = 0;
let isGameRunning = false;

let bossCube = { x: 320, y: canvas.height - 110, w: 160, h: 70 }; 
let boss = { x: bossCube.x + (bossCube.w / 2) - 15, y: bossCube.y - 50, w: 30, h: 50, timeToSurvive: 60, shootTimer: 0 };

let currentEnemies = [];
let currentShooters = [];
let enemyProjectiles = [];

const levels = {
    1: { platforms: [{x: 0, y: groundY, w: 350, h: 40}, {x: 450, y: groundY, w: 400, h: 40}], spikes: [{x: 320, y: groundY, count: 2}], enemies: [{x: 520, y: groundY, w: 20, h: 40, speed: 1.5, minX: 470, maxX: 650}], shooters: [], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    2: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY - 50, w: 120, h: 15}, {x: 420, y: groundY, w: 400, h: 40}], spikes: [{x: 460, y: groundY, count: 3}], enemies: [{x: 500, y: groundY, w: 20, h: 40, speed: 2, minX: 430, maxX: 620}], shooters: [], goal: {x: 720, y: groundY - 50, w: 30, h: 50} },
    3: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 300, y: groundY - 60, w: 100, h: 15}, {x: 450, y: groundY - 120, w: 120, h: 15}, {x: 620, y: groundY, w: 250, h: 40}], spikes: [{x: 320, y: groundY - 60, count: 1}, {x: 650, y: groundY, count: 3}], enemies: [{x: 680, y: groundY, w: 20, h: 40, speed: 1.8, minX: 630, maxX: 780}], shooters: [], goal: {x: 800, y: groundY - 50, w: 30, h: 50} },
    4: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 50, w: 150, h: 15}, {x: 400, y: groundY - 50, w: 150, h: 15}, {x: 600, y: groundY, w: 250, h: 40}], spikes: [{x: 230, y: groundY - 50, count: 2}, {x: 430, y: groundY - 50, count: 2}], enemies: [{x: 620, y: groundY, w: 20, h: 40, speed: 2.2, minX: 610, maxX: 750}], shooters: [], goal: {x: 780, y: groundY - 50, w: 30, h: 50} },
    5: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 350, y: groundY - 60, w: 130, h: 15}, {x: 520, y: groundY, w: 300, h: 40}], spikes: [{x: 120, y: groundY, count: 4}], enemies: [{x: 550, y: groundY, w: 20, h: 40, speed: 2.5, minX: 530, maxX: 720}], shooters: [], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    6: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 40, w: 100, h: 15}, {x: 330, y: groundY - 80, w: 100, h: 15}, {x: 460, y: groundY - 120, w: 100, h: 15}, {x: 600, y: groundY, w: 250, h: 40}], spikes: [{x: 220, y: groundY - 40, count: 1}, {x: 620, y: groundY, count: 3}], enemies: [{x: 660, y: groundY, w: 20, h: 40, speed: 1.6, minX: 610, maxX: 780}], shooters: [], goal: {x: 780, y: groundY - 50, w: 30, h: 50} },
    7: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY, w: 200, h: 40}, {x: 500, y: groundY, w: 300, h: 40}], spikes: [{x: 210, y: groundY, count: 2}, {x: 460, y: groundY, count: 2}], enemies: [{x: 520, y: groundY, w: 20, h: 40, speed: 2, minX: 510, maxX: 680}, {x: 700, y: groundY, w: 20, h: 40, speed: -2, minX: 600, maxX: 760}], shooters: [], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    8: { platforms: [{x: 0, y: groundY, w: 100, h: 40}, {x: 150, y: groundY - 50, w: 100, h: 15}, {x: 300, y: groundY - 100, w: 100, h: 15}, {x: 450, y: groundY - 50, w: 100, h: 15}, {x: 600, y: groundY, w: 200, h: 40}], spikes: [{x: 320, y: groundY - 100, count: 2}], enemies: [{x: 620, y: groundY, w: 20, h: 40, speed: 2.4, minX: 610, maxX: 760}], shooters: [], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    9: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 300, y: groundY - 60, w: 150, h: 15}, {x: 500, y: groundY, w: 300, h: 40}], spikes: [{x: 320, y: groundY - 60, count: 2}, {x: 520, y: groundY, count: 4}], enemies: [{x: 580, y: groundY, w: 20, h: 40, speed: 2.6, minX: 550, maxX: 720}], shooters: [], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    10: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY - 50, w: 120, h: 15}, {x: 400, y: groundY - 100, w: 120, h: 15}, {x: 550, y: groundY, w: 250, h: 40}], spikes: [{x: 270, y: groundY - 50, count: 2}], enemies: [{x: 600, y: groundY, w: 20, h: 40, speed: 1.5, minX: 560, maxX: 740}], shooters: [], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    11: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 400, y: groundY, w: 450, h: 40}], spikes: [], lavas: [{x: 250, y: groundY + 10, w: 150, h: 30}], enemies: [], shooters: [{x: 550, y: groundY, w: 20, h: 40, timer: 0}], goal: {x: 800, y: groundY - 50, w: 30, h: 50} },
    12: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 220, y: groundY - 50, w: 120, h: 15}, {x: 400, y: groundY, w: 400, h: 40}], spikes: [], lavas: [{x: 150, y: groundY + 10, w: 250, h: 30}], enemies: [], shooters: [{x: 450, y: groundY, w: 20, h: 40, timer: 40}], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    13: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 260, y: groundY - 60, w: 130, h: 15}, {x: 450, y: groundY, w: 350, h: 40}], spikes: [{x: 290, y: groundY - 60, count: 2}], lavas: [{x: 200, y: groundY + 10, w: 250, h: 30}], enemies: [], shooters: [{x: 550, y: groundY, w: 20, h: 40, timer: 10}], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    14: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 50, w: 100, h: 15}, {x: 350, y: groundY - 100, w: 100, h: 15}, {x: 500, y: groundY, w: 300, h: 40}], spikes: [], lavas: [{x: 150, y: groundY + 10, w: 350, h: 30}], enemies: [], shooters: [{x: 550, y: groundY, w: 20, h: 40, timer: 80}], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    15: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 450, y: groundY, w: 400, h: 40}], spikes: [{x: 150, y: groundY, count: 3}], lavas: [{x: 300, y: groundY + 10, w: 150, h: 30}], enemies: [], shooters: [{x: 500, y: groundY, w: 20, h: 40, timer: 0}, {x: 650, y: groundY, w: 20, h: 40, timer: 50}], goal: {x: 800, y: groundY - 50, w: 30, h: 50} },
    16: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 40, w: 120, h: 15}, {x: 370, y: groundY - 80, w: 120, h: 15}, {x: 540, y: groundY, w: 300, h: 40}], spikes: [{x: 220, y: groundY - 40, count: 2}], lavas: [{x: 150, y: groundY + 10, w: 390, h: 30}], enemies: [], shooters: [{x: 600, y: groundY, w: 20, h: 40, timer: 20}], goal: {x: 780, y: groundY - 50, w: 30, h: 50} },
    17: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY, w: 200, h: 40}, {x: 550, y: groundY, w: 300, h: 40}], spikes: [{x: 270, y: groundY, count: 3}], lavas: [{x: 450, y: groundY + 10, w: 100, h: 30}], enemies: [], shooters: [{x: 650, y: groundY, w: 20, h: 40, timer: 0}], goal: {x: 800, y: groundY - 50, w: 30, h: 50} },
    18: { platforms: [{x: 0, y: groundY, w: 120, h: 40}, {x: 180, y: groundY - 50, w: 120, h: 15}, {x: 350, y: groundY - 100, w: 120, h: 15}, {x: 520, y: groundY - 50, w: 120, h: 15}, {x: 690, y: groundY, w: 200, h: 40}], spikes: [], lavas: [{x: 120, y: groundY + 10, w: 570, h: 30}], enemies: [], shooters: [{x: 380, y: groundY - 100, w: 20, h: 40, timer: 30}], goal: {x: 820, y: groundY - 50, w: 30, h: 50} },
    19: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 400, y: groundY - 50, w: 150, h: 15}, {x: 650, y: groundY, w: 200, h: 40}], spikes: [{x: 430, y: groundY - 50, count: 3}], lavas: [{x: 250, y: groundY + 10, w: 400, h: 30}], enemies: [], shooters: [{x: 700, y: groundY, w: 20, h: 40, timer: 10}], goal: {x: 800, y: groundY - 50, w: 30, h: 50} },
    20: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 500, y: groundY, w: 300, h: 40}], spikes: [], lavas: [{x: 300, y: groundY + 10, w: 220, h: 30}], enemies: [], shooters: [], goal: {x: 750, y: groundY - 50, w: 30, h: 50} }
};

const startBtn = document.getElementById("startBtn");
const loadBtn = document.getElementById("loadBtn");
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
const resultsContainer = document.getElementById("resultsContainer");
const bgMusic = document.getElementById("bgMusic");
const bossMusic = document.getElementById("bossMusic");
let bossInterval = null;

function playAudio(audio) { if(audio) audio.play().catch(()=>{}); }
function stopAudio(audio) { if(audio) { audio.pause(); audio.currentTime = 0; } }

startBtn.addEventListener("click", () => { mainMenu.style.display = "none"; introScreen.style.display = "flex"; });
introNextBtn.addEventListener("click", () => { introScreen.style.display = "none"; initGame(1); });

loadBtn.addEventListener("click", () => {
    const savedLevel = localStorage.getItem("stickGame2Level");
    const savedDeaths = localStorage.getItem("stickGame2Deaths");
    if(savedLevel) { currentLevel = parseInt(savedLevel); totalDeaths = parseInt(savedDeaths) || 0; mainMenu.style.display = "none"; initGame(currentLevel); }
    else { alert("Сохранений нет!"); }
});
function initGame(level) {
    currentLevel = level;
    resizeCanvas();
    localStorage.setItem("stickGame2Level", currentLevel);
    localStorage.setItem("stickGame2Deaths", totalDeaths);
    
    player.x = 50; player.y = groundY - 120; player.velX = 0; player.velY = 0; player.grounded = false;
    
    let lvD = levels[currentLevel];
    if(lvD.platforms) lvD.platforms.forEach(p => { if(p.h === 40) p.y = groundY; });
    if(lvD.enemies) lvD.enemies.forEach(e => e.y = groundY);
    if(lvD.shooters) lvD.shooters.forEach(s => s.y = groundY);
    if(lvD.goal) lvD.goal.y = groundY - 50;

    currentEnemies = JSON.parse(JSON.stringify(lvD.enemies || []));
    currentShooters = JSON.parse(JSON.stringify(lvD.shooters || []));
    enemyProjectiles = [];
    clearInterval(bossInterval);
    bossTimerContainer.style.display = "none";

    if(currentLevel === 20) {
        boss.timeToSurvive = 60; boss.shootTimer = 0; bossTimerContainer.style.display = "block"; bossTimer.textContent = boss.timeToSurvive;
        stopAudio(bgMusic); playAudio(bossMusic);
        bossInterval = setInterval(() => {
            if (isGameRunning) { boss.timeToSurvive--; bossTimer.textContent = boss.timeToSurvive; if (boss.timeToSurvive <= 0) { clearInterval(bossInterval); endGame(); } }
        }, 1000);
    } else { stopAudio(bossMusic); playAudio(bgMusic); }

    if(!isGameRunning) { isGameRunning = true; requestAnimationFrame(update); }
    
    introScreen.style.display = "none";
    outroScreen.style.display = "none";
    
    canvas.style.display = "block"; ui.style.display = "block"; document.getElementById("gameControls").style.display = "flex";
    levelNum.textContent = currentLevel; deathCount.textContent = totalDeaths;
}

function playerDeath() { totalDeaths++; initGame(currentLevel); }
function checkCollision(r1, r2) { return r1.x < r2.x + r2.w && r1.x + r1.width > r2.x && r1.y < r2.y + r2.h && r1.y + r1.height > r2.y; }

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

function update() {
    if(!isGameRunning) return;
    if (keys.left) player.velX = -player.speed; else if (keys.right) player.velX = player.speed; else player.velX = 0;
    if (keys.up && player.grounded) { player.velY = -player.jumpForce; player.grounded = false; }
    player.velY += gravity; player.x += player.velX; player.y += player.velY; player.grounded = false;

    const lvl = levels[currentLevel];
    if(lvl && lvl.platforms) {
        lvl.platforms.forEach(p => {
            if (player.x < p.x + p.w && player.x + player.width > p.x && player.y < p.y + p.h && player.y + player.height > p.y) {
                if (player.velY > 0 && player.y + player.height - player.velY <= p.y + 6) { player.y = p.y - player.height; player.velY = 0; player.grounded = true; }
            }
        });
    }

    if(currentLevel === 20 && player.x < bossCube.x + bossCube.w && player.x + player.width > bossCube.x && player.y < bossCube.y + bossCube.h && player.y + player.height > bossCube.y) {
        if (player.velY > 0 && player.y + player.height - player.velY <= bossCube.y + 6) { player.y = bossCube.y - player.height; player.velY = 0; player.grounded = true; }
    }

    if(player.x < 0) player.x = 0; if(player.y > canvas.height + 100) playerDeath();
    camera.x = player.x - canvas.width / 4; if(camera.x < 0) camera.x = 0;
    currentEnemies.forEach(enemy => {
        enemy.x += enemy.speed; if(enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) enemy.speed = -enemy.speed;
        let mHitbox = { x: enemy.x, y: groundY - enemy.h, w: enemy.w, h: enemy.h };
        if(checkCollision(player, mHitbox)) playerDeath();
    });

    currentShooters.forEach(sh => {
        sh.timer++; if(sh.timer >= 120) { enemyProjectiles.push({ x: sh.x, y: groundY - 25, w: 10, h: 6, speedX: -4.5, speedY: 0 }); sh.timer = 0; }
        if(checkCollision(player, {x: sh.x, y: groundY - 40, w: sh.w, h: 40})) playerDeath();
    });

    if(lvl && lvl.lavas) lvl.lavas.forEach(lava => { if(checkCollision(player, {x: lava.x, y: groundY + 10, w: lava.w, h: lava.h})) playerDeath(); });
    if(lvl && lvl.spikes) lvl.spikes.forEach(s => {
        for(let i=0; i<s.count; i++) {
            let sp = { x: s.x + (i * 20), y: groundY - 20, w: 20, h: 20 }; if(player.x < sp.x + sp.w && player.x + player.width > sp.x && player.y < sp.y + sp.h && player.y + player.height > sp.y) playerDeath();
        }
    });

    if(currentLevel === 20) {
        boss.shootTimer++; 
        if(boss.shootTimer > 65) {
            let targetX = player.x + player.width/2; let targetY = player.y + player.height/2;
            let currentX = boss.x + boss.w/2; let currentY = boss.y + boss.h/2;
            let angle = Math.atan2(targetY - currentY, targetX - currentX);
            enemyProjectiles.push({ x: currentX, y: currentY, w: 14, h: 14, speedX: Math.cos(angle) * 5, speedY: Math.sin(angle) * 5 });
            boss.shootTimer = 0;
        }
        if(checkCollision(player, {x: boss.x, y: boss.y, w: boss.w, h: boss.h})) playerDeath();
    }

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        let proj = enemyProjectiles[i]; proj.x += proj.speedX; proj.y += (proj.speedY || 0);
        if(checkCollision(player, {x: proj.x, y: proj.y, w: proj.w, h: proj.h})) { playerDeath(); break; }
        if(proj.x < camera.x - 50 || proj.x > camera.x + canvas.width + 50) enemyProjectiles.splice(i, 1);
    }

    if(lvl && lvl.goal && currentLevel < 20 && checkCollision(player, {x: lvl.goal.x, y: lvl.goal.y, w: lvl.goal.w, h: lvl.goal.h})) initGame(currentLevel + 1);
    render(); requestAnimationFrame(update);
}

function drawStickman(x, y, color, isPharaoh = false, isMummy = false) {
    let cx = x + 10; let cy = y + 10;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if(isPharaoh) { 
        ctx.fillStyle = "#ffd700"; ctx.beginPath(); ctx.moveTo(cx - 11, cy + 2);
        ctx.lineTo(cx - 13, cy - 8); ctx.lineTo(cx, cy - 19); ctx.lineTo(cx + 13, cy - 8);
        ctx.lineTo(cx + 11, cy + 2); ctx.fill();
        ctx.strokeStyle = "#0022aa"; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 12); ctx.lineTo(cx - 4, cy + 2);
        ctx.moveTo(cx + 6, cy - 12); ctx.lineTo(cx + 4, cy + 2); ctx.stroke();
    }
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx, cy + 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 10, cy + 12); ctx.lineTo(cx + 10, cy + 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 24); ctx.lineTo(cx - 8, cy + 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 24); ctx.lineTo(cx + 8, cy + 38); ctx.stroke();
    if(isMummy) { 
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.beginPath(); 
        ctx.moveTo(cx - 5, cy + 12); ctx.lineTo(cx + 5, cy + 14);
        ctx.moveTo(cx - 4, cy + 20); ctx.lineTo(cx + 4, cy + 18); ctx.stroke(); 
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = currentLevel <= 10 ? "#fdf6e2" : "#221a1a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.translate(-camera.x, -camera.y);
    const lvl = levels[currentLevel];
    if (currentLevel <= 10) {
        ctx.fillStyle = "#d2b48c"; ctx.beginPath(); ctx.moveTo(100, groundY); ctx.lineTo(250, groundY - 140); ctx.lineTo(400, groundY); ctx.fill();
        ctx.beginPath(); ctx.moveTo(450, groundY); ctx.lineTo(600, groundY - 160); ctx.lineTo(750, groundY); ctx.fill();
    } else {
        ctx.fillStyle = "#3d1d1d"; ctx.beginPath(); ctx.moveTo(80, groundY); ctx.lineTo(180, groundY - 180); ctx.lineTo(280, groundY); ctx.fill();
        ctx.beginPath(); ctx.moveTo(350, groundY); ctx.lineTo(480, groundY - 200); ctx.lineTo(610, groundY); ctx.fill();
    }
    ctx.fillStyle = currentLevel <= 10 ? "#ffcc33" : "#d35400"; if(lvl && lvl.platforms) lvl.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
    if (lvl && lvl.lavas) {
        ctx.fillStyle = "#ff4500"; lvl.lavas.forEach(lava => {
            ctx.fillRect(lava.x, groundY, lava.w, lava.h); ctx.fillStyle = "#ff8c00";
            for (let i = 5; i < lava.w; i += 30) { ctx.beginPath(); ctx.arc(lava.x + i, groundY + 2, 4, 0, Math.PI, true); ctx.fill(); }
        });
    }
    if (lvl && lvl.spikes) {
        ctx.fillStyle = "#737373"; lvl.spikes.forEach(s => {
            for (let i = 0; i < s.count; i++) { let sx = s.x + (i * 20); ctx.beginPath(); ctx.moveTo(sx, groundY); ctx.lineTo(sx + 10, groundY - 20); ctx.lineTo(sx + 20, groundY); ctx.fill(); }
        });
    }
    currentEnemies.forEach(e => drawStickman(e.x, groundY - e.h, "#e2caaa", false, true));
    currentShooters.forEach(sh => drawStickman(sh.x, groundY - 40, "#993399", false, false));
    ctx.fillStyle = currentLevel === 20 ? "#ff4500" : "#ffcc00"; enemyProjectiles.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
    if (currentLevel === 20) {
        ctx.fillStyle = "#a04000"; ctx.fillRect(bossCube.x, bossCube.y, bossCube.w, bossCube.h);
        ctx.strokeStyle = "#ff4500"; ctx.lineWidth = 3; ctx.strokeRect(bossCube.x, bossCube.y, bossCube.w, bossCube.h);
        
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(bossCube.x + 25, bossCube.y + 20, 16, 8);
        ctx.fillRect(bossCube.x + bossCube.w - 41, bossCube.y + 20, 16, 8);
        
        drawStickman(boss.x, boss.y, "#ffd700", true, false); 
    }
    if (lvl && lvl.goal && currentLevel < 20) { ctx.fillStyle = "#00ff66"; ctx.fillRect(lvl.goal.x, groundY - 50, lvl.goal.w, lvl.goal.h); }
    drawStickman(player.x, player.y, "#ff3333", false, false); 
    ctx.restore();
}

function endGame() {
    isGameRunning = false; clearInterval(bossInterval); stopAudio(bgMusic); stopAudio(bossMusic);
    canvas.style.display = "none"; ui.style.display = "none"; document.getElementById("gameControls").style.display = "none";
    resDeaths.textContent = totalDeaths; 
    resultsContainer.style.display = "block"; 
    outroScreen.style.display = "flex";
}

outroCloseBtn.addEventListener("click", () => { outroScreen.style.display = "none"; mainMenu.style.display = "flex"; localStorage.removeItem("stickGame2Level"); currentLevel = 1; totalDeaths = 0; });
window.addEventListener("resize", resizeCanvas);
