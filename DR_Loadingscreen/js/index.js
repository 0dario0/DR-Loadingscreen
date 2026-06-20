const CONFIG = {

    // YouTube video ID (part after ?v=)
    youtubeVideoId: '4BSZtvqfzWE',

    // Music
    tracks: [
        { title: 'Track 1', artist: 'Artist 1', file: 'music/track1.mp3' },
        { title: 'Track 2', artist: 'Artist 2', file: 'music/track2.mp3' },
        { title: 'Track 3', artist: 'Artist 3', file: 'music/track3.mp3' },
        { title: 'Track 4', artist: 'Artist 4', file: 'music/track4.mp3' },
        { title: 'Track 5', artist: 'Artist 5', file: 'music/track5.mp3' },
    ],

    defaultVolume: 20,   // 0–100

    // Discord invite link
    discordUrl: 'https://discord.gg/Z8FhZQEGpK',

    serverName: 'Connecting to server',

    // Staff
    // rankClass: 'rank-owner' | 'rank-management' | 'rank-head' | 'rank-admin' | 'rank-mod' | 'rank-helper' | 'rank-dev' | 'rank-default'
    staff: [
        { name: 'Owner', rank: 'Owner', rankClass: 'rank-owner', avatar: 'img/staff/avatar1.png', emoji: '👑' },
        { name: 'Management', rank: 'Management', rankClass: 'rank-owner', avatar: 'img/staff/avatar2.png', emoji: '🎖️' },
        { name: 'Head of Staff', rank: 'Head of Staff', rankClass: 'rank-head', avatar: 'img/staff/avatar3.png', emoji: '⚡' },
        { name: 'Developer', rank: 'Developer', rankClass: 'rank-dev', avatar: 'img/staff/avatar4.png', emoji: '⚙️' },
    ],
};

// ═══════════════════════════════════════════════

// ── Player state ──
let currentTrack = 0;
let isPlaying    = false;
let isMuted      = false;
let prevVolume   = CONFIG.defaultVolume;

const audio = document.getElementById('audio');

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    initYouTube();
    initMusic();
    buildStaffList();
    initParticles();
    initCursor();
    simulateLoading();
});

// ════════════════════════════════════
//  YouTube background
// ════════════════════════════════════
function initYouTube() {
    const id = CONFIG.youtubeVideoId;
    if (!id) return;

    const params = [
        'autoplay=1', 'mute=1', 'loop=1', 'controls=0',
        'disablekb=1', 'fs=0', 'modestbranding=1',
        'iv_load_policy=3', 'rel=0', 'showinfo=0',
        `playlist=${id}`,
    ].join('&');

    const iframe = document.getElementById('yt-player');
    iframe.src = `https://www.youtube.com/embed/${id}?${params}`;

    iframe.addEventListener('load', () => {
        try {
            iframe.contentDocument;
        } catch (e) {
            document.getElementById('yt-bg').classList.remove('hidden');
        }
    });
}

// ════════════════════════════════════
//  Music system
// ════════════════════════════════════
function initMusic() {
    if (!CONFIG.tracks.length) return;

    audio.volume = CONFIG.defaultVolume / 100;
    document.getElementById('vol-slider').value = CONFIG.defaultVolume;

    audio.addEventListener('ended', nextTrack);
    audio.addEventListener('error', nextTrack);

    const randomIndex = Math.floor(Math.random() * CONFIG.tracks.length);
    loadTrack(randomIndex, true);
}

function loadTrack(index, autoplay) {
    const t = CONFIG.tracks[index];
    if (!t) return;

    currentTrack = index;
    audio.src = t.file;

    document.getElementById('music-title').textContent  = t.title;
    document.getElementById('music-artist').textContent = t.artist;

    if (isPlaying || autoplay) {
        const tryPlay = () => {
            audio.play().then(() => {
                isPlaying = true;
                setPlayIcon(true);
            }).catch(() => {});
            audio.removeEventListener('canplay', tryPlay);
        };
        audio.addEventListener('canplay', tryPlay);
        audio.load();
    }
}

function setPlayIcon(playing) {
    document.getElementById('icon-pause').style.display = playing ? '' : 'none';
    document.getElementById('icon-play').style.display  = playing ? 'none' : '';
}

function togglePlay() {
    if (audio.paused) {
        audio.play().then(() => {
            isPlaying = true;
            setPlayIcon(true);
        }).catch(() => {});
    } else {
        audio.pause();
        isPlaying = false;
        setPlayIcon(false);
    }
}

function nextTrack() {
    const next = (currentTrack + 1) % CONFIG.tracks.length;
    loadTrack(next);
    if (isPlaying) audio.play().catch(() => {});
}

function prevTrack() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    const prev = (currentTrack - 1 + CONFIG.tracks.length) % CONFIG.tracks.length;
    loadTrack(prev);
    if (isPlaying) audio.play().catch(() => {});
}

// ════════════════════════════════════
// Volume
// ════════════════════════════════════
function setVolume(val) {
    const v = parseInt(val);
    audio.volume  = v / 100;
    isMuted = false;

    const icon = document.getElementById('vol-icon');
    if (v === 0)       icon.textContent = '🔇';
    else if (v < 40)   icon.textContent = '🔉';
    else               icon.textContent = '🔊';
}

function toggleMute() {
    const slider = document.getElementById('vol-slider');

    if (isMuted) {
        isMuted = false;
        audio.volume = prevVolume / 100;
        slider.value = prevVolume;
        setVolume(prevVolume);
    } else {
        isMuted = true;
        prevVolume = parseInt(slider.value) || CONFIG.defaultVolume;
        audio.volume = 0;
        slider.value = 0;
        document.getElementById('vol-icon').textContent = '🔇';
    }
}

// Auto-play attempt on first click
document.addEventListener('click', () => {
    if (!isPlaying && audio.src && audio.paused) {
        audio.play().then(() => {
            isPlaying = true;
            setPlayIcon(true);
        }).catch(() => {});
    }
}, { once: true });

// ════════════════════════════════════
// Staff list
// ════════════════════════════════════
function buildStaffList() {
    const list = document.getElementById('staff-list');
    list.innerHTML = '';

    CONFIG.staff.forEach(m => {
        const el = document.createElement('div');
        el.className = 'staff-member';

        const avatarEl = m.avatar
            ? `<img class="staff-avatar" src="${m.avatar}" alt="${m.name}" onerror="this.parentElement.innerHTML='<div class=\\'staff-avatar-placeholder\\'>${m.emoji || '👤'}</div>'" />`
            : `<div class="staff-avatar-placeholder">${m.emoji || '👤'}</div>`;

        el.innerHTML = `
            ${avatarEl}
            <div class="staff-texts">
                <div class="staff-name">${m.name}</div>
                <div class="staff-rank">${m.rank}</div>
            </div>
            <div class="staff-rank-badge ${m.rankClass || 'rank-default'}">${m.rank}</div>
        `;

        list.appendChild(el);
    });
}

// ════════════════════════════════════
// Discord
// ════════════════════════════════════
function openDiscord() {
    const url = CONFIG.discordUrl;

    if (window.invokeNative) {
        window.invokeNative('openUrl', url);
    } else {
        window.open(url, '_blank');
    }
}

// ════════════════════════════════════
// Toast
// ════════════════════════════════════
function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;

    t.style.cssText = `
        position:fixed; bottom:110px; left:50%; transform:translateX(-50%);
        background:rgba(7,10,20,0.92); border:1px solid rgba(74,143,212,0.4);
        color:#e8e8f0; font-family:'Exo 2',sans-serif; font-size:13px;
        padding:10px 20px; border-radius:8px; z-index:99999;
        backdrop-filter:blur(10px); box-shadow:0 4px 20px rgba(0,0,0,0.5);
        animation:fadeIn 0.3s ease;
    `;

    document.body.appendChild(t);

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transition = 'opacity 0.4s';
    }, 2500);

    setTimeout(() => t.remove(), 3000);
}

// ════════════════════════════════════
// Staff overlay
// ════════════════════════════════════
function toggleStaff() {
    document.getElementById('staff-overlay').classList.toggle('hidden');
}

// ════════════════════════════════════
// Loading simulation
// ════════════════════════════════════
function simulateLoading() {
    let progress = 0;

    const fill   = document.getElementById('progress-fill');
    const pct    = document.getElementById('progress-pct');
    const status = document.getElementById('loading-status');

    const steps = [
        [10, 'Loading game files...'],
        [25, 'Initializing resources...'],
        [45, 'Connecting to database...'],
        [65, 'Synchronizing player data...'],
        [80, 'Loading map and objects...'],
        [90, 'Waiting for server...'],
    ];

    let stepIdx = 0;

    const interval = setInterval(() => {
        if (stepIdx < steps.length) {
            const [target, msg] = steps[stepIdx];

            progress = target;
            fill.style.width = progress + '%';
            pct.textContent  = progress + '%';
            status.textContent = msg;

            stepIdx++;
        } else {
            clearInterval(interval);
        }
    }, 1400);
}

// ════════════════════════════════════
// FiveM progress listener
// ════════════════════════════════════
window.addEventListener('message', (e) => {
    const data = e.data;
    if (!data) return;

    if (data.eventName === 'loadProgress' || data.type === 'loadProgress') {
        const p = Math.round((data.loadFraction || data.progress || 0) * 100);

        document.getElementById('progress-fill').style.width = p + '%';
        document.getElementById('progress-pct').textContent  = p + '%';

        if (data.status) document.getElementById('loading-status').textContent = data.status;
        if (p >= 100) hideCursor();
    }
});

// ════════════════════════════════════
// Cursor + particles
// ════════════════════════════════════
function initCursor() {
    const inner = document.getElementById('cursor-inner');

    const stars = ['★', '✦', '·', '✧', '⋆'];
    let lastStarTime = 0;

    document.addEventListener('mousemove', (e) => {
        inner.style.left = e.clientX + 'px';
        inner.style.top  = e.clientY + 'px';

        const now = Date.now();
        if (now - lastStarTime < 40) return;
        lastStarTime = now;

        const el = document.createElement('div');
        el.className = 'star-particle';
        el.textContent = stars[Math.floor(Math.random() * stars.length)];
        el.style.left = (e.clientX + (Math.random() * 14 - 7)) + 'px';
        el.style.top  = (e.clientY + (Math.random() * 14 - 7)) + 'px';
        el.style.fontSize = (Math.random() * 8 + 8) + 'px';

        const hue = 200 + Math.random() * 40;
        el.style.color = `hsl(${hue}, 80%, 70%)`;
        el.style.textShadow = `0 0 6px hsl(${hue}, 80%, 60%)`;

        document.body.appendChild(el);
        setTimeout(() => el.remove(), 700);
    });
}

function hideCursor() {
    document.getElementById('cursor-inner').classList.add('hidden-cursor');
    document.querySelectorAll('.star-particle').forEach(el => el.remove());
}

// ════════════════════════════════════
// Background particles
// ════════════════════════════════════
function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx    = canvas.getContext('2d');

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4,
        dx: (Math.random() - 0.5) * 0.35,
        dy: -Math.random() * 0.5 - 0.15,
        alpha: Math.random() * 0.5 + 0.1,
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(74,143,212,${p.alpha})`;
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.y < -5) {
                p.y = canvas.height + 5;
                p.x = Math.random() * canvas.width;
            }

            if (p.x < -5) p.x = canvas.width + 5;
            if (p.x > canvas.width + 5) p.x = -5;
        });

        requestAnimationFrame(draw);
    }

    draw();
}