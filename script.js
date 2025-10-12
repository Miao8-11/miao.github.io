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
        ctx.fillStyle = 'rgba(144, 174, 173, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
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
// FULLPAGE SCROLL SYSTEM
// ==========================================
class FullPageScroll {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        this.dots = document.querySelectorAll('.dot');
        this.navLinks = document.querySelectorAll('.nav-menu a');
        this.current = 0;
        this.isScrolling = false;
        
        this.init();
    }
    
    init() {
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
        
        // Touch events
        let touchStart = 0;
        window.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientY;
        });
        
        window.addEventListener('touchend', (e) => {
            const touchEnd = e.changedTouches[0].clientY;
            const diff = touchStart - touchEnd;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.next();
                else this.prev();
            }
        });
    }
    
    handleWheel(e) {
        if (this.isScrolling) return;
        
        const activeSection = this.sections[this.current];
        const atTop = activeSection.scrollTop === 0;
        const atBottom = activeSection.scrollHeight - activeSection.scrollTop <= activeSection.clientHeight + 1;
        
        if (e.deltaY > 0 && atBottom) {
            e.preventDefault();
            this.next();
        } else if (e.deltaY < 0 && atTop) {
            e.preventDefault();
            this.prev();
        }
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
        title: 'Ascending: Rising Global Artists', 
        genre: 'electronic',
        soundcloudUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1692024463&color=%23E64833&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true'
    },
    { title: 'Chill Waves', genre: 'chill' },
    { title: 'Rock Energy', genre: 'rock' },
    { title: 'Ambient Dreams', genre: 'ambient' },
    { title: 'Deep House', genre: 'electronic' },
    { title: 'Lofi Study', genre: 'chill' },
    { title: 'Indie Rock', genre: 'rock' },
    { title: 'Space Ambient', genre: 'ambient' }
];

function loadMusic() {
    const grid = document.getElementById('musicGrid');
    grid.innerHTML = '';
    
    musicTracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.dataset.genre = track.genre;
        
        card.innerHTML = `
            <div class="music-visual">
                <div class="equalizer">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </div>
            </div>
            <h4 class="track-title">${track.title}</h4>
            <p class="track-genre">${track.genre.toUpperCase()}</p>
            ${track.soundcloudUrl ? `
                <div class="soundcloud-player">
                    <iframe 
                        width="100%" 
                        height="166" 
                        scrolling="no" 
                        frameborder="no" 
                        allow="autoplay"
                        src="${track.soundcloudUrl}">
                    </iframe>
                </div>
            ` : ''}
        `;
        
        grid.appendChild(card);
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
    
    photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        
        card.innerHTML = `
            <img src="${photo.image}" alt="${photo.caption}" class="photo-img">
            <div class="photo-overlay">
                <p class="photo-caption">${photo.caption}</p>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

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
