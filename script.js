/* ========================================
   MONACO REDZONE - FiveM Loading Screen
   ======================================== */

const progressBar = document.getElementById('progress-bar');
const percentText = document.getElementById('percent');
const loadingMessage = document.getElementById('loading-message').querySelector('span');
const playersText = document.getElementById('players');
const pingText = document.getElementById('ping');
const audio = document.getElementById('bg-audio');
const audioToggle = document.getElementById('audio-toggle');

/* ---------- CROATIAN LOADING MESSAGES ---------- */
const messages = [
    'POVEZIVANJE S MONACO REDZONE..',
    'UČITAVANJE RESURSA SERVERA..',
    'INICIJALIZACIJA ESX FRAMEWORK-A..',
    'UČITAVANJE PODATAKA LIKA..',
    'SINKRONIZACIJA SVIJETA..',
    'PRIPREMA EKONOMSKOG SUSTAVA..',
    'UČITAVANJE CUSTOM VOZILA..',
    'UČITAVANJE CUSTOM ODJEĆE..',
    'SINKRONIZACIJA POLICIJE..',
    'SINKRONIZACIJA HITNE POMOĆI..',
    'UČITAVANJE INTERIJERA (MLO)..',
    'POKRETANJE ANTI-CHEAT SUSTAVA..',
    'ZAVRŠAVANJE POVEZIVANJA..',
    'DOBRODOŠLI U MONACO REDZONE'
];

let currentMessage = 0;
let progress = 0;
let realProgress = 0;
let usingFiveM = false;

/* ---------- PROGRESS UPDATES ---------- */
function updateProgress(value) {
    progress = Math.min(100, Math.max(0, value));
    progressBar.style.width = progress + '%';
    percentText.textContent = Math.floor(progress) + '%';

    const messageIndex = Math.min(
        messages.length - 1,
        Math.floor((progress / 100) * messages.length)
    );
    if (messageIndex !== currentMessage) {
        currentMessage = messageIndex;
        loadingMessage.style.opacity = '0';
        setTimeout(() => {
            loadingMessage.textContent = messages[currentMessage];
            loadingMessage.style.opacity = '1';
        }, 200);
    }
}

/* ---------- FAKE PROGRESS (browser preview) ---------- */
function fakeProgress() {
    if (usingFiveM) return;
    if (realProgress < 100) {
        realProgress += Math.random() * 1.2 + 0.3;
        if (realProgress > 100) realProgress = 100;
        updateProgress(realProgress);
        setTimeout(fakeProgress, 220 + Math.random() * 280);
    }
}

/* ---------- FIVEM LOADING EVENTS ---------- */
window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data) return;

    usingFiveM = true;

    switch (data.eventName) {
        case 'loadProgress': {
            const pct = (data.loadFraction || 0) * 100;
            updateProgress(pct);
            break;
        }
        case 'startInitFunctionOrder':
        case 'initFunctionInvoking':
        case 'initFunctionInvoked':
            updateProgress(Math.min(progress + 1, 25));
            break;
        case 'startDataFileEntries':
        case 'performMapLoadFunction':
            updateProgress(Math.min(progress + 0.5, 50));
            break;
        case 'onLogLine':
            updateProgress(Math.min(progress + 0.2, 95));
            break;
        case 'endInitFunction':
            updateProgress(100);
            break;
    }
});

/* ---------- REAL PING MEASUREMENT ---------- */
const PING_ENDPOINTS = [
    'https://1.1.1.1/cdn-cgi/trace',
    'https://www.cloudflare.com/cdn-cgi/trace',
    'https://www.gstatic.com/generate_204'
];
const pingHistory = [];
const PING_HISTORY_SIZE = 5;
let pingEndpointIndex = 0;

async function measurePing() {
    const url = PING_ENDPOINTS[pingEndpointIndex] + '?_=' + Date.now();
    const start = performance.now();
    try {
        await fetch(url, {
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-store',
            credentials: 'omit'
        });
        return Math.round(performance.now() - start);
    } catch {
        pingEndpointIndex = (pingEndpointIndex + 1) % PING_ENDPOINTS.length;
        return null;
    }
}

function colorForPing(ms) {
    if (ms < 40) return '#00ff88';
    if (ms < 80) return '#a8ff00';
    if (ms < 130) return '#ffd000';
    if (ms < 200) return '#ff8800';
    return '#ff3344';
}

async function pingLoop() {
    const ms = await measurePing();
    if (ms !== null) {
        pingHistory.push(ms);
        if (pingHistory.length > PING_HISTORY_SIZE) pingHistory.shift();

        const avg = Math.round(
            pingHistory.reduce((a, b) => a + b, 0) / pingHistory.length
        );
        pingText.textContent = avg + ' ms';
        pingText.style.color = colorForPing(avg);
        pingText.style.textShadow = '0 0 12px ' + colorForPing(avg);
    } else {
        pingText.textContent = '-- ms';
        pingText.style.color = '#6b6b6b';
        pingText.style.textShadow = 'none';
    }
    setTimeout(pingLoop, 2500);
}

/* ---------- AUDIO ---------- */
let audioMuted = false;
audio.volume = 0.35;

function tryPlayAudio() {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            document.addEventListener('click', () => audio.play().catch(() => {}), { once: true });
            document.addEventListener('keydown', () => audio.play().catch(() => {}), { once: true });
        });
    }
}

audioToggle.addEventListener('click', () => {
    audioMuted = !audioMuted;
    audio.muted = audioMuted;
    audioToggle.innerHTML = audioMuted
        ? '<i class="bi bi-volume-mute-fill"></i>'
        : '<i class="bi bi-volume-up-fill"></i>';
});

/* ---------- PARTICLES ---------- */
function createParticles() {
    const container = document.getElementById('particles');
    const count = 30;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.bottom = '-20px';
        p.style.animationDuration = (8 + Math.random() * 12) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        const size = 2 + Math.random() * 3;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        container.appendChild(p);
    }
}

/* ---------- REAL PLAYER COUNT ---------- */
const SERVER_HOST = '185.195.237.206';
const SERVER_PORT = 20012;
const PLAYER_REFRESH_MS = 10000;
let lastKnownPlayers = null;
let lastKnownMax = 256;

async function fetchServerPlayers() {
    const url = `http://${SERVER_HOST}:${SERVER_PORT}/dynamic.json?_=${Date.now()}`;
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        const current = typeof data.clients === 'number' ? data.clients : parseInt(data.clients);
        const max = parseInt(data.sv_maxclients) || lastKnownMax;
        if (isNaN(current)) return null;
        return { current, max };
    } catch {
        return null;
    }
}

function renderPlayers(current, max, live) {
    playersText.textContent = `${current}/${max}`;
    playersText.style.color = live ? '#ffffff' : '#b8b8b8';
    playersText.style.textShadow = live ? '0 0 12px rgba(255, 0, 51, 0.5)' : 'none';
}

async function playersLoop() {
    const data = await fetchServerPlayers();
    if (data) {
        lastKnownPlayers = data.current;
        lastKnownMax = data.max;
        renderPlayers(data.current, data.max, true);
    } else if (lastKnownPlayers !== null) {
        renderPlayers(lastKnownPlayers, lastKnownMax, false);
    } else {
        playersText.textContent = `--/${lastKnownMax}`;
        playersText.style.color = '#6b6b6b';
        playersText.style.textShadow = 'none';
    }
    setTimeout(playersLoop, PLAYER_REFRESH_MS);
}

/* ---------- INIT ---------- */
window.addEventListener('load', () => {
    createParticles();
    tryPlayAudio();
    playersLoop();
    pingLoop();
    setTimeout(fakeProgress, 600);
});
