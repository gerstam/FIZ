/* ========================================
   MONACO REDZONE - FiveM Loading Screen
   ======================================== */

const progressBar = document.getElementById('progress-bar');
const percentText = document.getElementById('percent');
const loadingMessage = document.getElementById('loading-message').querySelector('span');
const playersText = document.getElementById('players');
const audio = document.getElementById('bg-audio');
const audioToggle = document.getElementById('audio-toggle');

/* ---------- LOADING MESSAGES ---------- */
const messages = [
    'CONNECTING TO MONACO REDZONE..',
    'LOADING SERVER RESOURCES..',
    'INITIALIZING ESX FRAMEWORK..',
    'LOADING CHARACTER DATA..',
    'SYNCING WORLD ENTITIES..',
    'PREPARING ECONOMY SYSTEM..',
    'LOADING CUSTOM VEHICLES..',
    'LOADING CUSTOM CLOTHING..',
    'SYNCING POLICE DEPARTMENT..',
    'SYNCING EMS DEPARTMENT..',
    'LOADING MLO INTERIORS..',
    'SECURING ANTI-CHEAT..',
    'FINALIZING CONNECTION..',
    'WELCOME TO MONACO REDZONE'
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

/* ---------- FAKE PROGRESS (when not in FiveM) ---------- */
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

/* ---------- AUDIO ---------- */
let audioMuted = false;
audio.volume = 0.35;

function tryPlayAudio() {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // autoplay blocked - wait for user interaction
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

/* ---------- PLAYER COUNT ANIMATION ---------- */
function animatePlayers() {
    const targets = [
        '128/256', '129/256', '131/256', '132/256', '134/256',
        '135/256', '133/256', '136/256', '138/256', '140/256'
    ];
    let i = 0;
    setInterval(() => {
        i = (i + 1) % targets.length;
        playersText.textContent = targets[i];
    }, 3500);
}

/* ---------- INIT ---------- */
window.addEventListener('load', () => {
    createParticles();
    tryPlayAudio();
    animatePlayers();
    setTimeout(fakeProgress, 600);
});
