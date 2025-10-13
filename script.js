// ==========================================
// THEME SWITCHER - 3个主题循环切换
// ==========================================
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// 主题列表
const themes = ['default', 'amori', 'vibrant'];
let currentThemeIndex = 0;

// 从 localStorage 加载主题
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'amori') {
    body.classList.add('theme-amori');
    currentThemeIndex = 1;
} else if (savedTheme === 'vibrant') {
    body.classList.add('theme-vibrant');
    currentThemeIndex = 2;
}

// 切换主题 - 3个主题循环
themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    
    // 移除所有主题类
    body.classList.remove('theme-amori', 'theme-vibrant');
    
    // 切换到下一个主题
    currentThemeIndex = (currentThemeIndex + 1) % 3;
    
    if (currentThemeIndex === 1) {
        body.classList.add('theme-amori');
        localStorage.setItem('theme', 'amori');
    } else if (currentThemeIndex === 2) {
        body.classList.add('theme-vibrant');
        localStorage.setItem('theme', 'vibrant');
    } else {
        localStorage.setItem('theme', 'default');
    }
    
    // 更新粒子颜色
    updateParticleColors();
});

// ==========================================
// PARTICLE BACKGROUND
// ==========================================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 80;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    
    draw() {
        const isAmori = body.classList.contains('theme-amori');
        const isVibrant = body.classList.contains('theme-vibrant');
        
        let color = 'rgba(144, 174, 173, 0.5)'; // Default
        if (isAmori) {
            color = 'rgba(101, 205, 200, 0.5)'; // Amori 青绿
        } else if (isVibrant) {
            color = 'rgba(242, 183, 5, 0.5)'; // Vibrant 金黄
        }
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateParticleColors() {
    // 粒子颜色会在下一帧自动更新
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ==========================================
// ROTATING CAT ANIMATION
// ==========================================
class RotatingCat {
    constructor() {
        this.cat = document.getElementById('catImage');
        this.rotation = 0;
        this.velocity = 0;
        this.friction = 0.95;
        this.lastScrollTop = 0;
        this.isSpinning = false;
        
        this.init();
    }
    
    init() {
        // Continuous animation loop
        this.animate();
    }
    
    animate() {
        // Apply friction to velocity
        this.velocity *= this.friction;
        
        // Update rotation
        this.rotation += this.velocity;
        
        // Apply rotation
        if (this.cat) {
            this.cat.style.transform = `rotate(${this.rotation}deg)`;
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    onScroll(deltaY) {
        // Add velocity based on scroll (降低速度系数)
        this.velocity += deltaY * 0.15;
    }
    
    spinTwice() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        const targetRotation = this.rotation + 720; // 2 full rotations
        const duration = 600; // milliseconds
        const startTime = Date.now();
        const startRotation = this.rotation;
        
        const spin = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth spin
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            this.rotation = startRotation + (720 * easeOutCubic);
            
            if (progress < 1) {
                requestAnimationFrame(spin);
            } else {
                this.isSpinning = false;
                this.velocity = 0;
            }
        };
        
        spin();
    }
}

// Initialize rotating cat
const rotatingCat = new RotatingCat();

// ==========================================
// FULLPAGE SCROLL SYSTEM
// ==========================================
class FullPageScroll {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        this.dots = document.querySelectorAll('.dot');
        this.navLinks = document.querySelectorAll('.nav-menu a');
        this.bottomNav = document.getElementById('bottomNav');
        this.bottomNavBtn = document.getElementById('bottomNavBtn');
        this.current = 0;
        this.isScrolling = false;
        
        this.init();
    }
    
    init() {
        // Bottom nav button click
        if (this.bottomNavBtn) {
            this.bottomNavBtn.addEventListener('click', () => this.next());
        }
        
        // Monitor scroll to show/hide bottom button
        this.sections.forEach(section => {
            section.addEventListener('scroll', () => this.checkBottomNav());
        });
        
        // Wheel event
        window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // Keyboard
        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Dots navigation
        this.dots.forEach((dot, i) => {
            dot.addEventListener('click', () => this.goTo(i));
        });
        
        // Nav links
        this.navLinks.forEach((link, i) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.goTo(i);
            });
        });
        
        // Touch events - 改进移动端滚动检测
        let touchStart = 0;
        let touchStartTime = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientY;
            touchStartTime = Date.now();
        });
        
        window.addEventListener('touchmove', (e) => {
            // 允许section内部滚动
            const activeSection = this.sections[this.current];
            const touchCurrent = e.touches[0].clientY;
            const diff = touchStart - touchCurrent;
            
            const atTop = activeSection.scrollTop === 0;
            const atBottom = activeSection.scrollHeight - activeSection.scrollTop <= activeSection.clientHeight + 10;
            
            // 只在边界时阻止默认行为
            if ((diff > 0 && atBottom) || (diff < 0 && atTop)) {
                // 不阻止，让touchend处理
            }
        });
        
        window.addEventListener('touchend', (e) => {
            if (this.isScrolling) return;
            
            const touchEnd = e.changedTouches[0].clientY;
            const diff = touchStart - touchEnd;
            const touchDuration = Date.now() - touchStartTime;
            
            const activeSection = this.sections[this.current];
            const atTop = activeSection.scrollTop === 0;
            const atBottom = activeSection.scrollHeight - activeSection.scrollTop <= activeSection.clientHeight + 10;
            
            // 滑动阈值和时间检测
            if (Math.abs(diff) > 80 && touchDuration < 400) {
                if (diff < 0 && atTop && this.current > 0) {
                    // 向下拉（切换到上一个section）
                    e.preventDefault();
                    this.prev();
                }
                // 向上拉不自动切换，需要点击底部按钮
            }
        });
    }
    
    checkBottomNav() {
        const activeSection = this.sections[this.current];
        const atBottom = activeSection.scrollHeight - activeSection.scrollTop <= activeSection.clientHeight + 10;
        const hasNext = this.current < this.sections.length - 1;
        
        if (this.bottomNav) {
            if (atBottom && hasNext) {
                this.bottomNav.classList.add('show');
            } else {
                this.bottomNav.classList.remove('show');
            }
        }
    }
    
    handleWheel(e) {
        // Rotate cat based on scroll
        rotatingCat.onScroll(e.deltaY);
        
        if (this.isScrolling) return;
        
        const activeSection = this.sections[this.current];
        const atTop = activeSection.scrollTop === 0;
        
        // 只在向上滚动到顶部时自动切换到上一个section
        if (e.deltaY < 0 && atTop) {
            e.preventDefault();
            this.prev();
        }
        
        // 向下滚动不自动切换，需要点击底部按钮
    }
    
    handleKeyboard(e) {
        if (this.isScrolling) return;
        
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            this.next();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            this.prev();
        }
    }
    
    next() {
        if (this.current < this.sections.length - 1) {
            this.goTo(this.current + 1);
        }
    }
    
    prev() {
        if (this.current > 0) {
            this.goTo(this.current - 1);
        }
    }
    
    goTo(index) {
        if (index === this.current || this.isScrolling) return;
        if (index < 0 || index >= this.sections.length) return;
        
        this.isScrolling = true;
        
        // Hide bottom nav during transition
        if (this.bottomNav) {
            this.bottomNav.classList.remove('show');
        }
        
        // Spin cat twice when changing sections
        rotatingCat.spinTwice();
        
        // Update sections
        this.sections[this.current].classList.remove('active');
        this.sections[index].classList.add('active');
        this.sections[index].scrollTop = 0;
        
        // Update dots
        this.dots[this.current].classList.remove('active');
        this.dots[index].classList.add('active');
        
        this.current = index;
        
        // Trigger animations
        this.animate(index);
        
        setTimeout(() => {
            this.isScrolling = false;
            // Check if bottom nav should show after transition
            this.checkBottomNav();
        }, 800);
    }
    
    animate(index) {
        const section = this.sections[index];
        const elements = section.querySelectorAll('.music-card, .photo-card, .game-card');
        
        elements.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }
}

// Initialize
new FullPageScroll();

// ==========================================
// TODAY'S MOOD SYSTEM
// ==========================================
const moods = {
    electronic: {
        color: '#E64833',
        description: 'Feeling energetic and futuristic'
    },
    chill: {
        color: '#90AEAD',
        description: 'Relaxed and peaceful vibes'
    },
    rock: {
        color: '#874F41',
        description: 'Raw energy and power'
    },
    ambient: {
        color: '#244855',
        description: 'Atmospheric and dreamy'
    }
};

function setTodaysMood() {
    const genres = Object.keys(moods);
    const day = new Date().getDay();
    const genre = genres[day % genres.length];
    
    document.getElementById('moodGenre').textContent = genre.toUpperCase();
    document.getElementById('moodDesc').textContent = moods[genre].description;
}

setTodaysMood();

// ==========================================
// MUSIC DATA
// ==========================================
const musicTracks = [
    { 
        title: 'My First Track', 
        genre: 'electronic',
        artist: 'Your Name',
        file: 'music/track1.mp3',
        cover: 'images/cover1.jpg'
    }
    // Add more tracks here following the same format:
    // { 
    //     title: 'Song Title', 
    //     genre: 'electronic', // or 'chill', 'rock', 'ambient'
    //     artist: 'Artist Name',
    //     file: 'music/track2.mp3',
    //     cover: 'images/cover2.jpg'
    // }
];

// Current playing audio
let currentAudio = null;
let currentPlayingCard = null;

function loadMusic() {
    const grid = document.getElementById('musicGrid');
    grid.innerHTML = '';
    
    musicTracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.dataset.genre = track.genre;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="music-cover" style="background-image: url('${track.cover}')">
                <div class="play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="music-info-box">
                <h4 class="track-title">${track.title}</h4>
                <p class="track-artist">${track.artist}</p>
                <p class="track-genre">${track.genre.toUpperCase()}</p>
            </div>
            <div class="audio-player">
                <audio src="${track.file}" preload="metadata"></audio>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="controls">
                    <button class="control-btn play-pause">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                    </button>
                    <span class="time-display">0:00 / 0:00</span>
                    <button class="control-btn volume-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
        initAudioPlayer(card, track);
    });
}

function initAudioPlayer(card, track) {
    const audio = card.querySelector('audio');
    const playPauseBtn = card.querySelector('.play-pause');
    const playIcon = card.querySelector('.play-icon');
    const pauseIcon = card.querySelector('.pause-icon');
    const progressBar = card.querySelector('.progress-bar');
    const progressFill = card.querySelector('.progress-fill');
    const timeDisplay = card.querySelector('.time-display');
    const playBtn = card.querySelector('.play-btn');
    const volumeBtn = card.querySelector('.volume-btn');
    
    // Format time
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Update time display
    audio.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
    });
    
    // Update progress
    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${progress}%`;
        timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });
    
    // Play/Pause toggle
    function togglePlay() {
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentPlayingCard.querySelector('.play-icon').style.display = 'block';
            currentPlayingCard.querySelector('.pause-icon').style.display = 'none';
            currentPlayingCard.classList.remove('playing');
        }
        
        if (audio.paused) {
            audio.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            card.classList.add('playing');
            currentAudio = audio;
            currentPlayingCard = card;
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            card.classList.remove('playing');
        }
    }
    
    playPauseBtn.addEventListener('click', togglePlay);
    playBtn.addEventListener('click', togglePlay);
    
    // Progress bar click
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });
    
    // Volume toggle
    volumeBtn.addEventListener('click', () => {
        audio.muted = !audio.muted;
        volumeBtn.style.opacity = audio.muted ? '0.5' : '1';
    });
    
    // Auto pause when ended
    audio.addEventListener('ended', () => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        card.classList.remove('playing');
        progressFill.style.width = '0%';
        audio.currentTime = 0;
    });
}

// Music filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        const cards = document.querySelectorAll('.music-card');
        
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.genre === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

loadMusic();

// ==========================================
// PHOTOS DATA
// ==========================================
const photos = [
    { image: 'images/photo1.svg', caption: 'Sunset Vibes' },
    { image: 'images/photo2.svg', caption: 'Ocean Dreams' },
    { image: 'images/photo3.svg', caption: 'Mountain Peak' },
    { image: 'images/photo4.svg', caption: 'City Lights' },
    { image: 'images/photo5.svg', caption: 'Abstract Art' },
    { image: 'images/photo6.svg', caption: 'Flowing Lines' }
];

function loadPhotos() {
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.photoIndex = index;
        
        card.innerHTML = `
            <img src="${photo.image}" alt="${photo.caption}" class="photo-img">
            <div class="photo-overlay">
                <p class="photo-caption">${photo.caption}</p>
            </div>
        `;
        
        // 点击照片打开灯箱
        card.addEventListener('click', () => openLightbox(index));
        
        grid.appendChild(card);
    });
}

// 灯箱功能
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(index) {
    const photo = photos[index];
    lightboxImg.src = photo.image;
    lightboxImg.alt = photo.caption;
    lightboxCaption.textContent = photo.caption;
    
    // 显示灯箱
    lightbox.style.display = 'flex';
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(() => {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// 关闭按钮
lightboxClose.addEventListener('click', closeLightbox);

// 点击背景关闭
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// ESC 键关闭
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

loadPhotos();

// ==========================================
// GAMES DATA
// ==========================================
const games = [
    {
        title: 'Epic Adventure',
        description: 'An epic journey through mystical lands filled with wonder and danger.',
        image: 'images/game1.svg',
        tags: ['RPG', 'Adventure', 'Fantasy']
    },
    {
        title: 'Cyber Future',
        description: 'A futuristic cyberpunk world where technology meets humanity.',
        image: 'images/game1.svg',
        tags: ['Action', 'Sci-Fi', 'Open World']
    },
    {
        title: 'Retro Warriors',
        description: 'Classic retro-style combat with modern mechanics.',
        image: 'images/game1.svg',
        tags: ['Platformer', 'Retro', 'Action']
    },
    {
        title: 'Strategy Master',
        description: 'Build your empire and conquer the world.',
        image: 'images/game1.svg',
        tags: ['Strategy', 'Simulation', 'War']
    }
];

function loadGames() {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = '';
    
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        const tags = game.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        card.innerHTML = `
            <img src="${game.image}" alt="${game.title}" class="game-img">
            <div class="game-overlay">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-desc">${game.description}</p>
                <div class="game-tags">${tags}</div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

loadGames();

console.log('%c✨ Personal Blog Loaded', 'color: #FBE9D0; font-size: 16px; font-weight: bold;');
