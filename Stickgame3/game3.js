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

// Параметры игрока
const player = { x: 50, y: 100, width: 20, height: 40, velX: 0, velY: 0, speed: 4.5, jumpForce: 11.5, grounded: false };
const gravity = 0.5;
const camera = { x: 0, y: 0 };
let totalDeaths = 0;
let isGameRunning = false;

// Параметры босса Ледяного Короля
let boss = { 
    x: 400, y: 100, w: 30, h: 50, 
    hp: 5, maxHp: 5, 
    shootTimer: 0, 
    angleMove: 0, 
    speedY: 1.5, speedX: 2.2, dirX: 1, dirY: 1 
};

// Механизм снежков (60 кадров = 1 секунда)
let bossSnowball = { x: 0, y: 0, w: 16, h: 16, active: false, framesCounter: 0 };
let playerProjectiles = []; 

let currentEnemies = [];
let currentShooters = [];
let enemyProjectiles = [];

// Сетка уровней (1-10) — Исправлены пустые свойства объектов
const levels = {
    1: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 420, y: groundY - 40, w: 150, h: 40}, {x: 650, y: groundY, w: 300, h: 40}], spikes: [{x: 340, y: groundY, count: 2}], enemies: [{x: 690, y: groundY, w: 20, h: 40, speed: 1.5, minX: 660, maxX: 800}], shooters: [], goal: {x: 850, y: groundY - 50, w: 30, h: 50} },
    2: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY - 50, w: 120, h: 15}, {x: 420, y: groundY, w: 400, h: 40}], spikes: [{x: 460, y: groundY, count: 3}], enemies: [{x: 500, y: groundY, w: 20, h: 40, speed: 2, minX: 430, maxX: 620}], shooters: [], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    3: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 320, y: groundY - 60, w: 100, h: 15}, {x: 470, y: groundY - 120, w: 120, h: 15}, {x: 640, y: groundY, w: 250, h: 40}], spikes: [{x: 340, y: groundY - 60, count: 1}, {x: 670, y: groundY, count: 3}], enemies: [{x: 700, y: groundY, w: 20, h: 40, speed: 1.8, minX: 650, maxX: 820}], shooters: [], goal: {x: 820, y: groundY - 50, w: 30, h: 50} },
    4: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 220, y: groundY - 50, w: 130, h: 15}, {x: 420, y: groundY - 100, w: 130, h: 15}, {x: 600, y: groundY - 40, w: 100, h: 15}, {x: 750, y: groundY, w: 200, h: 40}], spikes: [{x: 250, y: groundY - 50, count: 2}, {x: 450, y: groundY - 100, count: 2}], enemies: [], shooters: [], goal: {x: 880, y: groundY - 50, w: 30, h: 50} },
    5: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 360, y: groundY - 60, w: 140, h: 15}, {x: 550, y: groundY, w: 300, h: 40}], spikes: [{x: 120, y: groundY, count: 5}], enemies: [{x: 580, y: groundY, w: 20, h: 40, speed: 2.5, minX: 560, maxX: 750}], shooters: [], goal: {x: 780, y: groundY - 50, w: 30, h: 50} },
    6: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 40, w: 100, h: 15}, {x: 330, y: groundY - 80, w: 100, h: 15}, {x: 460, y: groundY - 120, w: 100, h: 15}, {x: 600, y: groundY, w: 250, h: 40}], spikes: [{x: 220, y: groundY - 40, count: 1}, {x: 620, y: groundY, count: 3}], enemies: [{x: 660, y: groundY, w: 20, h: 40, speed: 1.6, minX: 610, maxX: 780}], shooters: [], goal: {x: 780, y: groundY - 50, w: 30, h: 50} },
    7: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY, w: 200, h: 40}, {x: 500, y: groundY, w: 300, h: 40}], spikes: [{x: 210, y: groundY, count: 2}, {x: 460, y: groundY, count: 2}], enemies: [{x: 520, y: groundY, w: 20, h: 40, speed: 2, minX: 510, maxX: 680}, {x: 700, y: groundY, w: 20, h: 40, speed: -2, minX: 600, maxX: 760}], shooters: [], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    8: { platforms: [{x: 0, y: groundY, w: 100, h: 40}, {x: 160, y: groundY - 50, w: 100, h: 15}, {x: 320, y: groundY - 100, w: 100, h: 15}, {x: 480, y: groundY - 50, w: 100, h: 15}, {x: 640, y: groundY, w: 200, h: 40}], spikes: [{x: 340, y: groundY - 100, count: 2}], enemies: [{x: 660, y: groundY, w: 20, h: 40, speed: 2.4, minX: 650, maxX: 780}], shooters: [], goal: {x: 780, y: groundY - 50, w: 30, h: 50} },
    9: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 320, y: groundY - 60, w: 150, h: 15}, {x: 540, y: groundY, w: 300, h: 40}], spikes: [{x: 340, y: groundY - 60, count: 2}, {x: 560, y: groundY, count: 4}], enemies: [{x: 620, y: groundY, w: 20, h: 40, speed: 2.6, minX: 550, maxX: 750}], shooters: [], goal: {x: 780, y: groundY - 50, w: 30, h: 50} },
    10: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY - 50, w: 120, h: 15}, {x: 420, y: groundY - 100, w: 120, h: 15}, {x: 580, y: groundY, w: 250, h: 40}], spikes: [{x: 270, y: groundY - 50, count: 2}], enemies: [{x: 620, y: groundY, w: 20, h: 40, speed: 1.5, minX: 590, maxX: 760}], shooters: [], goal: {x: 780, y: groundY - 50, w: 30, h: 50} },
    // ЛЕДЯНОЙ ЗАМОК (Уровни 11-20) — Исправлены пустые свойства объектов, чтобы логика не висла!
    11: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 380, y: groundY, w: 500, h: 40}], spikes: [{x: 420, y: groundY, count: 2}], lavas: [{x: 200, y: groundY + 10, w: 180, h: 30}], enemies: [{x: 500, y: groundY, w: 20, h: 40, speed: 2.2, minX: 390, maxX: 650}], shooters: [{x: 750, y: groundY, w: 20, h: 40, timer: 0}], goal: {x: 830, y: groundY - 50, w: 30, h: 50} },
    12: { platforms: [{x: 0, y: groundY, w: 120, h: 40}, {x: 220, y: groundY - 55, w: 100, h: 15}, {x: 400, y: groundY - 110, w: 100, h: 15}, {x: 580, y: groundY, w: 300, h: 40}], spikes: [{x: 240, y: groundY - 55, count: 2}], lavas: [{x: 120, y: groundY + 10, w: 460, h: 30}], enemies: [], shooters: [{x: 620, y: groundY, w: 20, h: 40, timer: 40}], goal: {x: 820, y: groundY - 50, w: 30, h: 50} },
    13: { platforms: [{x: 0, y: groundY, w: 180, h: 40}, {x: 240, y: groundY - 60, w: 110, h: 15}, {x: 420, y: groundY, w: 400, h: 40}], spikes: [{x: 260, y: groundY - 60, count: 2}, {x: 460, y: groundY, count: 3}], lavas: [{x: 180, y: groundY + 10, w: 240, h: 30}], enemies: [{x: 550, y: groundY, w: 20, h: 40, speed: 2.6, minX: 430, maxX: 680}], shooters: [{x: 720, y: groundY, w: 20, h: 40, timer: 10}], goal: {x: 780, y: groundY - 50, w: 30, h: 50} },
    14: { platforms: [{x: 0, y: groundY, w: 120, h: 40}, {x: 200, y: groundY - 50, w: 100, h: 15}, {x: 360, y: groundY - 100, w: 100, h: 15}, {x: 520, y: groundY - 50, w: 100, h: 15}, {x: 680, y: groundY, w: 250, h: 40}], spikes: [{x: 220, y: groundY - 50, count: 2}, {x: 380, y: groundY - 100, count: 2}, {x: 540, y: groundY - 50, count: 2}], lavas: [{x: 120, y: groundY + 10, w: 560, h: 30}], enemies: [], shooters: [], goal: {x: 850, y: groundY - 50, w: 30, h: 50} },
    15: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 440, y: groundY - 40, w: 120, h: 15}, {x: 640, y: groundY, w: 300, h: 40}], spikes: [{x: 100, y: groundY, count: 3}, {x: 680, y: groundY, count: 4}], lavas: [{x: 250, y: groundY + 10, w: 390, h: 30}], enemies: [{x: 740, y: groundY, w: 20, h: 40, speed: 3, minX: 650, maxX: 880}], shooters: [{x: 480, y: groundY - 40, w: 20, h: 40, timer: 0}], goal: {x: 880, y: groundY - 50, w: 30, h: 50} },
    16: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 220, y: groundY - 50, w: 120, h: 15}, {x: 390, y: groundY - 100, w: 120, h: 15}, {x: 580, y: groundY, w: 300, h: 40}], spikes: [{x: 240, y: groundY - 50, count: 2}, {x: 410, y: groundY - 100, count: 2}], lavas: [{x: 150, y: groundY + 10, w: 430, h: 30}], enemies: [], shooters: [{x: 620, y: groundY, w: 20, h: 40, timer: 10}, {x: 720, y: groundY, w: 20, h: 40, timer: 60}], goal: {x: 820, y: groundY - 50, w: 30, h: 50} },
    17: { platforms: [{x: 0, y: groundY, w: 180, h: 40}, {x: 240, y: groundY, w: 160, h: 40}, {x: 520, y: groundY, w: 350, h: 40}], spikes: [{x: 250, y: groundY, count: 4}, {x: 550, y: groundY, count: 3}], lavas: [{x: 400, y: groundY + 10, w: 120, h: 30}], enemies: [{x: 640, y: groundY, w: 20, h: 40, speed: 2.5, minX: 530, maxX: 720}], shooters: [{x: 780, y: groundY, w: 20, h: 40, timer: 0}], goal: {x: 820, y: groundY - 50, w: 30, h: 50} },
    18: { platforms: [{x: 0, y: groundY, w: 100, h: 40}, {x: 160, y: groundY - 60, w: 100, h: 15}, {x: 320, y: groundY - 120, w: 100, h: 15}, {x: 480, y: groundY - 60, w: 100, h: 15}, {x: 640, y: groundY, w: 250, h: 40}], spikes: [{x: 180, y: groundY - 60, count: 2}, {x: 340, y: groundY - 120, count: 2}], lavas: [{x: 100, y: groundY + 10, w: 540, h: 30}], enemies: [{x: 680, y: groundY, w: 20, h: 40, speed: 2.8, minX: 650, maxX: 820}], shooters: [], goal: {x: 840, y: groundY - 50, w: 30, h: 50} },
    19: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 220, y: groundY - 50, w: 120, h: 15}, {x: 400, y: groundY - 100, w: 120, h: 15}, {x: 580, y: groundY - 50, w: 120, h: 15}, {x: 740, y: groundY, w: 200, h: 40}], spikes: [{x: 240, y: groundY - 50, count: 2}, {x: 420, y: groundY - 100, count: 2}, {x: 600, y: groundY - 50, count: 2}], lavas: [{x: 150, y: groundY + 10, w: 590, h: 30}], enemies: [{x: 760, y: groundY, w: 20, h: 40, speed: 3.2, minX: 745, maxX: 900}], shooters: [], goal: {x: 890, y: groundY - 50, w: 30, h: 50} },
    
    20: { 
        platforms: [{x: 0, y: groundY, w: 900, h: 40}, {x: 220, y: groundY - 60, w: 150, h: 15}, {x: 520, y: groundY - 60, w: 150, h: 15}], 
        spikes: [{x: 120, y: groundY, count: 4}, {x: 410, y: groundY, count: 5}], 
        enemies: [{x: 280, y: groundY, w: 20, h: 40, speed: 2.5, minX: 20, maxX: 390}, {x: 720, y: groundY, w: 20, h: 40, speed: -2.5, minX: 460, maxX: 880}], 
        shooters: [], goal: null 
    }
};

const startBtn = document.getElementById("startBtn");
const loadBtn = document.getElementById("loadBtn");
if (loadBtn) loadBtn.style.display = "none"; 

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

function playAudio(audio) { if(audio) audio.play().catch(()=>{}); }
function stopAudio(audio) { if(audio) { audio.pause(); audio.currentTime = 0; } }

startBtn.addEventListener("click", () => { mainMenu.style.display = "none"; introScreen.style.display = "flex"; });
introNextBtn.addEventListener("click", () => { introScreen.style.display = "none"; totalDeaths = 0; initGame(1); });
function initGame(level) {
    currentLevel = level;
    resizeCanvas();
    
    player.x = 50; player.y = groundY - 120; player.velX = 0; player.velY = 0; player.grounded = false;
    
    let lvD = levels[currentLevel];
    if(lvD.platforms) lvD.platforms.forEach(p => { if(p.h === 40) p.y = groundY; });
    if(lvD.enemies) lvD.enemies.forEach(e => e.y = groundY);
    if(lvD.shooters) lvD.shooters.forEach(s => s.y = groundY);

    currentEnemies = JSON.parse(JSON.stringify(lvD.enemies || []));
    currentShooters = JSON.parse(JSON.stringify(lvD.shooters || []));
    enemyProjectiles = [];
    playerProjectiles = [];
    
    bossSnowball.active = false;
    bossSnowball.framesCounter = 0;
    
    bossTimerContainer.style.display = "none";

    if(currentLevel === 20) {
        boss.hp = 5;
        boss.x = 400; boss.y = 100; boss.angleMove = 0;
        bossTimerContainer.style.display = "block"; 
        // ИСПРАВЛЕНО: Обновляем только числовое значение внутри тега bossTimer
        bossTimer.innerHTML = `<span style="color:#ff3333;">${boss.hp}</span>`;
        stopAudio(bgMusic); playAudio(bossMusic);
    } else { 
        stopAudio(bossMusic); playAudio(bgMusic); 
    }

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

    let isCastle = currentLevel > 10;
    let accel = isCastle ? 0.12 : 0.25;      
    let friction = isCastle ? 0.96 : 0.88;   

    if (keys.left) {
        if (player.velX > -player.speed) player.velX -= accel;
    } else if (keys.right) {
        if (player.velX < player.speed) player.velX += accel;
    } else {
        player.velX *= friction;
        if (Math.abs(player.velX) < 0.1) player.velX = 0;
    }

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

    if(player.x < 0) player.x = 0; if(player.y > canvas.height + 100) playerDeath();
    camera.x = player.x - canvas.width / 4; if(camera.x < 0) camera.x = 0;
    // Движение и логика врагов
    currentEnemies.forEach(enemy => {
        enemy.x += enemy.speed; if(enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) enemy.speed = -enemy.speed;
        let mHitbox = { x: enemy.x, y: groundY - enemy.h, w: enemy.w, h: enemy.h };
        if(checkCollision(player, mHitbox)) playerDeath();
    });

    currentShooters.forEach(sh => {
        sh.timer++;
        if(sh.timer >= 120) { enemyProjectiles.push({ x: sh.x, y: groundY - 25, w: 10, h: 6, speedX: -4.5, speedY: 0 }); sh.timer = 0; }
        if(checkCollision(player, {x: sh.x, y: groundY - 40, w: sh.w, h: 40})) playerDeath();
    });

    if(lvl && lvl.lavas) lvl.lavas.forEach(lava => { if(checkCollision(player, {x: lava.x, y: groundY + 10, w: lava.w, h: lava.h})) playerDeath(); });
    
    if(lvl && lvl.spikes) {
        lvl.spikes.forEach(s => {
            if (currentLevel === 20 && s.x >= 300 && s.x <= 500) return; 
            for(let i=0; i<s.count; i++) {
                let sp = { x: s.x + (i * 20), y: groundY - 20, w: 20, h: 20 }; 
                if(player.x < sp.x + sp.w && player.x + player.width > sp.x && player.y < sp.y + sp.h && player.y + player.height > sp.y) playerDeath();
            }
        });
    }

    if(currentLevel === 20) {
        boss.angleMove += 0.03;
        boss.x += boss.speedX * boss.dirX;
        boss.y = 80 + Math.sin(boss.angleMove) * 40;
        
        if(boss.x < 150) boss.dirX = 1;
        if(boss.x > 650) boss.dirX = -1;

        boss.shootTimer++;
        if(boss.shootTimer > 55) {
            let targetX = player.x + player.width/2; let targetY = player.y + player.height/2;
            let currentX = boss.x + boss.w/2; let currentY = boss.y + boss.h/2;
            let angle = Math.atan2(targetY - currentY, targetX - currentX);
            enemyProjectiles.push({ x: currentX, y: currentY, w: 14, h: 14, speedX: Math.cos(angle) * 5.5, speedY: Math.sin(angle) * 5.5 });
            boss.shootTimer = 0;
        }
        if(checkCollision(player, {x: boss.x, y: boss.y, w: boss.w, h: boss.h})) playerDeath();

        if(!bossSnowball.active) {
            bossSnowball.framesCounter++;
            if(bossSnowball.framesCounter >= 300) { 
                bossSnowball.x = 220 + Math.random() * 400;
                bossSnowball.y = groundY - 25;
                bossSnowball.active = true;
                bossSnowball.framesCounter = 0;
            }
        } else {
            if(checkCollision(player, {x: bossSnowball.x, y: bossSnowball.y, w: bossSnowball.w, h: bossSnowball.h})) {
                bossSnowball.active = false;
                bossSnowball.framesCounter = 0; 
                playerProjectiles.push({ x: player.x, y: player.y, w: 15, h: 15 });
            }
        }

        for (let pIdx = playerProjectiles.length - 1; pIdx >= 0; pIdx--) {
            let pProj = playerProjectiles[pIdx];
            let bX = boss.x + boss.w / 2; 
            let bY = boss.y + boss.h / 2;
            let pAngle = Math.atan2(bY - pProj.y, bX - pProj.x);
            
            pProj.x += Math.cos(pAngle) * 8.5; 
            pProj.y += Math.sin(pAngle) * 8.5;

            let dist = Math.hypot(bX - (pProj.x + 7), bY - (pProj.y + 7));

            if(dist < 22 || checkCollision(pProj, {x: boss.x, y: boss.y, w: boss.w, h: boss.h})) {
                boss.hp--;
                // ИСПРАВЛЕНО: Обновляем только числовое значение внутри тега bossTimer
                bossTimer.innerHTML = `<span style="color:#ff3333;">${boss.hp}</span>`;
                playerProjectiles.splice(pIdx, 1);
                if(boss.hp <= 0) { endGame(); return; }
                break;
            }
            if(pProj.x < 0 || pProj.x > 1000 || pProj.y < 0 || pProj.y > canvas.height) playerProjectiles.splice(pIdx, 1);
        }
    }

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        let proj = enemyProjectiles[i]; proj.x += proj.speedX; proj.y += (proj.speedY || 0);
        if(checkCollision(player, {x: proj.x, y: proj.y, w: proj.w, h: proj.h})) { playerDeath(); break; }
        if(proj.x < camera.x - 50 || proj.x > camera.x + canvas.width + 50) enemyProjectiles.splice(i, 1);
    }

    if(lvl && lvl.goal && currentLevel < 20) {
        let gBox = { x: lvl.goal.x, y: lvl.goal.y, w: lvl.goal.w, h: lvl.goal.h };
        if(checkCollision(player, gBox)) initGame(currentLevel + 1);
    }
    render(); requestAnimationFrame(update);
}

function drawStickman(x, y, color, isIceKing = false, isSnowman = false) {
    let cx = x + 10; let cy = y + 10;
    if (isSnowman) {
        ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#99ccff"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy + 24, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy + 10, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy - 1, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ff6600"; ctx.beginPath(); ctx.moveTo(cx, cy - 1); ctx.lineTo(cx - 8, cy + 1); ctx.lineTo(cx, cy + 2); ctx.fill();
        return;
    }
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if(isIceKing) {
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(cx - 11, cy + 2);
        ctx.lineTo(cx - 13, cy - 8); ctx.lineTo(cx - 5, cy - 3); ctx.lineTo(cx, cy - 19); ctx.lineTo(cx + 5, cy - 3); ctx.lineTo(cx + 13, cy - 8);
        ctx.lineTo(cx + 11, cy + 2); ctx.fill();
        ctx.strokeStyle = "#00bfff"; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 5); ctx.lineTo(cx - 4, cy + 2); ctx.moveTo(cx + 6, cy - 5); ctx.lineTo(cx + 4, cy + 2); ctx.stroke();
    }
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx, cy + 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 10, cy + 12); ctx.lineTo(cx + 10, cy + 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 24); ctx.lineTo(cx - 8, cy + 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 24); ctx.lineTo(cx + 8, cy + 38); ctx.stroke();
}
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let isCastle = currentLevel > 10;
    
    ctx.fillStyle = isCastle ? "#1a365d" : "#0d1b2a"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save(); ctx.translate(-camera.x, -camera.y);
    const lvl = levels[currentLevel];

    if (!isCastle) {
        ctx.fillStyle = "#1b263b";
        ctx.beginPath(); ctx.moveTo(100, groundY); ctx.lineTo(250, groundY - 140); ctx.lineTo(400, groundY); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(215, groundY - 107); ctx.lineTo(250, groundY - 140); ctx.lineTo(285, groundY - 107); ctx.fill();
        ctx.fillStyle = "#1b263b";
        ctx.beginPath(); ctx.moveTo(450, groundY); ctx.lineTo(600, groundY - 160); ctx.lineTo(750, groundY); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(560, groundY - 117); ctx.lineTo(600, groundY - 160); ctx.fill();
    } else {
        ctx.fillStyle = "#2a4365";
        ctx.fillRect(150, 40, 60, 120); ctx.fillRect(450, 40, 60, 120);
        ctx.fillStyle = "#63b3ed"; 
        ctx.fillRect(178, 40, 4, 120); ctx.fillRect(478, 40, 4, 120);
        ctx.fillStyle = "#90cdf4";
        for(let i = 0; i < 900; i += 80) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 15, 35); ctx.lineTo(i + 30, 0); ctx.fill();
        }
    }

    if(lvl && lvl.platforms) {
        lvl.platforms.forEach(p => {
            ctx.fillStyle = isCastle ? "#63b3ed" : "#005f73"; 
            ctx.fillRect(p.x, p.y, p.w, p.h); 
            ctx.fillStyle = "#ffffff"; ctx.fillRect(p.x, p.y, p.w, 4); 
        });
    }

    if (lvl && lvl.lavas) {
        ctx.fillStyle = "#2b6cb0"; lvl.lavas.forEach(lava => {
            ctx.fillRect(lava.x, groundY, lava.w, lava.h); ctx.fillStyle = "#90cdf4";
            for (let i = 5; i < lava.w; i += 30) { ctx.fillRect(lava.x + i, groundY + 2, 12, 5); }
        });
    }

    if (lvl && lvl.spikes) {
        let currentSpikes = lvl.spikes;
        if (currentLevel === 20) {
            currentSpikes = lvl.spikes.filter(s => s.x < 300 || s.x > 500);
        }
        currentSpikes.forEach(s => {
            for (let i = 0; i < s.count; i++) {
                let sx = s.x + (i * 20); ctx.beginPath(); ctx.moveTo(sx, groundY); ctx.lineTo(sx + 10, groundY - 20); ctx.lineTo(sx + 20, groundY); ctx.fill();
                ctx.strokeStyle = "#63b3ed"; ctx.lineWidth = 1; ctx.stroke();
            }
        });
    }

    if(currentLevel === 20 && bossSnowball.active) {
        ctx.fillStyle = "#ffffff"; ctx.beginPath();
        ctx.arc(bossSnowball.x + 8, bossSnowball.y + 8, 10, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#00ffff"; ctx.lineWidth = 2; ctx.stroke();
    }

    ctx.fillStyle = "#ffffff";
    playerProjectiles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x + 7, p.y + 7, 7, 0, Math.PI*2); ctx.fill();
    });

    currentEnemies.forEach(e => drawStickman(e.x, groundY - e.h, "#ffffff", false, true));
    currentShooters.forEach(sh => drawStickman(sh.x, groundY - 40, "#90cdf4", false, false));

    ctx.fillStyle = "#e2e8f0"; enemyProjectiles.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h); ctx.strokeStyle = "#63b3ed"; ctx.strokeRect(p.x, p.y, p.w, p.h);
    });

    if (currentLevel === 20) {
        drawStickman(boss.x, boss.y, "#63b3ed", true, false);
    }

    if (lvl && lvl.goal && currentLevel < 20) { ctx.fillStyle = "#4fd1c5"; ctx.fillRect(lvl.goal.x, groundY - 50, lvl.goal.w, lvl.goal.h); }
    drawStickman(player.x, player.y, "#ff3333", false, false);
    ctx.restore();
}

function endGame() {
    isGameRunning = false; stopAudio(bgMusic); stopAudio(bossMusic);
    canvas.style.display = "none"; ui.style.display = "none"; document.getElementById("gameControls").style.display = "none";
    resDeaths.textContent = totalDeaths;
    resultsContainer.style.display = "block";
    outroScreen.style.display = "flex";
}

outroCloseBtn.addEventListener("click", () => { outroScreen.style.display = "none"; mainMenu.style.display = "flex"; currentLevel = 1; totalDeaths = 0; });
window.addEventListener("resize", resizeCanvas);
