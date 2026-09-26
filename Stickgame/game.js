const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth < 800 ? window.innerWidth : 800;
canvas.height = window.innerHeight * 0.7;
let currentLevel = 1;
let keys = { left: false, right: false, up: false };
const player = { x: 50, y: 100, width: 20, height: 40, velX: 0, velY: 0, speed: 4, jumpForce: 11, grounded: false };
const gravity = 0.5;
const groundY = canvas.height - 40;
const camera = { x: 0, y: 0 };

let totalDeaths = 0;
let startTime = 0;
let outroStep = 0; 

let boss = { x: 500, y: groundY, w: 50, h: 100, hp: 3, shootTimer: 0 };
let projectiles = [];
let levers = [
    { x: 80, y: groundY - 140, w: 20, h: 20, active: false },
    { x: 220, y: groundY - 200, w: 20, h: 20, active: false },
    { x: 600, y: groundY - 40, w: 20, h: 20, active: false }
];

const levels = {
    1: { platforms: [{x: 0, y: groundY, w: 300, h: 40}, {x: 400, y: groundY, w: 400, h: 40}, {x: 250, y: groundY - 60, w: 120, h: 15}], spikes: [{x: 450, y: groundY, count: 3}], enemies: [{x: 550, y: groundY, w: 20, h: 40, speed: 1.5, minX: 500, maxX: 700}], goal: {x: 720, y: groundY - 50, w: 30, h: 50} },
    2: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY - 50, w: 100, h: 15}, {x: 400, y: groundY - 100, w: 100, h: 15}, {x: 550, y: groundY, w: 300, h: 40}], spikes: [{x: 600, y: groundY, count: 4}], enemies: [{x: 560, y: groundY, w: 20, h: 40, speed: 2, minX: 550, maxX: 750}], goal: {x: 800, y: groundY - 50, w: 30, h: 50} },
    3: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY - 50, w: 120, h: 15}, {x: 420, y: groundY - 100, w: 120, h: 15}, {x: 590, y: groundY - 50, w: 120, h: 15}, {x: 750, y: groundY, w: 200, h: 40}], spikes: [{x: 270, y: groundY - 50, count: 1}, {x: 610, y: groundY - 50, count: 1}], enemies: [{x: 770, y: groundY, w: 20, h: 40, speed: 1.8, minX: 760, maxX: 900}], goal: {x: 900, y: groundY - 50, w: 30, h: 50} },
    4: { platforms: [{x: 0, y: groundY, w: 250, h: 40}, {x: 300, y: groundY - 60, w: 150, h: 15}, {x: 500, y: groundY - 120, w: 150, h: 15}, {x: 700, y: groundY, w: 300, h: 40}], spikes: [{x: 320, y: groundY - 60, count: 2}, {x: 750, y: groundY, count: 5}], enemies: [{x: 780, y: groundY, w: 20, h: 40, speed: 2.5, minX: 720, maxX: 950}], goal: {x: 950, y: groundY - 50, w: 30, h: 50} },
    5: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 50, w: 100, h: 15}, {x: 350, y: groundY - 100, w: 100, h: 15}, {x: 500, y: groundY - 150, w: 100, h: 15}, {x: 650, y: groundY - 90, w: 100, h: 15}, {x: 800, y: groundY, w: 200, h: 40}], spikes: [{x: 370, y: groundY - 100, count: 1}, {x: 830, y: groundY, count: 3}], enemies: [{x: 850, y: groundY, w: 20, h: 40, speed: 2, minX: 810, maxX: 980}], goal: {x: 950, y: groundY - 50, w: 30, h: 50} },
    6: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY - 50, w: 150, h: 15}, {x: 450, y: groundY - 50, w: 150, h: 15}, {x: 650, y: groundY, w: 250, h: 40}], spikes: [{x: 280, y: groundY - 50, count: 2}, {x: 480, y: groundY - 50, count: 2}], enemies: [{x: 680, y: groundY, w: 20, h: 40, speed: 2, minX: 660, maxX: 880}], goal: {x: 850, y: groundY - 50, w: 30, h: 50} },
    7: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 60, w: 120, h: 15}, {x: 370, y: groundY - 120, w: 120, h: 15}, {x: 540, y: groundY - 60, w: 120, h: 15}, {x: 700, y: groundY, w: 200, h: 40}], spikes: [{x: 50, y: groundY, count: 3}], enemies: [{x: 210, y: groundY - 60, w: 20, h: 40, speed: 1.5, minX: 200, maxX: 300}, {x: 720, y: groundY, w: 20, h: 40, speed: -2, minX: 710, maxX: 880}], goal: {x: 850, y: groundY - 50, w: 30, h: 50} },
    8: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY, w: 180, h: 40}, {x: 430, y: groundY, w: 180, h: 40}, {x: 660, y: groundY, w: 200, h: 40}], spikes: [{x: 220, y: groundY, count: 3}, {x: 450, y: groundY, count: 3}], enemies: [{x: 680, y: groundY, w: 20, h: 40, speed: 2, minX: 670, maxX: 830}], goal: {x: 830, y: groundY - 50, w: 30, h: 50} },
    9: { platforms: [{x: 0, y: groundY, w: 100, h: 40}, {x: 150, y: groundY - 40, w: 100, h: 15}, {x: 300, y: groundY - 80, w: 100, h: 15}, {x: 450, y: groundY - 120, w: 100, h: 15}, {x: 600, y: groundY - 80, w: 100, h: 15}, {x: 750, y: groundY, w: 200, h: 40}], spikes: [{x: 170, y: groundY - 40, count: 2}, {x: 470, y: groundY - 120, count: 2}], enemies: [{x: 770, y: groundY, w: 20, h: 40, speed: 2.5, minX: 760, maxX: 930}], goal: {x: 900, y: groundY - 50, w: 30, h: 50} },
    10: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 50, w: 150, h: 15}, {x: 400, y: groundY - 100, w: 150, h: 15}, {x: 600, y: groundY - 50, w: 150, h: 15}, {x: 800, y: groundY, w: 200, h: 40}], spikes: [{x: 220, y: groundY - 50, count: 2}, {x: 620, y: groundY - 50, count: 2}], enemies: [{x: 420, y: groundY - 100, w: 20, h: 40, speed: 2, minX: 410, maxX: 530}], goal: {x: 950, y: groundY - 50, w: 30, h: 50} },
    11: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY - 60, w: 120, h: 15}, {x: 420, y: groundY - 120, w: 120, h: 15}, {x: 590, y: groundY - 180, w: 150, h: 15}], spikes: [{x: 270, y: groundY - 60, count: 1}, {x: 440, y: groundY - 120, count: 1}], enemies: [{x: 50, y: groundY, w: 20, h: 40, speed: 2, minX: 10, maxX: 180}], goal: {x: 680, y: groundY - 230, w: 30, h: 50} },
    12: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 40, w: 100, h: 15}, {x: 350, y: groundY - 40, w: 100, h: 15}, {x: 500, y: groundY - 40, w: 100, h: 15}, {x: 650, y: groundY, w: 150, h: 40}], spikes: [{x: 220, y: groundY - 40, count: 1}, {x: 370, y: groundY - 40, count: 1}, {x: 520, y: groundY - 40, count: 1}], enemies: [{x: 20, y: groundY, w: 20, h: 40, speed: 1.5, minX: 5, maxX: 130}], goal: {x: 750, y: groundY - 50, w: 30, h: 50} },
    13: { platforms: [{x: 0, y: groundY, w: 150, h: 40}, {x: 200, y: groundY - 60, w: 150, h: 15}, {x: 400, y: groundY - 120, w: 150, h: 15}, {x: 600, y: groundY - 60, w: 150, h: 40}], spikes: [{x: 230, y: groundY - 60, count: 2}], enemies: [{x: 430, y: groundY - 120, w: 20, h: 40, speed: 2, minX: 410, maxX: 520}], goal: {x: 700, y: groundY - 110, w: 30, h: 50} },
    14: { platforms: [{x: 0, y: groundY, w: 200, h: 40}, {x: 250, y: groundY, w: 200, h: 40}, {x: 500, y: groundY, w: 250, h: 40}, {x: 300, y: groundY - 70, w: 100, h: 15}], spikes: [{x: 270, y: groundY, count: 5}], enemies: [{x: 310, y: groundY - 70, w: 20, h: 40, speed: 1.8, minX: 300, maxX: 380}, {x: 550, y: groundY, w: 20, h: 40, speed: 3, minX: 520, maxX: 720}], goal: {x: 680, y: groundY - 50, w: 30, h: 50} },
    15: { platforms: [{x: 0, y: groundY, w: 100, h: 40}, {x: 150, y: groundY - 40, w: 90, h: 15}, {x: 290, y: groundY - 80, w: 90, h: 15}, {x: 430, y: groundY - 120, w: 90, h: 15}, {x: 570, y: groundY - 160, w: 90, h: 15}, {x: 710, y: groundY - 100, w: 150, h: 40}], spikes: [{x: 170, y: groundY - 40, count: 1}, {x: 450, y: groundY - 120, count: 2}], enemies: [{x: 300, y: groundY - 80, w: 20, h: 40, speed: 2, minX: 290, maxX: 360}], goal: {x: 800, y: groundY - 150, w: 30, h: 50} },
    16: { platforms: [{x: 0, y: groundY, w: 800, h: 40}, {x: 50, y: groundY - 80, w: 100, h: 15}, {x: 200, y: groundY - 140, w: 100, h: 15}, {x: 350, y: groundY - 60, w: 100, h: 15}, {x: 595, y: groundY - 20, w: 30, h: 20}], spikes: [], enemies: [], goal: {x: 720, y: groundY - 50, w: 30, h: 50} }
};
function getLevelData() { return levels[currentLevel] || levels; }
function drawSpikes(x, y, count) {
    ctx.fillStyle = "#555866"; const sW = 15, sH = 15;
    for (let i = 0; i < count; i++) { let cX = x + (i * sW); ctx.beginPath(); ctx.moveTo(cX, y); ctx.lineTo(cX + sW / 2, y - sH); ctx.lineTo(cX + sW, y); ctx.fill(); ctx.strokeStyle = "#333540"; ctx.lineWidth = 1; ctx.stroke(); }
}
function drawStickman(x, y, color, scale = 1) {
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2.5 * scale; let dY = y - (40 * scale);
    ctx.beginPath(); ctx.arc(x + (10 * scale), dY + (8 * scale), 6 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + (10 * scale), dY + (14 * scale)); ctx.lineTo(x + (10 * scale), dY + (26 * scale)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, dY + (18 * scale)); ctx.lineTo(x + (20 * scale), dY + (18 * scale)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + (10 * scale), dY + (26 * scale)); ctx.lineTo(x + (2 * scale), dY + (40 * scale)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + (10 * scale), dY + (26 * scale)); ctx.lineTo(x + (18 * scale), dY + (40 * scale)); ctx.stroke();
}
function drawBackground() {
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height); grad.addColorStop(0, "#7ec0ee"); grad.addColorStop(0.6, "#bce2fe"); grad.addColorStop(1, "#eef7ff"); ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(100, 130, 160, 0.4)"; for (let i = 0; i < 15; i++) { let bW = 50 + (i % 3) * 20; let bH = 120 + (i % 5) * 35; let bX = (i * 70) - (camera.x * 0.3) % (canvas.width + 150); ctx.fillRect(bX, canvas.height - bH, bW, bH); }
}
function manageMusic() {
    const normalMusic = document.getElementById("bgMusic"); const bossMusic = document.getElementById("bossMusic");
    if (currentLevel === 16) { if (normalMusic) normalMusic.pause(); if (bossMusic && bossMusic.paused) bossMusic.play().catch(e => {}); }
    else { if (bossMusic) bossMusic.pause(); if (normalMusic && normalMusic.paused) normalMusic.play().catch(e => {}); }
}
function showOutro() {
    const normalMusic = document.getElementById("bgMusic"); const bossMusic = document.getElementById("bossMusic");
    if (normalMusic) normalMusic.pause(); if (bossMusic) bossMusic.pause();
    document.getElementById("gameCanvas").style.display = "none"; document.getElementById("ui").style.display = "none"; document.getElementById("gameControls").style.display = "none";
    outroStep = 0; document.getElementById("outroImg").style.display = "block"; document.getElementById("resultsContainer").style.display = "none"; document.getElementById("outroCloseBtn").innerText = "Далее →"; document.getElementById("outroScreen").style.display = "flex";
}
function update() {
    const lvl = getLevelData();
    if (keys.left) player.velX = -player.speed; else if (keys.right) player.velX = player.speed; else player.velX = 0;
    if (keys.up && player.grounded) { player.velY = -player.jumpForce; player.grounded = false; }
    player.velY += gravity; player.x += player.velX; player.y += player.velY; player.grounded = false;
    if (player.x < 0) player.x = 0; camera.x = player.x - canvas.width / 2; if (camera.x < 0) camera.x = 0;

    lvl.platforms.forEach(p => { if (player.x < p.x + p.w && player.x + player.width > p.x && player.y < p.y + p.h && player.y + player.height > p.y) { if (player.velY > 0 && player.y + player.height - player.velY <= p.y) { player.y = p.y - player.height; player.velY = 0; player.grounded = true; } } });
    lvl.spikes.forEach(s => { if (player.x < s.x + (s.count * 15) && player.x + player.width > s.x && player.y + player.height > s.y - 15 && player.y < s.y) resetLevel(true); });
    
    lvl.enemies.forEach(e => {
        e.x += e.speed; if (e.x < e.minX || e.x > e.maxX) e.speed = -e.speed;
        let pY_feet = player.y + player.height; let eY_head = e.y - 40;
        if (player.x < e.x + 20 && player.x + player.width > e.x && pY_feet > eY_head && player.y < e.y) resetLevel(true);
    });

    if (currentLevel === 16) {
        if (boss.hp > 0) {
            boss.shootTimer++;
            if (boss.shootTimer >= 90) {
                let angle = Math.atan2((player.y - 20) - (boss.y - 60), player.x - boss.x); angle += (Math.random() - 0.5) * 0.3; 
                projectiles.push({ x: boss.x, y: boss.y - 60, vx: Math.cos(angle) * 5.5, vy: Math.sin(angle) * 3 - 2 }); boss.shootTimer = 0;
            }
            if (player.x < boss.x + boss.w && player.x + player.width > boss.x && player.y < boss.y && player.y + player.height > boss.y - boss.h) resetLevel(true);
        }
        projectiles.forEach((p, index) => {
            p.x += p.vx; p.vy += 0.08; p.y += p.vy;
            if (player.x < p.x + 8 && player.x + player.width > p.x && player.y < p.y + 8 && player.y + player.height > p.y) resetLevel(true);
            if (p.x < 0 || p.x > 800 || p.y > canvas.height) projectiles.splice(index, 1);
        });
        let activeCount = 0; levers.forEach(l => { if (player.x < l.x + l.w && player.x + player.width > l.x && player.y < l.y + l.h && player.y + player.height > l.y) l.active = true; if (l.active) activeCount++; });
        if (activeCount === 3) boss.hp = 0;
    }

    let g = lvl.goal;
    if (currentLevel !== 16 || boss.hp <= 0) {
        if (player.x < g.x + g.w && player.x + player.width > g.x && player.y < g.y + g.h && player.y + player.height > g.y) {
            currentLevel++; if (currentLevel > Object.keys(levels).length) { showOutro(); return; }
            manageMusic(); document.getElementById("levelNum").innerText = currentLevel; localStorage.setItem("stickGame_saveLevel", currentLevel); resetLevel(false);
        }
    }
    if (player.y > canvas.height) resetLevel(true);
}
function resetLevel(isDeath) { 
    player.x = 50; player.y = 100; player.velX = 0; player.velY = 0; projectiles = []; 
    if(currentLevel === 16) levers.forEach(l => l.active = false); boss.hp = 3; boss.shootTimer = 0; 
    if (isDeath) { totalDeaths++; document.getElementById("deathCount").innerText = totalDeaths; localStorage.setItem("stickGame_deaths", totalDeaths); }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); const lvl = getLevelData(); drawBackground(); ctx.save(); ctx.translate(-camera.x, 0);
    lvl.platforms.forEach(p => { ctx.fillStyle = "#2c3e50"; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.fillStyle = "#34495e"; ctx.fillRect(p.x, p.y, p.w, 4); });
    lvl.spikes.forEach(s => drawSpikes(s.x, s.y, s.count));
    
    if (currentLevel === 16) {
        levers.forEach(l => { ctx.fillStyle = l.active ? "#d35400" : "#f1c40f"; ctx.fillRect(l.x, l.y, l.w, l.h); ctx.fillStyle = "#000"; ctx.fillRect(l.x + 8, l.y + 4, 4, 12); });
        if (boss.hp > 0) { drawStickman(boss.x, boss.y, "#000000", 2.5); }
        ctx.fillStyle = "#e74c3c"; projectiles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill(); });
    }

    if (currentLevel !== 16 || boss.hp <= 0) { ctx.fillStyle = "#00ff66"; ctx.shadowBlur = 10; ctx.shadowColor = "#00ff66"; ctx.fillRect(lvl.goal.x, lvl.goal.y, lvl.goal.w, lvl.goal.h); ctx.shadowBlur = 0; }
    lvl.enemies.forEach(e => drawStickman(e.x, e.y, "#000000")); drawStickman(player.x, player.y + 40, "#ff3333"); ctx.restore();
}
function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
function startActualGameplay(lvlStart) {
    currentLevel = lvlStart; document.getElementById("levelNum").innerText = currentLevel; localStorage.setItem("stickGame_saveLevel", currentLevel); 
    let savedDeaths = localStorage.getItem("stickGame_deaths"); totalDeaths = savedDeaths ? parseInt(savedDeaths) : 0; document.getElementById("deathCount").innerText = totalDeaths;
    document.getElementById("mainMenu").style.display = "none"; document.getElementById("gameCanvas").style.display = "block"; document.getElementById("ui").style.display = "block"; document.getElementById("gameControls").style.display = "flex";
    manageMusic(); resetLevel(false); gameLoop();
}
document.getElementById("startBtn").addEventListener("click", () => { totalDeaths = 0; document.getElementById("deathCount").innerText = "0"; localStorage.setItem("stickGame_deaths", 0); startTime = Date.now(); document.getElementById("mainMenu").style.display = "none"; document.getElementById("introScreen").style.display = "flex"; });
document.getElementById("introNextBtn").addEventListener("click", () => { document.getElementById("introScreen").style.display = "none"; startActualGameplay(1); });
document.getElementById("outroCloseBtn").addEventListener("click", () => {
    if (outroStep === 0) {
        document.getElementById("outroImg").style.display = "none";
        let diffTime = Date.now() - startTime; let mins = Math.floor(diffTime / 60000); let secs = Math.floor((diffTime % 60000) / 1000);
        let formattedTime = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
        document.getElementById("resTime").innerText = formattedTime; document.getElementById("resDeaths").innerText = totalDeaths;
        document.getElementById("resultsContainer").style.display = "block"; document.getElementById("outroCloseBtn").innerText = "В меню"; outroStep = 1;
    } else {
        document.getElementById("outroScreen").style.display = "none"; document.getElementById("mainMenu").style.display = "flex";
        currentLevel = 1; localStorage.setItem("stickGame_saveLevel", 1); localStorage.setItem("stickGame_deaths", 0);
    }
});
document.getElementById("loadBtn").addEventListener("click", () => { let saved = localStorage.getItem("stickGame_saveLevel"); if (saved) { startTime = Date.now(); startActualGameplay(parseInt(saved)); } else { alert("Сейвов нет. Начинаем заново."); document.getElementById("startBtn").click(); } });
const setupTouch = (bId, kNm) => { const btn = document.getElementById(bId); btn.addEventListener("touchstart", (e) => { e.preventDefault(); keys[kNm] = true; }); btn.addEventListener("touchend", (e) => { e.preventDefault(); keys[kNm] = false; }); };
setupTouch("btnLeft", "left"); setupTouch("btnRight", "right"); setupTouch("btnJump", "up");
