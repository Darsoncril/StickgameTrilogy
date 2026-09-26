// ==========================================
// ЧАСТЬ 1: НАСТРОЙКИ, ПЕРЕМЕННЫЕ И ИНИЦИАЛИЗАЦИЯ
// ==========================================
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
const camera = { x: 0, y: 0 };
let totalDeaths = 0;
let isGameRunning = false;

// Картинка босса
const bossImg = new Image();
bossImg.src = "image_oCHMXU.png"; 

// Параметры босса
let boss = {
    x: 340, y: groundY - 1220, w: 120, h: 75, 
    active: false,
    shootTimer: 0
};

let bossButtons = [];
let risingLaserY = 1500; 

let currentEnemies = [];
let currentShooters = [];
let currentLasers = [];
let enemyProjectiles = [];

const bgMusic = document.getElementById("bgMusic");
const bossMusic = document.getElementById("bossMusic");

function playAudio(audio) { if(audio) audio.play().catch(()=>{}); }
function stopAudio(audio) { if(audio) { audio.pause(); audio.currentTime = 0; } }

// ==========================================
// ЧАСТЬ 2: СЕТКА ИГРОВЫХ УРОВНЕЙ 1-13 (НА ЛУНЕ)
// ==========================================
const levels = {
    1: { platforms: [{x: 0, y: groundY, w: 400, h: 40}, {x: 520, y: groundY - 50, w: 180, h: 40}, {x: 800, y: groundY, w: 400, h: 40}], spikes: [{x: 450, y: groundY, count: 3}], enemies: [{x: 850, y: groundY, w: 20, h: 40, speed: 2.2, minX: 810, maxX: 1050}], shooters: [], lasers: [], goal: {x: 1100, y: groundY - 50, w: 30, h: 50} },
    2: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 380, y: groundY - 60, w: 150, h: 15}, {x: 600, y: groundY, w: 500, h: 40}], spikes: [{x: 650, y: groundY, count: 3}], enemies: [], shooters: [], lasers: [{x: 340, y: groundY - 150, w: 15, h: 110, cycle: 120, activeTime: 60, timer: 0}], goal: {x: 950, y: groundY - 50, w: 30, h: 50} },
    3: { platforms: [{x: 0, y: groundY, w: 350, h: 40}, {x: 420, y: groundY - 60, w: 120, h: 15}, {x: 600, y: groundY - 120, w: 150, h: 15}, {x: 820, y: groundY, w: 400, h: 40}], spikes: [{x: 860, y: groundY, count: 4}], enemies: [{x: 900, y: groundY, w: 20, h: 40, speed: 2.5, minX: 830, maxX: 1100}], shooters: [], lasers: [], goal: {x: 1120, y: groundY - 50, w: 30, h: 50} },
    4: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 280, y: groundY - 50, w: 150, h: 15}, {x: 500, y: groundY - 100, w: 150, h: 15}, {x: 720, y: groundY - 40, w: 120, h: 15}, {x: 900, y: groundY, w: 300, h: 40}], spikes: [{x: 320, y: groundY - 50, count: 2}], enemies: [], shooters: [], lasers: [{x: 570, y: groundY - 220, w: 15, h: 120, cycle: 100, activeTime: 50, timer: 20}], goal: {x: 1050, y: groundY - 50, w: 30, h: 50} },
    5: { platforms: [{x: 0, y: groundY, w: 400, h: 40}, {x: 480, y: groundY - 60, w: 180, h: 15}, {x: 720, y: groundY, w: 400, h: 40}], spikes: [{x: 150, y: groundY, count: 5}], enemies: [{x: 780, y: groundY, w: 20, h: 40, speed: 2.8, minX: 740, maxX: 1000}], shooters: [], lasers: [], goal: {x: 1000, y: groundY - 50, w: 30, h: 50} },
    6: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 320, y: groundY - 40, w: 120, h: 15}, {x: 480, y: groundY - 80, w: 120, h: 15}, {x: 640, y: groundY - 120, w: 120, h: 15}, {x: 820, y: groundY, w: 350, h: 40}], spikes: [{x: 860, y: groundY, count: 3}], enemies: [], shooters: [{x: 950, y: groundY, w: 20, h: 40, timer: 0}], lasers: [], goal: {x: 1080, y: groundY - 50, w: 30, h: 50} },
    7: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 380, y: groundY, w: 250, h: 40}, {x: 700, y: groundY, w: 400, h: 40}], spikes: [{x: 340, y: groundY, count: 2}], enemies: [{x: 750, y: groundY, w: 20, h: 40, speed: 2.4, minX: 720, maxX: 950}], shooters: [], lasers: [{x: 480, y: groundY - 100, w: 20, h: 100, cycle: 140, activeTime: 70, timer: 10}], goal: {x: 1000, y: groundY - 50, w: 30, h: 50} },
    8: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 280, y: groundY - 50, w: 120, h: 15}, {x: 480, y: groundY - 100, w: 120, h: 15}, {x: 680, y: groundY - 50, w: 120, h: 15}, {x: 880, y: groundY, w: 300, h: 40}], spikes: [{x: 520, y: groundY - 100, count: 2}], enemies: [], shooters: [], lasers: [{x: 320, y: groundY - 150, w: 10, h: 110, cycle: 120, activeTime: 60, timer: 0}, {x: 720, y: groundY - 150, w: 10, h: 110, cycle: 120, activeTime: 60, timer: 60}], goal: {x: 1050, y: groundY - 50, w: 30, h: 50} },
    9: { platforms: [{x: 0, y: groundY, w: 350, h: 40}, {x: 440, y: groundY - 60, w: 200, h: 15}, {x: 720, y: groundY, w: 400, h: 40}], spikes: [{x: 760, y: groundY, count: 4}], enemies: [{x: 820, y: groundY, w: 20, h: 40, speed: 2.7, minX: 740, maxX: 980}], shooters: [], lasers: [], goal: {x: 1020, y: groundY - 50, w: 30, h: 50} },
    10: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 380, y: groundY - 50, w: 140, h: 15}, {x: 580, y: groundY - 100, w: 140, h: 15}, {x: 800, y: groundY, w: 350, h: 40}], spikes: [{x: 410, y: groundY - 50, count: 2}], enemies: [], shooters: [], lasers: [{x: 640, y: groundY - 200, w: 15, h: 100, cycle: 80, activeTime: 40, timer: 0}], goal: {x: 1020, y: groundY - 50, w: 30, h: 50} },
    11: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 450, y: groundY - 40, w: 150, h: 15}, {x: 700, y: groundY, w: 400, h: 40}], spikes: [{x: 750, y: groundY, count: 3}], enemies: [{x: 800, y: groundY, w: 20, h: 40, speed: 1.4, minX: 710, maxX: 950}], shooters: [], lasers: [{x: 360, y: groundY - 120, w: 40, h: 15, cycle: 100, activeTime: 50, timer: 0}], goal: {x: 1000, y: groundY - 50, w: 30, h: 50} },
    12: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 300, y: groundY - 60, w: 150, h: 15}, {x: 520, y: groundY - 120, w: 120, h: 15}, {x: 740, y: groundY, w: 350, h: 40}], spikes: [], enemies: [], shooters: [{x: 820, y: groundY, w: 20, h: 40, timer: 30}], lasers: [{x: 440, y: groundY - 180, w: 15, h: 120, cycle: 120, activeTime: 60, timer: 10}], goal: {x: 980, y: groundY - 50, w: 30, h: 50} },
    13: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 400, y: groundY - 50, w: 180, h: 15}, {x: 680, y: groundY, w: 400, h: 40}], spikes: [{x: 440, y: groundY - 50, count: 2}], enemies: [{x: 750, y: groundY, w: 20, h: 40, speed: 2.8, minX: 690, maxX: 920}], shooters: [], lasers: [{x: 610, y: groundY - 130, w: 15, h: 130, cycle: 110, activeTime: 50, timer: 0}], goal: {x: 980, y: groundY - 50, w: 30, h: 50} },

// ==========================================
// ЧАСТЬ 3: УРОВНИ БАЗЫ, БОСС 20 И СТАРТ ИГРЫ
// ==========================================
    14: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 340, y: groundY - 50, w: 120, h: 15}, {x: 520, y: groundY - 100, w: 120, h: 15}, {x: 700, y: groundY - 50, w: 120, h: 15}, {x: 880, y: groundY, w: 400, h: 40}], spikes: [{x: 560, y: groundY - 100, count: 1}], enemies: [], shooters: [], lasers: [{x: 480, y: groundY - 200, w: 15, h: 200, cycle: 140, activeTime: 70, timer: 0}, {x: 660, y: groundY - 200, w: 15, h: 200, cycle: 140, activeTime: 70, timer: 70}], goal: {x: 1150, y: groundY - 50, w: 30, h: 50} },
    15: { platforms: [{x: 0, y: groundY, w: 350, h: 40}, {x: 480, y: groundY - 50, w: 180, h: 15}, {x: 750, y: groundY, w: 450, h: 40}], spikes: [{x: 150, y: groundY, count: 3}], enemies: [{x: 820, y: groundY, w: 20, h: 40, speed: 3.2, minX: 760, maxX: 1050}], shooters: [], lasers: [{x: 680, y: groundY - 150, w: 20, h: 150, cycle: 90, activeTime: 45, timer: 0}], goal: {x: 1100, y: groundY - 50, w: 30, h: 50} },
    16: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 340, y: groundY - 60, w: 150, h: 15}, {x: 560, y: groundY - 120, w: 150, h: 15}, {x: 780, y: groundY, w: 400, h: 40}], spikes: [{x: 360, y: groundY - 60, count: 2}], enemies: [], shooters: [{x: 850, y: groundY, w: 20, h: 40, timer: 0}], lasers: [{x: 510, y: groundY - 200, w: 15, h: 200, cycle: 100, activeTime: 50, timer: 25}], goal: {x: 1050, y: groundY - 50, w: 30, h: 50} },
    17: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 380, y: groundY - 40, w: 160, h: 15}, {x: 620, y: groundY - 90, w: 160, h: 15}, {x: 850, y: groundY, w: 400, h: 40}], spikes: [{x: 890, y: groundY, count: 4}], enemies: [{x: 940, y: groundY, w: 20, h: 40, speed: 3.5, minX: 860, maxX: 1100}], shooters: [], lasers: [{x: 560, y: groundY - 150, w: 25, h: 150, cycle: 120, activeTime: 60, timer: 0}], goal: {x: 1150, y: groundY - 50, w: 30, h: 50} },
    18: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 280, y: groundY - 60, w: 150, h: 15}, {x: 480, y: groundY - 120, w: 150, h: 15}, {x: 680, y: groundY - 60, w: 150, h: 15}, {x: 880, y: groundY, w: 350, h: 40}], spikes: [{x: 320, y: groundY - 60, count: 2}], enemies: [], shooters: [{x: 950, y: groundY, w: 20, h: 40, timer: 45}], lasers: [{x: 650, y: groundY - 200, w: 15, h: 200, cycle: 100, activeTime: 50, timer: 0}], goal: {x: 1100, y: groundY - 50, w: 30, h: 50} },
    19: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 340, y: groundY - 50, w: 180, h: 15}, {x: 580, y: groundY - 100, w: 180, h: 15}, {x: 820, y: groundY, w: 400, h: 40}], spikes: [{x: 620, y: groundY - 100, count: 2}], enemies: [{x: 880, y: groundY, w: 20, h: 40, speed: 3.8, minX: 830, maxX: 1100}], shooters: [], lasers: [{x: 300, y: groundY - 140, w: 20, h: 140, cycle: 80, activeTime: 40, timer: 0}, {x: 540, y: groundY - 140, w: 20, h: 140, cycle: 80, activeTime: 40, timer: 40}], goal: {x: 1120, y: groundY - 50, w: 30, h: 50} },
    
    20: { 
        platforms: [
            {x: 0, y: groundY, w: 800, h: 40},
            {x: 100, y: groundY - 110, w: 150, h: 15},
            {x: 350, y: groundY - 230, w: 150, h: 15},
            {x: 560, y: groundY - 350, w: 240, h: 15},
            {x: 320, y: groundY - 480, w: 150, h: 15},
            {x: 88, y: groundY - 600, w: 160, h: 15},
            {x: 280, y: groundY - 720, w: 200, h: 15},
            {x: 560, y: groundY - 840, w: 160, h: 15},
            {x: 300, y: groundY - 930, w: 150, h: 15},  
            {x: 80, y: groundY - 1020, w: 160, h: 15},  
            {x: 40, y: groundY - 1100, w: 720, h: 20},
            {x: 100, y: groundY - 1230, w: 130, h: 15},
            {x: 570, y: groundY - 1230, w: 130, h: 15},
            {x: 320, y: groundY - 1340, w: 160, h: 15},
            {x: 320, y: groundY - 1420, w: 140, h: 15},
            {x: 120, y: groundY - 1420, w: 140, h: 15},
            {x: 540, y: groundY - 1420, w: 140, h: 15}
        ], 
        spikes: [],
        // ИСПРАВЛЕНО: Вернул врагов на промежуточные платформы и добавил на верхние платформы с кнопками
        enemies: [
            {x: 100, y: groundY, w: 20, h: 40, speed: 2.2, minX: 50, maxX: 750},
            {x: 360, y: groundY - 230, w: 20, h: 40, speed: 2.0, minX: 350, maxX: 490},
            {x: 100, y: groundY - 600, w: 20, h: 40, speed: 1.8, minX: 90, maxX: 230},
            {x: 580, y: groundY - 840, w: 20, h: 40, speed: 2.3, minX: 560, maxX: 700},
            {x: 100, y: groundY - 1100, w: 20, h: 40, speed: 3.0, minX: 50, maxX: 320},
            {x: 500, y: groundY - 1100, w: 20, h: 40, speed: -3.0, minX: 400, maxX: 700},
            // Враги на кнопках (самый верх)
            {x: 330, y: groundY - 1340, w: 20, h: 40, speed: 2.0, minX: 320, maxX: 460},
            {x: 130, y: groundY - 1420, w: 20, h: 40, speed: 1.5, minX: 120, maxX: 240},
            {x: 550, y: groundY - 1420, w: 20, h: 40, speed: 1.5, minX: 540, maxX: 660}
        ], 
        shooters: [], 
        lasers: [], goal: null 
    }
};

const startBtn = document.getElementById("startBtn");
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
introNextBtn.addEventListener("click", () => { introScreen.style.display = "none"; totalDeaths = 0; initGame(1); });

function initGame(level) {
    currentLevel = level;
    resizeCanvas();
    
    player.x = 50; 
    player.y = (currentLevel === 20) ? (groundY - 60) : (groundY - 120); 
    player.velX = 0; 
    player.velY = 0; 
    player.grounded = false;
    
    let lvD = levels[currentLevel];
    if(lvD.platforms) lvD.platforms.forEach(p => { if(p.h === 40 && currentLevel !== 20) p.y = groundY; });
    if(lvD.enemies) lvD.enemies.forEach(e => { if(currentLevel !== 20) e.y = groundY; });
    if(lvD.shooters) lvD.shooters.forEach(s => { if(currentLevel !== 20) s.y = groundY; });

    currentEnemies = JSON.parse(JSON.stringify(lvD.enemies || []));
    currentShooters = JSON.parse(JSON.stringify(lvD.shooters || []));
    currentLasers = JSON.parse(JSON.stringify(lvD.lasers || []));
    enemyProjectiles = [];
    
    bossTimerContainer.style.display = "none";
    boss.active = false;

    if(currentLevel === 20) {
        risingLaserY = groundY + 120; 
        bossTimerContainer.style.display = "block";
        bossTimer.innerHTML = `<span style="color:#ffffff;">Кнопки: 0 / 4</span>`;
        
        bossButtons = [
            { x: 140, y: groundY - 1242, w: 35, h: 12, pressed: false },  
            { x: 610, y: groundY - 1242, w: 35, h: 12, pressed: false },  
            { x: 380, y: groundY - 1352, w: 35, h: 12, pressed: false }, 
            { x: 160, y: groundY - 1432, w: 35, h: 12, pressed: false }  
        ];
        
        boss.shootTimer = 0;
        boss.y = groundY - 1220; 

        stopAudio(bgMusic); playAudio(bossMusic);
    } else {
        stopAudio(bossMusic); playAudio(bgMusic);
    }

    if(!isGameRunning) { isGameRunning = true; requestAnimationFrame(update); }
    
    introScreen.style.display = "none";
    outroScreen.style.display = "none";
    
    canvas.style.display = "block"; ui.style.display = "flex"; document.getElementById("gameControls").style.display = "flex";
    levelNum.textContent = currentLevel; deathCount.textContent = totalDeaths;
}

// ==========================================
// ЧАСТЬ 4: ЛОГИКА ОБНОВЛЕНИЯ И ХИТБОКСЫ
// ==========================================
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

function update() {
    if(!isGameRunning) return;

    let currentGravity = (currentLevel < 15) ? 0.22 : 0.5;
    let currentJumpForce = (currentLevel < 15) ? 7.5 : 11.5;

    if (keys.left) {
        player.velX = -player.speed;
    } else if (keys.right) {
        player.velX = player.speed;
    } else {
        player.velX = 0;
    }

    if (keys.up && player.grounded) { player.velY = -currentJumpForce; player.grounded = false; }
    player.velY += currentGravity; player.x += player.velX; player.y += player.velY; player.grounded = false;

    const lvl = levels[currentLevel];
    if(lvl && lvl.platforms) {
        lvl.platforms.forEach(p => {
            if (player.x < p.x + p.w && player.x + player.width > p.x && player.y < p.y + p.h && player.y + player.height > p.y) {
                if (player.velY > 0 && player.y + player.height - player.velY <= p.y + 6) { player.y = p.y - player.height; player.velY = 0; player.grounded = true; }
            }
        });
    }

    if(player.x < 0) player.x = 0; 
    if(player.y > canvas.height + 300) playerDeath();

    camera.x = player.x - canvas.width / 3;
    if(camera.x < 0) camera.x = 0;

    if(currentLevel === 20) {
        camera.y = player.y - canvas.height / 2 - 40;
        if(camera.y > 0) camera.y = 0;
    } else {
        camera.y = 0;
    }

    currentLasers.forEach(laser => {
        laser.timer++;
        if(laser.timer >= laser.cycle) laser.timer = 0;
        let isActive = laser.timer < laser.activeTime;
        if(isActive && checkCollision(player, {x: laser.x, y: laser.y, w: laser.w, h: laser.h})) {
            playerDeath();
        }
    });

    currentEnemies.forEach(enemy => {
        enemy.x += enemy.speed; if(enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) enemy.speed = -enemy.speed;
        let ey = enemy.y;
        if(checkCollision(player, { x: enemy.x, y: ey - enemy.h, w: enemy.w, h: enemy.h })) playerDeath();
    });

    currentShooters.forEach(sh => {
        sh.timer++;
        let sy = sh.y;
        if(sh.timer >= 120) { enemyProjectiles.push({ x: sh.x, y: sy - 25, w: 12, h: 6, speedX: -4.5 }); sh.timer = 0; }
        if(checkCollision(player, {x: sh.x, y: sy - 40, w: sh.w, h: 40})) playerDeath();
    });

    if(lvl && lvl.spikes) {
        lvl.spikes.forEach(s => {
            for(let i=0; i<s.count; i++) {
                let sp = { x: s.x + (i * 20), y: groundY - 20, w: 20, h: 20 }; 
                if(checkCollision(player, sp)) playerDeath();
            }
        });
    }

    if(currentLevel === 20) {
        if (risingLaserY > groundY - 1040) {
            risingLaserY -= 0.95; 
        }
        
        if(player.y + player.height > risingLaserY) playerDeath();
        if(player.y < groundY - 1050) { boss.active = true; }

        if(boss.active) {
            boss.shootTimer++;
            
            // ИСПРАВЛЕНО: Теперь стреляет каждые 60 кадров (ровно раз в секунду при стабильных 60 FPS)
            if(boss.shootTimer >= 60) {
                let bx = boss.x + boss.w / 2;
                let by = boss.y + boss.h / 2;
                let px = player.x + player.width / 2;
                let py = player.y + player.height / 2;
                
                let dx = px - bx;
                let dy = py - by;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if(dist > 0) {
                    let speed = 5; 
                    enemyProjectiles.push({
                        x: bx,
                        y: by,
                        w: 16,
                        h: 16,
                        speedX: (dx / dist) * speed,
                        speedY: (dy / dist) * speed 
                    });
                }
                boss.shootTimer = 0;
            }

            let pressedCount = 0;
            bossButtons.forEach(btn => {
                if(!btn.pressed && checkCollision(player, btn)) { 
                    btn.pressed = true; 
                }
                if(btn.pressed) pressedCount++;
            });

            bossTimer.innerHTML = `<span style="color:#ff3333;">Кнопки: ${pressedCount} / 4</span>`;

            if(pressedCount === 4) { endGame(); return; }
        }
    }

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        let proj = enemyProjectiles[i]; 
        proj.x += proj.speedX;
        if(proj.speedY) proj.y += proj.speedY; 
        
        if(checkCollision(player, proj)) { playerDeath(); break; }
        if(proj.x < camera.x - 200 || proj.x > camera.x + canvas.width + 200 || proj.y < player.y - 1000 || proj.y > player.y + 1000) {
            enemyProjectiles.splice(i, 1);
        }
    }

    if(lvl && lvl.goal && currentLevel < 20) {
        if(checkCollision(player, lvl.goal)) initGame(currentLevel + 1);
    }

    render(); 
    requestAnimationFrame(update);
}

// ==========================================
// ЧАСТЬ 5: ОТРИСОВКА КРАСНО-ВЕЛОГО МИРА И ДЕКОРАЦИЙ
// ==========================================
function drawStickman(x, y, color, isAlien = false) {
    let cx = x + 10; let cy = y + 10;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    
    if(isAlien) {
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy - 14); ctx.stroke();
        ctx.fillStyle = "#ff3333"; ctx.beginPath(); ctx.arc(cx, cy - 14, 3, 0, Math.PI*2); ctx.fill();
    }
    
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx, cy + 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 10, cy + 12); ctx.lineTo(cx + 10, cy + 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 24); ctx.lineTo(cx - 8, cy + 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 24); ctx.lineTo(cx + 8, cy + 38); ctx.stroke();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let isInsideBase = currentLevel >= 15;
    
    ctx.fillStyle = isInsideBase ? "#100505" : "#020205"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save(); 
    ctx.translate(-camera.x, -camera.y);
    const lvl = levels[currentLevel];

    if (!isInsideBase) {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillRect(100, 40, 2, 2); ctx.fillRect(400, 70, 3, 3); ctx.fillRect(700, 30, 2, 2);
        ctx.fillRect(950, 80, 2, 2); ctx.fillRect(1200, 55, 3, 3);
        
        ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#ff3333"; ctx.lineWidth = 4;
        for (let i = 50; i < 1600; i += 450) {
            ctx.beginPath();
            ctx.arc(i + 150, groundY + 30, 150, Math.PI, 0, false);
            ctx.fill(); ctx.stroke();
            
            ctx.fillStyle = "#ff3333"; 
            ctx.fillRect(i + 80, groundY - 50, 12, 12); 
            ctx.fillRect(i + 140, groundY - 70, 12, 12);
            ctx.fillRect(i + 200, groundY - 50, 12, 12);
            ctx.fillStyle = "#ffffff";
        }
    } else {
        ctx.fillStyle = "#030308"; 
        for (let j = 50; j < 1600; j += 400) {
            ctx.fillRect(j, -1500, 250, 1800);
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4;
            ctx.strokeRect(j, -1500, 250, 1800); 
            
            ctx.fillStyle = "#fff"; ctx.fillRect(j + 40, groundY - 200, 2, 2); ctx.fillRect(j + 180, groundY - 600, 2, 2);
            ctx.fillStyle = "#030308";
        }
        ctx.fillStyle = "#3a0d0d"; ctx.fillRect(10, -1500, 15, canvas.height + 1900); ctx.fillRect(1450, -1500, 15, canvas.height + 1900);
    }

    currentLasers.forEach(laser => {
        let isActive = laser.timer < laser.activeTime;
        if(isActive) { ctx.fillStyle = "rgba(255, 0, 0, 0.85)"; ctx.shadowColor = "#ff0000"; ctx.shadowBlur = 12; } 
        else { ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; ctx.shadowBlur = 0; }
        ctx.fillRect(laser.x, laser.y, laser.w, laser.h);
        ctx.shadowBlur = 0;
    });

    if(lvl && lvl.platforms) {
        lvl.platforms.forEach(p => {
            ctx.fillStyle = isInsideBase ? "#ffffff" : "#e6e6e6"; ctx.fillRect(p.x, p.y, p.w, p.h); 
            ctx.fillStyle = "#ff3333"; ctx.fillRect(p.x, p.y, p.w, 4); 
        });
    }

    if(currentLevel === 20) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.45)";
        ctx.shadowColor = "#ff0000"; ctx.shadowBlur = 25;
        ctx.fillRect(0, risingLaserY, 800, canvas.height + 1800);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, risingLaserY, 800, 5);
        ctx.fillStyle = "#ff3333"; ctx.fillRect(0, risingLaserY + 5, 800, 3);
        
        bossButtons.forEach(btn => {
            ctx.fillStyle = btn.pressed ? "#00ff66" : "#ff2222"; ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        });
    }

    if (lvl && lvl.spikes) {
        lvl.spikes.forEach(s => {
            ctx.fillStyle = "#ffffff";
            for (let i = 0; i < s.count; i++) {
                let sx = s.x + (i * 20); ctx.beginPath(); ctx.moveTo(sx, groundY); ctx.lineTo(sx + 10, groundY - 20); ctx.lineTo(sx + 20, groundY); ctx.fill();
                ctx.strokeStyle = "#ff3333"; ctx.lineWidth = 1.5; ctx.stroke();
            }
        });
    }

    currentEnemies.forEach(e => {
        drawStickman(e.x, e.y - e.h, "#ff3333", true);
    });
    currentShooters.forEach(sh => {
        drawStickman(sh.x, sh.y - 40, "#ffffff", true);
    });
    
    enemyProjectiles.forEach(p => { 
        ctx.fillStyle = "#ff3333";
        if(p.speedY !== undefined) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(p.x, p.y, p.w, p.h); 
        }
    });

    if (currentLevel === 20 && boss.active) {
        if(bossImg.complete && bossImg.src) {
            ctx.drawImage(bossImg, boss.x, boss.y, boss.w, boss.h);
        } else {
            ctx.fillStyle = "#ff3333"; ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.strokeRect(boss.x, boss.y, boss.w, boss.h);
        }
    }

    if (lvl && lvl.goal && currentLevel < 20) { ctx.fillStyle = "#ff3333"; ctx.fillRect(lvl.goal.x, lvl.goal.y, lvl.goal.w, lvl.goal.h); }
    drawStickman(player.x, player.y, "#ff1111", false);
    
    ctx.restore();
}

function endGame() {
    isGameRunning = false; stopAudio(bgMusic); stopAudio(bossMusic);
    canvas.style.display = "none"; ui.style.display = "none"; document.getElementById("gameControls").style.display = "none";
    resDeaths.textContent = totalDeaths;
    outroScreen.style.display = "flex";
}

outroCloseBtn.addEventListener("click", () => { outroScreen.style.display = "none"; mainMenu.style.display = "flex"; currentLevel = 1; totalDeaths = 0; });
window.addEventListener("resize", resizeCanvas);

