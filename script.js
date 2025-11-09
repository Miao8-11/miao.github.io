// ==========================================
// ENTRANCE ANIMATION - 进入动画控制
// ==========================================
const entranceOverlay = document.getElementById('entranceOverlay');
const body = document.body;

// 页面加载时立即添加类名以隐藏网站内容（防止闪现）
// body标签在HTML中已经添加了entrance-active类
// 这里确保覆盖层存在
if (!entranceOverlay) {
    // 如果覆盖层不存在，确保界面元素保持隐藏
    body.classList.add('entrance-active');
}

// 页面加载完成后，延迟移除进入动画覆盖层并触发分阶段淡入
window.addEventListener('load', () => {
    setTimeout(() => {
        if (entranceOverlay) {
            entranceOverlay.style.display = 'none';
            entranceOverlay.style.visibility = 'hidden';
            entranceOverlay.style.opacity = '0';
            body.classList.remove('entrance-active');
            body.classList.add('page-ready'); // 添加类名以触发分阶段淡入动画
            body.classList.add('background-visible'); // 确保背景图显示
        }
    }, 2000); // 与动画时长一致（2秒）
});

// ==========================================
// THEME SWITCHER - 2个主题切换
// ==========================================
const themeToggle = document.getElementById('themeToggle');

// 主题列表：Vibrant (默认) 和 Pastel
const themes = ['vibrant', 'pastel'];
let currentThemeIndex = 0;

// 从 localStorage 加载主题
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'pastel') {
    body.classList.add('theme-pastel');
    currentThemeIndex = 1;
}

// 切换主题 - 2个主题循环
themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    
    // 切换到下一个主题
    currentThemeIndex = (currentThemeIndex + 1) % 2;
    
    if (currentThemeIndex === 1) {
        // 切换到 Pastel
        body.classList.add('theme-pastel');
        localStorage.setItem('theme', 'pastel');
    } else {
        // 切换回 Vibrant (默认)
        body.classList.remove('theme-pastel');
        localStorage.setItem('theme', 'vibrant');
    }
    
});

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
        
        // Monitor scroll to show/hide bottom button - 节流处理
        let scrollTimeout = null;
        this.sections.forEach(section => {
            section.addEventListener('scroll', () => {
                if (scrollTimeout) return;
                scrollTimeout = setTimeout(() => {
                    this.checkBottomNav();
                    scrollTimeout = null;
                }, 100); // 每100ms最多执行一次
            }, { passive: true });
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
    for_you: {
        color: '#90AEAD',
        description: 'Handpicked songs just for you'
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
    { title: "Somethin' Stupid", artist: 'Frank & Nancy Sinatra', genre: 'for_you', file: 'music/track1.mp3', cover: 'images/cover1.jpg' },
    { title: 'Plastic Love', artist: 'Mariya Takeuchi', genre: 'for_you', file: 'music/track2.mp3', cover: 'images/cover2.jpg' },
    { title: 'Where Have You Been', artist: 'Rihanna', genre: 'for_you', file: 'music/track3.mp3', cover: 'images/cover3.jpg' },
    { title: 'Piccola stella', artist: 'Ultimo', genre: 'for_you', file: 'music/track4.mp3', cover: 'images/cover4.jpg' },
    { title: 'If Not for You', artist: 'Måneskin', genre: 'for_you', file: 'music/track5.mp3', cover: 'images/cover5.jpg' },
    { title: 'La boda', artist: 'Camilo', genre: 'for_you', file: 'music/track6.mp3', cover: 'images/cover6.jpg' },
    { title: "Nothing's Gonna Hurt You Baby", artist: 'Cigarettes After Sex', genre: 'for_you', file: 'music/track7.mp3', cover: 'images/cover7.jpg' },
    { title: "Let's Skip to the Wedding", artist: 'Eyedress', genre: 'for_you', file: 'music/track8.mp3', cover: 'images/cover8.jpg' },
    { title: 'Heaven Can Wait', artist: 'Michael Jackson', genre: 'for_you', file: 'music/track9.mp3', cover: 'images/cover9.jpg' },
    { title: 'Intolewd', artist: 'Matt Maltese', genre: 'for_you', file: 'music/track10.mp3', cover: 'images/cover10.jpg' },
    { title: "All I'm Looking For", artist: 'Lea Rockrose', genre: 'for_you', file: 'music/track11.mp3', cover: 'images/cover11.jpg' },
    { title: 'Cupid’s Chokehold', artist: 'Gym Class Heroes', genre: 'for_you', file: 'music/track12.mp3', cover: 'images/cover12.jpg' },
    { title: 'Cherry Waves', artist: 'Deftones', genre: 'for_you', file: 'music/track13.mp3', cover: 'images/cover13.jpg' },
    { title: 'Heart to Heart', artist: 'Mac DeMarco', genre: 'for_you', file: 'music/track14.mp3', cover: 'images/cover14.jpg' },
    { title: 'Impacto', artist: 'Enjambre', genre: 'for_you', file: 'music/track15.mp3', cover: 'images/cover15.jpg' },
    { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', genre: 'for_you', file: 'music/track16.mp3', cover: 'images/cover16.jpg' },
    { title: 'Things That Make It Warm', artist: 'Cavetown', genre: 'for_you', file: 'music/track17.mp3', cover: 'images/cover17.jpg' },
    { title: 'Just the Two of Us', artist: 'Bill Withers', genre: 'for_you', file: 'music/track18.mp3', cover: 'images/cover18.jpg' },
    { title: 'Something About You', artist: 'Eyedress & Dent May', genre: 'for_you', file: 'music/track19.mp3', cover: 'images/cover19.jpg' },
    { title: 'you.', artist: 'Oscar Lang', genre: 'for_you', file: 'music/track20.mp3', cover: 'images/cover20.jpg' },
    { title: 'For the First Time', artist: 'Mac DeMarco', genre: 'for_you', file: 'music/track21.mp3', cover: 'images/cover21.jpg' },
    { title: 'Everyone Adores You (At Least I Do)', artist: 'Matt Maltese', genre: 'for_you', file: 'music/track22.mp3', cover: 'images/cover22.jpg' },
    { title: 'Frog', artist: 'Cavetown', genre: 'for_you', file: 'music/track23.mp3', cover: 'images/cover23.jpg' },
    { title: 'Stay With Me', artist: 'Miki Matsubara', genre: 'for_you', file: 'music/track24.mp3', cover: 'images/cover24.jpg' },
    { title: 'we fell in love in october', artist: 'girl in red', genre: 'for_you', file: 'music/track25.mp3', cover: 'images/cover25.jpg' },
    { title: 'Golden Brown', artist: 'The Stranglers', genre: 'for_you', file: 'music/track26.mp3', cover: 'images/cover26.jpg' },
    { title: 'I Love You', artist: 'Fontaines D.C.', genre: 'for_you', file: 'music/track27.mp3', cover: 'images/cover27.jpg' },
    { title: "Can't Take My Eyes Off You", artist: 'Frankie Valli', genre: 'for_you', file: 'music/track28.mp3', cover: 'images/cover28.jpg' },
    { title: 'Pretty Boy', artist: 'The Neighbourhood', genre: 'for_you', file: 'music/track29.mp3', cover: 'images/cover29.jpg' },
    { title: 'did i tell you that i miss you', artist: 'Adore', genre: 'for_you', file: 'music/track30.mp3', cover: 'images/cover30.jpg' },
    { title: 'Dream girl', artist: 'Cruisant', genre: 'for_you', file: 'music/track31.mp3', cover: 'images/cover31.jpg' },
    { title: 'Until I found you', artist: 'Stephen Sanchez', genre: 'for_you', file: 'music/track32.mp3', cover: 'images/cover32.jpg' },
    { title: 'Hey lover', artist: 'The Daughters of Eve', genre: 'for_you', file: 'music/track33.mp3', cover: 'images/cover33.jpg' }
];

// Current playing audio
let currentAudio = null;
let currentPlayingCard = null;
const nowPlayingBar = document.getElementById('nowPlaying');
const navEl = document.querySelector('.nav');
// 全局音频对象数组，用于防止多首歌同时播放
const allAudioObjects = [];

// Playback modes: 'single' (单曲重播), 'shuffle' (随机播放), 'sequential' (顺序播放)
let playbackMode = 'sequential';
// 全局按钮点击音效 & 老收音机音效
const buttonClickSfx = new Audio('button_sound/button-click.mp3');
buttonClickSfx.volume = 0.35;
const radioClickSfx = new Audio('button_sound/old-radio-button-click.mp3');
radioClickSfx.volume = 0.6;
let nextPlayShouldRadioClick = true; // 首次手动播放前先播 old radio 音效
let isAutoAdvance = false;
let isRadioSfxPlaying = false;
let bongoShown = false; // 仅触发一次的提示
let pendingRadioAudio = null; // 正在等待radio音效播放完成的音频对象

// ===================== Mobile Lock Screen / Media Session =====================
let mediaSessionHandlersSet = false;

// ===================== 文字滚动功能 =====================
function setupScrollingText(scrollElement, wrapperElement) {
    if (!scrollElement || !wrapperElement) return;
    
    // 等待DOM渲染完成
    setTimeout(() => {
        const wrapperWidth = wrapperElement.offsetWidth;
        const scrollWidth = scrollElement.scrollWidth;
        
        if (scrollWidth > wrapperWidth) {
            // 文字溢出，启用滚动
            const overflow = scrollWidth - wrapperWidth;
            const duration = scrollElement.classList.contains('player__legend__title-scroll') ? 15 : 12; // 播放器15秒，歌曲列表12秒
            const pauseTime = 2; // 开始和结束的暂停时间（秒）
            
            // 计算滚动距离
            const scrollDistance = overflow + 20; // 多滚动一点确保完全显示
            
            // 设置CSS变量来动态控制滚动距离
            scrollElement.style.setProperty('--scroll-distance', `-${scrollDistance}px`);
            scrollElement.style.setProperty('--scroll-duration', `${duration}s`);
            
            // 确定动画名称
            let animationName = 'scrollText';
            if (scrollElement.classList.contains('track-title-scroll')) {
                animationName = 'scrollTextTrack';
            } else if (scrollElement.classList.contains('track-artist-scroll')) {
                animationName = 'scrollTextArtist';
            }
            
            // 更新动画关键帧（使用唯一ID避免冲突）
            const styleId = `dynamic-scroll-${animationName}`;
            let style = document.getElementById(styleId);
            if (!style) {
                style = document.createElement('style');
                style.id = styleId;
                document.head.appendChild(style);
            }
            
            const pausePercent = (pauseTime / duration * 100).toFixed(2);
            const scrollEndPercent = ((duration - pauseTime) / duration * 100).toFixed(2);
            
            style.textContent = `
                @keyframes ${animationName} {
                    0% { transform: translateX(0); }
                    ${pausePercent}% { transform: translateX(0); }
                    ${scrollEndPercent}% { transform: translateX(var(--scroll-distance)); }
                    100% { transform: translateX(var(--scroll-distance)); }
                }
            `;
            
            // 设置动画名称
            scrollElement.style.animationName = animationName;
            scrollElement.classList.add('scrolling');
        } else {
            scrollElement.classList.remove('scrolling');
        }
    }, 100);
}

function getCoverUrlByIndex(index) {
    // 与渲染卡片时一致：第1首保持原样，其余使用 cover{index+1}.jpg
    if (index >= 1) {
        return `images/cover${index + 1}.jpg`;
    }
    const t = musicTracks[index];
    return (t && t.cover) ? t.cover : 'images/cover1.jpg';
}

function updateMediaSession(track, coverUrl) {
    if (!('mediaSession' in navigator) || !track) return;
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title || '',
            artist: track.artist || '',
            album: 'For You',
            artwork: [
                { src: coverUrl, sizes: '256x256', type: 'image/jpeg' },
                { src: coverUrl, sizes: '512x512', type: 'image/jpeg' }
            ]
        });
        if (currentAudio) {
            navigator.mediaSession.playbackState = currentAudio.paused ? 'paused' : 'playing';
        }
        if (!mediaSessionHandlersSet) {
            navigator.mediaSession.setActionHandler('play', () => {
                if (currentAudio && currentAudio.paused) currentAudio.play().catch(()=>{});
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                if (currentAudio && !currentAudio.paused) currentAudio.pause();
            });
            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                if (!currentAudio) return;
                const step = (details && details.seekOffset) || 10;
                currentAudio.currentTime = Math.min(currentAudio.currentTime + step, currentAudio.duration || currentAudio.currentTime);
            });
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                if (!currentAudio) return;
                const step = (details && details.seekOffset) || 10;
                currentAudio.currentTime = Math.max(currentAudio.currentTime - step, 0);
            });
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (!currentAudio || !details || details.seekTime == null) return;
                currentAudio.currentTime = Math.max(0, Math.min(details.seekTime, currentAudio.duration || details.seekTime));
            });
            mediaSessionHandlersSet = true;
        }
    } catch (e) {
        // ignore
    }
}

function setNowPlayingTop() {
    if (!nowPlayingBar || !navEl) return;
    const h = navEl.getBoundingClientRect().height;
    nowPlayingBar.style.top = h + 'px';
}

window.addEventListener('resize', setNowPlayingTop);
setTimeout(setNowPlayingTop, 0);

function showNowPlaying(track, coverUrl, isPlaying) {
    if (!nowPlayingBar) return;
    const title = track.title || '';
    const artist = track.artist || '';
    const cover = coverUrl || '';
    
    // 模式图标映射
    const modeIcons = {
        'single': '🔁',
        'shuffle': '🔀',
        'sequential': '▶️'
    };
    
    nowPlayingBar.innerHTML = `
        <div class="glass-container glass-container--large">
            <div class="glass-filter"></div>
            <div class="glass-overlay"></div>
            <div class="glass-specular"></div>
            <div class="glass-content glass-content--inline player">
                <div class="player__legend">
                    <div class="player__legend__title-scroll-wrapper">
                        <p class="player__legend__title">
                            <span class="player__legend__title-scroll">${title} - ${artist}</span>
                        </p>
                    </div>
                    <p class="player__legend__sub-title"></p>
                </div>
                <div class="player__controls">
                    <button class="np-btn np-mode" title="播放模式: ${playbackMode === 'single' ? '单曲重播' : playbackMode === 'shuffle' ? '随机播放' : '顺序播放'}">${modeIcons[playbackMode]}</button>
                    <button class="np-btn np-toggle" title="${isPlaying ? 'Pause' : 'Play'}">${isPlaying ? '❚❚' : '▶'}</button>
                </div>
            </div>
        </div>
    `;
    // 设置滚动动画
    setupScrollingText(nowPlayingBar.querySelector('.player__legend__title-scroll'), nowPlayingBar.querySelector('.player__legend__title-scroll-wrapper'));
    // 重置动画状态，确保每次显示都能触发淡入
    nowPlayingBar.style.animation = 'none';
    nowPlayingBar.style.display = 'flex';
    setNowPlayingTop();
    // 强制重排，然后重新应用动画
    void nowPlayingBar.offsetWidth;
    nowPlayingBar.style.animation = '';

    const toggleBtn = nowPlayingBar.querySelector('.np-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            // 这个按钮不播放 button-click 音效
            e.stopPropagation();
            if (currentAudio) {
                if (currentAudio.paused) {
                    currentAudio.play().catch(()=>{});
                    toggleBtn.textContent = '❚❚';
                    toggleBtn.title = 'Pause';
                } else {
                    currentAudio.pause();
                    toggleBtn.textContent = '▶';
                    toggleBtn.title = 'Play';
                }
            }
        });
    }
    
    const modeBtn = nowPlayingBar.querySelector('.np-mode');
    if (modeBtn) {
        modeBtn.addEventListener('click', () => {
            // 循环切换模式: sequential -> shuffle -> single -> sequential
            if (playbackMode === 'sequential') {
                playbackMode = 'shuffle';
            } else if (playbackMode === 'shuffle') {
                playbackMode = 'single';
            } else {
                playbackMode = 'sequential';
            }
            modeBtn.textContent = modeIcons[playbackMode];
            modeBtn.title = `播放模式: ${playbackMode === 'single' ? '单曲重播' : playbackMode === 'shuffle' ? '随机播放' : '顺序播放'}`;
            
            // 显示模式提示
            showModeToast(playbackMode);
        });
    }
}

// 显示播放模式提示（英文，淡出效果）
function showModeToast(mode) {
    // 移除已存在的提示
    const existingToast = document.querySelector('.mode-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const modeTexts = {
        'single': 'Single Repeat',
        'shuffle': 'Shuffle',
        'sequential': 'Sequential'
    };
    
    const toast = document.createElement('div');
    toast.className = 'mode-toast';
    toast.textContent = modeTexts[mode] || mode;
    document.body.appendChild(toast);
    
    // 触发显示动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 动画结束后移除
    setTimeout(() => {
        toast.remove();
    }, 2100);
}

function hideNowPlaying() {
    if (!nowPlayingBar) return;
    nowPlayingBar.style.display = 'none';
    nowPlayingBar.style.animation = 'none'; // 重置动画，确保下次显示时重新触发
}

// 显示顶部 BongoCat 提示（飞到 vibe-cat.gif 位置并触发显示，仅触发一次）
function showEmojiNotification() {
    if (bongoShown) return;
    bongoShown = true;
    
    // 创建全屏遮罩层，禁用所有用户交互
    const interactionBlocker = document.createElement('div');
    interactionBlocker.id = 'interactionBlocker';
    interactionBlocker.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        pointer-events: auto;
        background: transparent;
        cursor: wait;
    `;
    document.body.appendChild(interactionBlocker);
    
    // 禁用 body 的交互
    document.body.style.pointerEvents = 'none';
    document.body.style.userSelect = 'none';
    
    // 找到目标位置（mood-card 中的 vibe-cat.gif）
    const moodCard = document.querySelector('.mood-card');
    if (!moodCard) return;
    
    const notification = document.createElement('img');
    notification.className = 'emoji-notification';
    notification.src = 'bongocat.png';
    notification.alt = 'Bongo Cat';
    document.body.appendChild(notification);
    
    // 计算目标位置（使用绝对位置，考虑滚动）
    const getTargetPosition = () => {
        const rect = moodCard.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        return {
            x: rect.left + scrollLeft + rect.width / 2,
            y: rect.top + scrollTop + rect.height / 2
        };
    };
    
    const targetPos = getTargetPosition();
    
    // 设置目标位置作为 CSS 变量（相对于视口）
    const targetRect = moodCard.getBoundingClientRect();
    notification.style.setProperty('--target-x', `${targetRect.left + targetRect.width / 2}px`);
    notification.style.setProperty('--target-y', `${targetRect.top + targetRect.height / 2}px`);
    
    // 找到 mood-card 所在的 section
    const musicSection = document.querySelector('.section[data-section="1"]');
    const musicSectionIndex = 1;
    
    // 检查当前是否在 Music section
    const currentSection = document.querySelector('.section.active');
    const isInMusicSection = currentSection && currentSection.dataset.section === '1';
    
    // 如果不在 Music section，先切换过去
    if (!isInMusicSection) {
        // 找到所有 section 并切换
        const allSections = document.querySelectorAll('.section');
        allSections.forEach((s, i) => {
            if (i === musicSectionIndex) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        // 更新 dots
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            if (i === musicSectionIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    let scrollStarted = false;
    let scrollStartTime = null;
    
    let scrollAnimationId = null;
    function checkAndStartScroll(currentTime) {
        // 在中间位置（60%进度，约2.7秒）开始跟随
        const elapsed = currentTime - animationStartTime;
        const progress = elapsed / 4500; // 总动画时长4.5秒
        
        if (progress >= 0.6 && !scrollStarted) {
            scrollStarted = true;
            scrollStartTime = currentTime;
            
            // 在 section 内部平滑滚动到目标位置
            const section = musicSection;
            if (!section) return;
            
            // 计算目标滚动位置：让 mood-card 位于屏幕中央
            const targetRect = moodCard.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            // 目标：mood-card 中心在屏幕中央
            const targetCenterY = window.innerHeight / 2;
            const cardCenterY = targetRect.top + targetRect.height / 2;
            const scrollOffset = cardCenterY - targetCenterY;
            const targetScrollTop = section.scrollTop + scrollOffset;
            
            const startScrollTop = section.scrollTop;
            const scrollDistance = targetScrollTop - startScrollTop;
            const scrollDuration = 1800; // 剩余1.8秒用于滚动
            
            function smoothScroll(scrollTime) {
                const scrollElapsed = scrollTime - scrollStartTime;
                const scrollProgress = Math.min(scrollElapsed / scrollDuration, 1);
                // 使用平滑的缓动函数
                const easeProgress = scrollProgress < 0.5 
                    ? 2 * scrollProgress * scrollProgress 
                    : 1 - Math.pow(-2 * scrollProgress + 2, 3) / 2;
                
                // 计算当前应该滚动到的位置
                const currentScrollTop = startScrollTop + scrollDistance * easeProgress;
                section.scrollTop = currentScrollTop;
                
                // 动态更新目标位置（相对于视口）
                const newRect = moodCard.getBoundingClientRect();
                notification.style.setProperty('--target-x', `${newRect.left + newRect.width / 2}px`);
                notification.style.setProperty('--target-y', `${newRect.top + newRect.height / 2}px`);
                
                // 检查动画总进度
                const totalElapsed = scrollTime - animationStartTime;
                const totalProgress = totalElapsed / 4500;
                
                if (scrollProgress < 1 && totalProgress < 0.95) {
                    scrollAnimationId = requestAnimationFrame(smoothScroll);
                }
            }
            
            requestAnimationFrame(smoothScroll);
        }
        
        // 动态更新目标位置（即使还没开始滚动）
        if (progress < 0.95) {
            const newRect = moodCard.getBoundingClientRect();
            notification.style.setProperty('--target-x', `${newRect.left + newRect.width / 2}px`);
            notification.style.setProperty('--target-y', `${newRect.top + newRect.height / 2}px`);
            
            requestAnimationFrame(checkAndStartScroll);
        }
    }
    
    // 启动飞行动画
    const animationStartTime = performance.now();
    requestAnimationFrame(() => {
        notification.classList.add('drop');
        requestAnimationFrame(checkAndStartScroll);
    });
    
    // 动画结束后触发 vibe-cat 显示并移除 Bongo Cat
    notification.addEventListener('animationend', () => {
        // 触发 vibe-cat.gif 的弹出动画（如果还没显示）
        const vibeIcon = document.querySelector('.mood-icon.vibe');
        if (vibeIcon && !vibeIcon.classList.contains('pop')) {
            vibeIcon.classList.add('pop');
            
            // 等待 vibe-cat 弹出动画完成后再恢复交互
            vibeIcon.addEventListener('animationend', () => {
                // 恢复用户交互
                document.body.style.pointerEvents = '';
                document.body.style.userSelect = '';
                
                // 移除遮罩层
                const blocker = document.getElementById('interactionBlocker');
                if (blocker && blocker.parentNode) {
                    blocker.parentNode.removeChild(blocker);
                }
            }, { once: true });
        } else {
            // 如果 vibe-cat 已经弹出，立即恢复交互
            document.body.style.pointerEvents = '';
            document.body.style.userSelect = '';
            const blocker = document.getElementById('interactionBlocker');
            if (blocker && blocker.parentNode) {
                blocker.parentNode.removeChild(blocker);
            }
        }
        
        // 移除 Bongo Cat
        if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, { once: true });
}

function loadMusic() {
    const grid = document.getElementById('musicGrid');
    grid.innerHTML = '';
    
    musicTracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.dataset.genre = track.genre;
        card.dataset.index = index;
        
        // 封面映射：第1首保持原样；第2-30首映射到 cover2.jpg ~ cover30.jpg
        const coverPath = index >= 1
            ? `images/cover${index + 1}.jpg`
            : (track.cover || 'images/cover1.jpg');
        
        // 音频映射：第1首使用 track1.mp3；第2-30首使用 track2.mp3 ~ track30.mp3
        const audioPath = index === 0
            ? 'music/track1.mp3'
            : `music/track${index + 1}.mp3`;
        
        card.innerHTML = `
            <div class="music-cover" style="background-image: url('${coverPath}')">
                <div class="play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="music-info-box">
                <div class="track-title-scroll-wrapper">
                    <h4 class="track-title">
                        <span class="track-title-scroll">${track.title}</span>
                    </h4>
                </div>
                <div class="track-artist-scroll-wrapper">
                    <p class="track-artist">
                        <span class="track-artist-scroll">${track.artist}</span>
                    </p>
                </div>
                <p class="track-genre">${track.genre.toUpperCase()}</p>
            </div>
            <div class="audio-player">
                <audio src="${audioPath}" preload="metadata"></audio>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                    <div class="progress-ball"></div>
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
    // 将音频对象添加到全局数组
    if (audio && !allAudioObjects.includes(audio)) {
        allAudioObjects.push(audio);
    }
    const playPauseBtn = card.querySelector('.play-pause');
    const playIcon = card.querySelector('.play-icon');
    const pauseIcon = card.querySelector('.pause-icon');
    // 使用符号替代SVG
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'none';
    let ppSymbol = playPauseBtn.querySelector('.pp-symbol');
    if (!ppSymbol) {
        ppSymbol = document.createElement('span');
        ppSymbol.className = 'pp-symbol';
        ppSymbol.textContent = '▶';
        playPauseBtn.appendChild(ppSymbol);
    }
    // 指定特殊按钮使用 old-radio 音效（示例：第1张卡片）
    if (Number(card.dataset.index) === 0) {
        ppSymbol.dataset.radioTrigger = '1';
    }
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
        if (!audio.duration) return;
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${progress}%`;
        timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        
        // 更新粉色小球位置
        const progressBall = card.querySelector('.progress-ball');
        if (progressBall) {
            progressBall.style.left = `${progress}%`;
        }
        // 持续同步 Media Session 播放状态
        if ('mediaSession' in navigator) {
            try { navigator.mediaSession.playbackState = audio.paused ? 'paused' : 'playing'; } catch(e) {}
        }
    });
    
    // Play/Pause toggle
    function togglePlay() {
        const isSwitchingTrack = currentAudio && currentAudio !== audio;
        
        // 如果正在切换歌曲，立即停止并取消radio音效的回调
        if (isSwitchingTrack || (pendingRadioAudio && pendingRadioAudio !== audio)) {
            // 停止radio音效
            if (isRadioSfxPlaying) {
                radioClickSfx.pause();
                radioClickSfx.currentTime = 0;
                radioClickSfx.onended = null; // 清除回调
                isRadioSfxPlaying = false;
            }
            // 停止等待radio音效的音频
            if (pendingRadioAudio && pendingRadioAudio !== audio) {
                pendingRadioAudio.pause();
                pendingRadioAudio.currentTime = 0;
                const pendingCard = Array.from(document.querySelectorAll('.music-card')).find(c => c.querySelector('audio') === pendingRadioAudio);
                if (pendingCard) {
                    pendingCard.classList.remove('playing');
                    const pendingBtn = pendingCard.querySelector('.play-pause .pp-symbol');
                    if (pendingBtn) pendingBtn.textContent = '▶';
                }
                pendingRadioAudio = null;
            }
        }
        
        // 停止所有正在播放的音频，防止多首歌同时播放
        allAudioObjects.forEach(aud => {
            if (aud && !aud.paused && aud !== audio) {
                aud.pause();
                aud.currentTime = 0; // 重置进度
            }
        });
        
        // 移除所有卡片的playing状态
        document.querySelectorAll('.music-card.playing').forEach(c => {
            if (c !== card) {
                c.classList.remove('playing');
                const btn = c.querySelector('.play-pause .pp-symbol');
                if (btn) btn.textContent = '▶';
            }
        });
        
        if (isSwitchingTrack) {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            const prevBtn = currentPlayingCard?.querySelector('.play-pause .pp-symbol');
            if (prevBtn) prevBtn.textContent = '▶';
            if (currentPlayingCard) currentPlayingCard.classList.remove('playing');
        }
        
        if (audio.paused) {
            // 手动切换歌曲时也需要播放 old radio 音效
            const needRadio = (!!ppSymbol.dataset.radioTrigger || nextPlayShouldRadioClick || (isSwitchingTrack && !isAutoAdvance)) && !isAutoAdvance;

            const startSong = () => {
                // 再次检查是否应该播放（防止在radio音效期间被其他歌曲覆盖）
                // 如果pendingRadioAudio已被设置为其他音频，说明用户已经切换了歌曲，不播放
                if (pendingRadioAudio !== null && pendingRadioAudio !== audio) {
                    return; // 如果已经被其他歌曲替换，不播放
                }
                pendingRadioAudio = null; // 清除等待状态
                audio.play().catch(()=>{});
                if (ppSymbol) ppSymbol.textContent = '❚❚';
                card.classList.add('playing');
                currentAudio = audio;
                currentPlayingCard = card;
                const idx = Number(card.dataset.index);
                const trackData = musicTracks[idx];
                const coverUrl = getCoverUrlByIndex(idx);
                showNowPlaying(trackData, coverUrl, true);
                updateMediaSession(trackData, coverUrl);
                nextPlayShouldRadioClick = false;
                
                // 替换 mood-icon SVG 为 vibe-cat.gif
                const moodIcon = document.querySelector('.mood-icon');
                if (moodIcon && !moodIcon.dataset.originalType) {
                    moodIcon.dataset.originalType = 'svg';
                    const parent = moodIcon.parentElement;
                    const img = document.createElement('img');
                    img.src = 'vibe-cat.gif';
                    img.className = 'mood-icon vibe';
                    img.alt = 'Vibe Cat';
                    // 尺寸交由 CSS 控制，避免超出 mood-card
                    parent.replaceChild(img, moodIcon);
                    
                    // 显示顶部 BongoCat 提示（仅一次）
                    showEmojiNotification();
                }
            };

            if (needRadio && !isRadioSfxPlaying) {
                isRadioSfxPlaying = true;
                pendingRadioAudio = audio; // 标记这个音频正在等待radio音效
                try {
                    radioClickSfx.currentTime = 0;
                    radioClickSfx.onended = () => { 
                        isRadioSfxPlaying = false;
                        // 检查是否仍然是等待的音频（防止在radio音效期间被替换）
                        if (pendingRadioAudio === audio) {
                            startSong();
                        } else {
                            pendingRadioAudio = null;
                        }
                    };
                    radioClickSfx.play().catch(()=>{ 
                        isRadioSfxPlaying = false;
                        if (pendingRadioAudio === audio) {
                            startSong();
                        } else {
                            pendingRadioAudio = null;
                        }
                    });
                } catch(e) { 
                    isRadioSfxPlaying = false;
                    if (pendingRadioAudio === audio) {
                        startSong();
                    } else {
                        pendingRadioAudio = null;
                    }
                }
            } else {
                startSong();
            }
        } else {
            audio.pause();
            if (ppSymbol) ppSymbol.textContent = '▶';
            card.classList.remove('playing');
            // 如果没有任何播放则隐藏
            setTimeout(() => {
                if (!currentAudio || currentAudio.paused) {
                    hideNowPlaying();
                    // 恢复 mood-icon 为 SVG
                    const moodIcon = document.querySelector('.mood-icon');
                    if (moodIcon && moodIcon.tagName === 'IMG' && moodIcon.src.includes('vibe-cat.gif')) {
                        const parent = moodIcon.parentElement;
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.setAttribute('class', 'mood-icon');
                        svg.setAttribute('viewBox', '0 0 24 24');
                        svg.setAttribute('fill', 'none');
                        svg.setAttribute('stroke', 'currentColor');
                        svg.setAttribute('stroke-width', '2');
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', 'M9 18V5l12-2v13');
                        svg.appendChild(path);
                        const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        circle1.setAttribute('cx', '6');
                        circle1.setAttribute('cy', '18');
                        circle1.setAttribute('r', '3');
                        svg.appendChild(circle1);
                        const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        circle2.setAttribute('cx', '18');
                        circle2.setAttribute('cy', '16');
                        circle2.setAttribute('r', '3');
                        svg.appendChild(circle2);
                        parent.replaceChild(svg, moodIcon);
                    }
                }
            }, 0);
            // 更新播放状态
            updateMediaSession(musicTracks[Number(card.dataset.index)], getCoverUrlByIndex(Number(card.dataset.index)));
            nextPlayShouldRadioClick = true;
        }
    }
    
    playPauseBtn.addEventListener('click', (e) => {
        // 播放按钮不播放 button-click 音效
        togglePlay();
    });
    playBtn.addEventListener('click', (e) => {
        // 封面上的播放按钮也不播放 button-click 音效
        togglePlay();
    });
    
    // Progress bar drag functionality
    let isDragging = false;
    
    function updateProgress(e) {
        if (!audio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = percent * audio.duration;
        
        // 更新进度条和小球位置
        const progress = percent * 100;
        progressFill.style.width = `${progress}%`;
        const progressBall = card.querySelector('.progress-ball');
        if (progressBall) {
            progressBall.style.left = `${progress}%`;
        }
    }
    
    progressBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        try { buttonClickSfx.currentTime = 0; buttonClickSfx.play().catch(()=>{}); } catch(e2) {}
        updateProgress(e);
        e.preventDefault();
    });
    
    // 节流进度条拖动
    let progressMoveTimeout = null;
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            if (progressMoveTimeout) return;
            progressMoveTimeout = requestAnimationFrame(() => {
                updateProgress(e);
                progressMoveTimeout = null;
            });
        }
    }, { passive: true });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        if (progressMoveTimeout) {
            cancelAnimationFrame(progressMoveTimeout);
            progressMoveTimeout = null;
        }
    });
    
    // 触摸支持（移动端）
    progressBar.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateProgress(e.touches[0]);
        e.preventDefault();
    });
    
    // 节流进度条拖动（触摸）
    let progressTouchTimeout = null;
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            if (progressTouchTimeout) return;
            progressTouchTimeout = requestAnimationFrame(() => {
                updateProgress(e.touches[0]);
                progressTouchTimeout = null;
            });
        }
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
        if (progressTouchTimeout) {
            cancelAnimationFrame(progressTouchTimeout);
            progressTouchTimeout = null;
        }
    });
    
    // Volume toggle with icon swap
    const volumeIconOn = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
    const volumeIconOff = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.59-4L12 9.59 9.41 7 8 8.41 10.59 11 8 13.59 9.41 15 12 12.41 14.59 15 16 13.59 13.41 11 16 8.41 14.59 7z"/></svg>';
    function updateVolumeIcon() {
        volumeBtn.innerHTML = audio.muted ? volumeIconOff : volumeIconOn;
        volumeBtn.style.opacity = audio.muted ? '0.6' : '1';
    }
    updateVolumeIcon();
    volumeBtn.addEventListener('click', () => {
        audio.muted = !audio.muted;
        updateVolumeIcon();
    });
    
    // Auto play next/loop based on playback mode
    audio.addEventListener('ended', () => {
        const currentIndex = parseInt(card.dataset.index);
        const currentGenre = card.dataset.genre;
        
        // 根据播放模式决定下一首
        let nextIndex = -1;
        
        if (playbackMode === 'single') {
            // 单曲重播：直接重播当前歌曲
            nextIndex = currentIndex;
        } else if (playbackMode === 'shuffle') {
            // 随机播放：从当前筛选的mood/genre中随机选择
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            const availableTracks = Array.from(document.querySelectorAll('.music-card'))
                .filter(c => !c.classList.contains('hidden'))
                .map(c => parseInt(c.dataset.index))
                .filter(idx => idx !== currentIndex); // 排除当前歌曲
            
            if (availableTracks.length > 0) {
                nextIndex = availableTracks[Math.floor(Math.random() * availableTracks.length)];
            }
        } else {
            // 顺序播放：按列表顺序找下一首
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            const visibleCards = Array.from(document.querySelectorAll('.music-card'))
                .filter(c => !c.classList.contains('hidden'))
                .map(c => ({ card: c, index: parseInt(c.dataset.index) }))
                .sort((a, b) => a.index - b.index);
            
            const currentPos = visibleCards.findIndex(item => item.index === currentIndex);
            if (currentPos >= 0 && currentPos < visibleCards.length - 1) {
                nextIndex = visibleCards[currentPos + 1].index;
            } else if (visibleCards.length > 0) {
                // 如果已是最后一首，循环到第一首
                nextIndex = visibleCards[0].index;
            }
        }
        
        // 播放下一首或重播当前
        if (nextIndex >= 0 && nextIndex < musicTracks.length) {
            const nextCard = document.querySelector(`.music-card[data-index="${nextIndex}"]`);
            if (nextCard) {
                // 停止当前播放
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                card.classList.remove('playing');
                progressFill.style.width = '0%';
                
                // 触发下一首播放
                setTimeout(() => {
                    const nextPlayBtn = nextCard.querySelector('.play-pause');
                    if (nextPlayBtn) {
                        isAutoAdvance = true;
                        nextPlayBtn.click();
                        setTimeout(() => { isAutoAdvance = false; }, 10);
                    }
                }, 300);
            } else {
                // 如果找不到下一首，隐藏Now Playing
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        card.classList.remove('playing');
        progressFill.style.width = '0%';
        audio.currentTime = 0;
                hideNowPlaying();
            }
        } else {
            // 没有下一首，隐藏Now Playing
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            card.classList.remove('playing');
            progressFill.style.width = '0%';
            audio.currentTime = 0;
            hideNowPlaying();
        }
    });
    
    // 设置标题和艺术家文字的滚动效果
    const titleScroll = card.querySelector('.track-title-scroll');
    const titleWrapper = card.querySelector('.track-title-scroll-wrapper');
    const artistScroll = card.querySelector('.track-artist-scroll');
    const artistWrapper = card.querySelector('.track-artist-scroll-wrapper');
    
    if (titleScroll && titleWrapper) {
        setupScrollingText(titleScroll, titleWrapper);
    }
    if (artistScroll && artistWrapper) {
        setupScrollingText(artistScroll, artistWrapper);
    }
}

// Music filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        const cards = document.querySelectorAll('.music-card');
        
        cards.forEach(card => {
            const match = (filter === 'all' || card.dataset.genre === filter);
            if (match) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

loadMusic();

// 全局：为其它按钮添加 click 音（避免与播放/进度条重复触发）
document.addEventListener('click', (ev) => {
    const target = ev.target;
    if (!(target instanceof Element)) return;
    const btn = target.closest('button');
    if (!btn) return;
    // 跳过播放按钮、音量按钮、进度条内操作、Now Playing 条中的 toggle 按钮，避免重复
    if (btn.classList.contains('play-pause') || btn.classList.contains('volume-btn') || btn.classList.contains('np-toggle')) return;
    if (btn.closest('.progress-bar')) return;
    try { buttonClickSfx.currentTime = 0; buttonClickSfx.play().catch(()=>{}); } catch(e) {}
}, { passive: true });

// ==========================================
// PHOTOS DATA
// ==========================================
const photos = [
    { image: 'images/photo1.svg', caption: 'Tokyo Nights 🌃' },
    { image: 'images/photo2.svg', caption: 'Coffee & Code ☕' },
    { image: 'images/photo3.svg', caption: 'Pixel Perfect 🎮' },
    { image: 'images/photo4.svg', caption: 'Neon Aesthetic 💜' },
    { image: 'images/photo5.svg', caption: 'Retro Vibes 📼' },
    { image: 'images/photo6.svg', caption: 'Digital Dreams ✨' },
    { image: 'images/photo7.svg', caption: 'Synthwave Sunset 🌅' },
    { image: 'images/photo8.svg', caption: 'Glitch Art 🎨' },
    { image: 'images/photo9.svg', caption: 'Cyberpunk City 🏙️' }
];

function loadPhotos() {
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.photoIndex = index;
        
        // Polaroid wrapper
        const polaroid = document.createElement('div');
        polaroid.className = 'polaroid';
        // 随机轻微旋转（-3° ~ 3°）
        const angle = (Math.random() * 6 - 3).toFixed(2);
        polaroid.style.transform = `rotate(${angle}deg)`;

        const tape = document.createElement('div');
        tape.className = 'tape';
        const img = document.createElement('img');
        img.src = photo.image;
        img.alt = '';

        polaroid.appendChild(tape);
        polaroid.appendChild(img);

        card.appendChild(polaroid);

        // 点击打开灯箱
        card.addEventListener('click', () => openLightbox(index));
        
        grid.appendChild(card);
    });
}

// 灯箱功能
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(index) {
    const photo = photos[index];
    lightboxImg.src = photo.image;
    lightboxImg.alt = '';
    
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
        title: 'Omori',
        description: 'A surreal psychological horror RPG about a boy named Sunny and his journey through a dreamlike world.',
        image: 'images/game1.svg',
        tags: ['RPG', 'Horror', 'Indie']
    },
    {
        title: 'Hollow Knight',
        description: 'Explore a vast interconnected underground kingdom filled with quirky characters and deadly beasts.',
        image: 'images/game2.svg',
        tags: ['Metroidvania', 'Action', 'Indie']
    },
    {
        title: 'Celeste',
        description: 'Help Madeline survive her journey to the top of Celeste Mountain in this tight platformer.',
        image: 'images/game3.svg',
        tags: ['Platformer', 'Indie', 'Story']
    },
    {
        title: 'Stardew Valley',
        description: 'Build the farm of your dreams, raise animals, grow crops, and become part of the community.',
        image: 'images/game4.svg',
        tags: ['Simulation', 'Farming', 'Relaxing']
    },
    {
        title: 'Hades',
        description: 'Defy the god of the dead as you hack and slash your way out of the Underworld.',
        image: 'images/game5.svg',
        tags: ['Roguelike', 'Action', 'Mythology']
    },
    {
        title: 'Undertale',
        description: 'A quirky RPG where nobody has to die. Your choices matter in this emotional journey.',
        image: 'images/game6.svg',
        tags: ['RPG', 'Indie', 'Bullet Hell']
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

// ==========================================
// SLEEPING CAT INTERACTION
// ==========================================
const sleepingCat = document.getElementById('sleepingCat');
const sleepingCatContainer = document.querySelector('.sleeping-cat-container');
const petHand = document.getElementById('petHand');
const purringAudio = document.getElementById('purringAudio');
let isPetting = false;
let isMobile = window.innerWidth <= 768;
let fadeInterval = null;

// 检测设备类型
window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
});

function updatePetHandPosition(x, y) {
    if (!petHand) return;
    // 使用 pageX/pageY 考虑滚动位置
    // fixed 定位使用的是视口坐标，所以直接用 clientX/clientY
    petHand.style.left = x + 'px';
    petHand.style.top = y + 'px';
    petHand.style.transform = 'translate(-50%, -50%)';
}

// 音频淡入淡出函数
function fadeInAudio() {
    if (!purringAudio) return;
    
    // 清除之前的淡入/淡出
    if (fadeInterval) {
        cancelAnimationFrame(fadeInterval);
        fadeInterval = null;
    }
    
    // 从随机位置开始播放
    if (purringAudio.duration) {
        purringAudio.currentTime = Math.random() * purringAudio.duration;
    }
    
    // 从 0 开始
    purringAudio.volume = 0;
    purringAudio.play().catch(() => {});
    
    // 淡入到 1.0，持续 500ms - 使用requestAnimationFrame优化性能
    const fadeInDuration = 500;
    const startTime = performance.now();
    
    function fadeInStep(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / fadeInDuration, 1);
        purringAudio.volume = progress;
        
        if (progress < 1) {
            fadeInterval = requestAnimationFrame(fadeInStep);
        } else {
            fadeInterval = null;
        }
    }
    
    fadeInterval = requestAnimationFrame(fadeInStep);
}

function fadeOutAudio() {
    if (!purringAudio) return;
    
    // 清除之前的淡入/淡出
    if (fadeInterval) {
        cancelAnimationFrame(fadeInterval);
        fadeInterval = null;
    }
    
    // 淡出到 0，持续 500ms - 使用requestAnimationFrame优化性能
    const fadeOutDuration = 500;
    const startVolume = purringAudio.volume;
    const startTime = performance.now();
    
    function fadeOutStep(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / fadeOutDuration, 1);
        purringAudio.volume = Math.max(startVolume * (1 - progress), 0);
        
        if (progress < 1) {
            fadeInterval = requestAnimationFrame(fadeOutStep);
        } else {
            fadeInterval = null;
            purringAudio.pause();
        }
    }
    
    fadeInterval = requestAnimationFrame(fadeOutStep);
}

if (sleepingCat && sleepingCatContainer && petHand) {
    // 初始化 pet hand 位置
    petHand.style.left = '-200px';
    petHand.style.top = '-200px';
    petHand.style.display = 'none';
    
    // 桌面端：按住左键跟随光标（整个容器区域）
    sleepingCatContainer.addEventListener('mousedown', (e) => {
        if (isMobile) return;
        e.preventDefault();
        e.stopPropagation();
        isPetting = true;
        
        // 显示手
        petHand.classList.add('active');
        petHand.style.display = 'block';
        
        // 开始播放呼噜声并淡入
        fadeInAudio();
        
        updatePetHandPosition(e.clientX, e.clientY);
    });
    
    // 节流鼠标移动事件
    let mouseMoveTimeout = null;
    document.addEventListener('mousemove', (e) => {
        if (isPetting && !isMobile) {
            if (mouseMoveTimeout) return;
            mouseMoveTimeout = requestAnimationFrame(() => {
                updatePetHandPosition(e.clientX, e.clientY);
                mouseMoveTimeout = null;
            });
        }
    }, { passive: true });
    
    document.addEventListener('mouseup', () => {
        if (!isMobile && isPetting) {
            isPetting = false;
            petHand.classList.remove('active');
            petHand.style.display = 'none';
            
            // 淡出呼噜声
            fadeOutAudio();
        }
    });
    
    // 移动端：按住跟随（和桌面端一样，整个容器区域）
    let isTouching = false;
    
    sleepingCatContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        isTouching = true;
        
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        
        // 显示手
        petHand.classList.add('active');
        petHand.style.display = 'block';
        
        // 开始播放呼噜声并淡入
        fadeInAudio();
        
        updatePetHandPosition(x, y);
    });
    
    // 移动端：跟随手指移动 - 节流处理
    let touchMoveTimeout = null;
    document.addEventListener('touchmove', (e) => {
        if (isTouching) {
            e.preventDefault();
            
            if (touchMoveTimeout) return;
            touchMoveTimeout = requestAnimationFrame(() => {
                const touch = e.touches[0];
                const x = touch.clientX;
                const y = touch.clientY;
                updatePetHandPosition(x, y);
                touchMoveTimeout = null;
            });
        }
    }, { passive: false });
    
    // 移动端：松开隐藏
    document.addEventListener('touchend', (e) => {
        if (isTouching) {
            isTouching = false;
            petHand.classList.remove('active');
            petHand.style.display = 'none';
            
            // 淡出呼噜声
            fadeOutAudio();
        }
    });
    
    document.addEventListener('touchcancel', (e) => {
        if (isTouching) {
            isTouching = false;
            petHand.classList.remove('active');
            petHand.style.display = 'none';
            
            // 淡出呼噜声
            fadeOutAudio();
        }
    });
} else {
    console.error('Sleeping cat or pet hand not found!', {
        sleepingCat: sleepingCat,
        petHand: petHand
    });
}

// Personal Blog Loaded

// ==========================================
// RANDOM SOUND EFFECTS SYSTEM
// ==========================================
const soundBtn = document.getElementById('soundBtn');

// Lista file effetti sonori - Puoi aggiungere più file audio nella cartella button_sound
const soundEffects = [
    'button_sound/click1.mp3',
    'button_sound/click2.mp3',
    'button_sound/click3.mp3',
    'button_sound/beep1.mp3',
    'button_sound/beep2.mp3',
    'button_sound/chime1.mp3',
    'button_sound/chime2.mp3',
    'button_sound/ding1.mp3',
    'button_sound/ding2.mp3',
    'button_sound/pop1.mp3',
    'button_sound/pop2.mp3',
    'button_sound/woosh1.mp3',
    'button_sound/woosh2.mp3'
];

// Riproduci effetto sonoro casuale
function playRandomSound() {
    if (soundEffects.length === 0) {
        return;
    }
    
    // Scegli un effetto sonoro casuale
    const randomIndex = Math.floor(Math.random() * soundEffects.length);
    const soundFile = soundEffects[randomIndex];
    
    // Crea elemento audio e riproduci
    const audio = new Audio(soundFile);
    audio.volume = 0.7; // Imposta volume al 70%
    
    // Riproduci effetto sonoro
    audio.play().catch(() => {
        // Se il file audio non esiste, prova a riprodurre un effetto sonoro di sistema semplice
        try {
            const fallbackAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
            fallbackAudio.volume = 0.3;
            fallbackAudio.play();
        } catch (fallbackError) {
            // Fallback failed
        }
    });
}

// Aggiungi evento click al bottone effetti sonori
if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Aggiungi effetto animazione al click
        soundBtn.style.transform = 'translateY(-5px) scale(0.95)';
        
        // Riproduci effetto sonoro casuale
        playRandomSound();
        
        // Ripristina stato del bottone
        setTimeout(() => {
            soundBtn.style.transform = '';
        }, 150);
    });
} else {
    console.error('Bottone effetti sonori non trovato');
}
