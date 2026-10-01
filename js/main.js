/**
 * First Steps Pre School - Main Interactive Script
 * Animations, Sound Synthesizer, Confetti, Carousel & Micro-interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveals();
    initMobileNav();
    initFacilitiesCarousel();
    initAnimatedCounters();
    initFaqAccordion();
    initBubblePopper();
    initAudioSynthesizer();
    initBackToTop();
    initYearAutoUpdate();
    initActivities();
});

/* ==========================================================================
   1. Scroll Reveal Animations (IntersectionObserver)
   ========================================================================== */
function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    reveals.forEach(el => observer.observe(el));
}

/* ==========================================================================
   2. Responsive Mobile Navigation (Drawer, Backdrop & Touch Support)
   ========================================================================== */
function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!hamburgerBtn || !mobileMenu) return;

    // Create backdrop overlay if it doesn't exist
    let backdrop = document.querySelector('.mobile-menu-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'mobile-menu-backdrop';
        document.body.appendChild(backdrop);
    }

    function openMenu() {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        backdrop.classList.add('active');
        hamburgerBtn.innerHTML = '✕';
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        backdrop.classList.remove('active');
        hamburgerBtn.innerHTML = '☰';
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('translate-x-0');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close when tapping backdrop
    backdrop.addEventListener('click', closeMenu);

    // Close when tapping any drawer link
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close button inside drawer if present
    const closeDrawerBtn = document.getElementById('close-mobile-menu');
    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeMenu);
    }

    // Keyboard ESC to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('translate-x-0')) {
            closeMenu();
        }
    });
}

/* ==========================================================================
   3. Facilities Carousel with Touch & Auto-Advance
   ========================================================================== */
function initFacilitiesCarousel() {
    const track = document.getElementById('facilities-track');
    const prevBtn = document.getElementById('prev-facility');
    const nextBtn = document.getElementById('next-facility');
    const indicatorsContainer = document.getElementById('facility-indicators');

    if (!track) return;

    const slides = track.querySelectorAll('.facility-slide');
    if (!slides.length) return;

    let currentIndex = 0;
    const slideGap = 25;
    
    function getVisibleCount() {
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    function getSlideWidth() {
        return slides[0].getBoundingClientRect().width + slideGap;
    }

    function updateIndicators() {
        if (!indicatorsContainer) return;
        indicatorsContainer.innerHTML = '';
        const maxIndex = Math.max(0, slides.length - getVisibleCount());
        
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('button');
            dot.className = `w-3 h-3 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-fs-pink w-8' : 'bg-gray-300 hover:bg-fs-yellow'}`;
            dot.setAttribute('aria-label', `Go to facility slide ${i + 1}`);
            dot.addEventListener('click', () => {
                currentIndex = i;
                applyTransform();
            });
            indicatorsContainer.appendChild(dot);
        }
    }

    function applyTransform() {
        const maxIndex = Math.max(0, slides.length - getVisibleCount());
        currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
        const offset = -(currentIndex * getSlideWidth());
        track.style.transform = `translateX(${offset}px)`;
        updateIndicators();
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const maxIndex = Math.max(0, slides.length - getVisibleCount());
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // loop
            }
            applyTransform();
            playChime(660);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const maxIndex = Math.max(0, slides.length - getVisibleCount());
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = maxIndex;
            }
            applyTransform();
            playChime(520);
        });
    }

    // Touch swipe support
    let startX = 0;
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        const diffX = startX - e.changedTouches[0].clientX;
        if (Math.abs(diffX) > 40) {
            if (diffX > 0 && currentIndex < slides.length - getVisibleCount()) {
                currentIndex++;
            } else if (diffX < 0 && currentIndex > 0) {
                currentIndex--;
            }
            applyTransform();
        }
    }, { passive: true });

    // Auto Advance
    let autoInterval = setInterval(() => {
        const maxIndex = Math.max(0, slides.length - getVisibleCount());
        currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
        applyTransform();
    }, 4500);

    track.addEventListener('mouseenter', () => clearInterval(autoInterval));
    track.addEventListener('mouseleave', () => {
        autoInterval = setInterval(() => {
            const maxIndex = Math.max(0, slides.length - getVisibleCount());
            currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
            applyTransform();
        }, 4500);
    });

    window.addEventListener('resize', () => {
        applyTransform();
    });

    applyTransform();
}

/* ==========================================================================
   4. Animated Stats Counter
   ========================================================================== */
function initAnimatedCounters() {
    const counters = document.querySelectorAll('.stat-counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'), 10) || 0;
                animateCount(entry.target, target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));

    function animateCount(el, target) {
        let current = 0;
        const duration = 1600;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target + (el.getAttribute('data-suffix') || '');
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current) + (el.getAttribute('data-suffix') || '');
            }
        }, stepTime);
    }
}

/* ==========================================================================
   5. Interactive FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        const ans = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');

        if (!btn || !ans) return;

        btn.addEventListener('click', () => {
            const isOpen = !ans.classList.contains('hidden');
            // Close other items
            faqItems.forEach(other => {
                const otherAns = other.querySelector('.faq-answer');
                const otherIcon = other.querySelector('.faq-icon');
                if (otherAns) otherAns.classList.add('hidden');
                if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
            });

            if (!isOpen) {
                ans.classList.remove('hidden');
                if (icon) icon.style.transform = 'rotate(180deg)';
                playChime(587.33);
            } else {
                ans.classList.add('hidden');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        });
    });
}

/* ==========================================================================
   6. Playful Bubble Pop Click Particles
   ========================================================================== */
function initBubblePopper() {
    const colors = ['#FFD166', '#EF476F', '#118AB2', '#06D6A0', '#8338EC'];

    document.addEventListener('click', (e) => {
        // Avoid creating bubbles on inputs/buttons if unnecessary
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        createBubble(e.clientX, e.clientY);
    });

    function createBubble(x, y) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble-particle';
        const size = Math.floor(Math.random() * 26) + 20;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        bubble.style.backgroundColor = `${color}40`;
        bubble.style.border = `2px solid ${color}`;
        
        document.body.appendChild(bubble);

        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        }, 800);
    }
}

/* ==========================================================================
   7. Playful Web Audio Synthesizer (Zero External Dependencies)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioSynthesizer() {
    const soundToggle = document.getElementById('sound-toggle-btn');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundToggle.innerHTML = soundEnabled ? '🔔' : '🔕';
            soundToggle.title = soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted';
            if (soundEnabled) playChime(784);
        });
    }

    // Add playful sounds to bounce buttons
    document.querySelectorAll('.btn-bounce, .fun-play-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playChime(659.25);
        });
    });
}

function playChime(freq = 523.25) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
        // Silently ignore if audio context is blocked
    }
}

/* ==========================================================================
   8. Confetti Cannon (Zero external library required)
   ========================================================================== */
window.triggerConfetti = function() {
    const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#8338EC', '#FF9F1C'];
    const count = 75;

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.style.position = 'fixed';
        piece.style.width = `${Math.random() * 10 + 6}px`;
        piece.style.height = `${Math.random() * 12 + 8}px`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.left = '50%';
        piece.style.top = '50%';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
        piece.style.pointerEvents = 'none';
        piece.style.zIndex = '10001';
        piece.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
        
        document.body.appendChild(piece);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 350 + 150;
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity + 150;

        piece.animate([
            { transform: `translate(-50%, -50%) rotate(0deg) scale(1)`, opacity: 1 },
            { transform: `translate(${destX}px, ${destY}px) rotate(${Math.random() * 720}deg) scale(0.6)`, opacity: 0 }
        ], {
            duration: 1600 + Math.random() * 600,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            fill: 'forwards'
        });

        setTimeout(() => {
            if (piece.parentNode) piece.parentNode.removeChild(piece);
        }, 2400);
    }

    playChime(880);
};

/* ==========================================================================
   9. Back to Top Button
   ========================================================================== */
function initBackToTop() {
    const backBtn = document.getElementById('back-to-top');
    if (!backBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backBtn.classList.add('visible');
        } else {
            backBtn.classList.remove('visible');
        }
    });

    backBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        playChime(600);
    });
}

/* ==========================================================================
   10. Auto-Update Current Year
   ========================================================================== */
function initYearAutoUpdate() {
    const yearEls = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    yearEls.forEach(el => el.textContent = currentYear);
}

/* ==========================================================================
   11. Dynamic Curriculum Activities (Admin API Integration)
   ========================================================================== */
function initActivities() {
    const container = document.getElementById('activities-list');
    if (!container) return;

    fetch('fss-admin/server/get-activities.php')
        .then(res => res.json())
        .then(data => {
            if (data.success && Array.isArray(data.items) && data.items.length > 0) {
                renderDynamicActivities(container, data.items);
            }
        })
        .catch(() => {
            // Retain default static HTML fallback cards gracefully
        });
}

function renderDynamicActivities(container, activities) {
    const colorStyles = {
        yellow: { border: 'border-fs-yellow', badge: 'bg-fs-yellow text-fs-text', text: 'text-fs-yellow' },
        pink:   { border: 'border-fs-pink',   badge: 'bg-fs-pink text-white',     text: 'text-fs-pink' },
        green:  { border: 'border-fs-green',  badge: 'bg-fs-green text-white',    text: 'text-fs-green' },
        blue:   { border: 'border-fs-blue',   badge: 'bg-fs-blue text-white',     text: 'text-fs-blue' },
        purple: { border: 'border-purple-400',badge: 'bg-purple-500 text-white',  text: 'text-purple-600' },
        orange: { border: 'border-orange-400',badge: 'bg-orange-500 text-white',  text: 'text-orange-600' }
    };

    const fallbackPhotos = [
        'images/bihu-celebration.jpg',
        'images/fruit-salad-day.jpg',
        'images/environmental-day.jpg',
        'images/hero-classroom.jpg',
        'images/playground.jpg'
    ];

    const cardsHtml = activities.map((item, index) => {
        const theme = colorStyles[item.color_class] || colorStyles.yellow;
        const photo = item.image_url_public || item.image_url_admin || fallbackPhotos[index % fallbackPhotos.length];
        const ageBadge = item.age_group ? item.age_group : 'Age 2-5 Yrs';
        const scheduleInfo = item.schedule ? `⏰ ${item.schedule}` : 'Joyful Learning & Play 🌟';

        return `
            <div class="bg-white rounded-3xl overflow-hidden shadow-xl border-b-8 ${theme.border} hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 reveal group">
                <div class="h-56 overflow-hidden relative">
                    <img src="${photo}" alt="${item.title}"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onerror="this.onerror=null; this.src='images/hero-classroom.jpg'">
                    <div class="absolute top-4 right-4 ${theme.badge} font-bold text-xs py-1 px-3 rounded-full shadow-md">
                        ${ageBadge}
                    </div>
                </div>
                <div class="p-8">
                    <div class="text-4xl mb-3 group-hover:animate-bounce">${item.icon || '🎨'}</div>
                    <h3 class="text-2xl brand-font text-gray-800 mb-3">${item.title}</h3>
                    <p class="text-gray-600 font-semibold leading-relaxed mb-4">
                        ${item.description}
                    </p>
                    <span class="text-xs font-bold ${theme.text}">${scheduleInfo}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = cardsHtml;

    // Trigger reveal observer for dynamically added cards
    const newReveals = container.querySelectorAll('.reveal');
    newReveals.forEach(el => el.classList.add('active'));
}
