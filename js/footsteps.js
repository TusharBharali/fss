/**
 * First Steps Pre School - Hero Section Walking Footprints Animation
 * Animates a child walking step-by-step from below the floating balloon
 * directly up to the "Join Our Family! 🎈" button pill, where the walk ends.
 */

(function () {
    // SVG Paths matching First Steps logo footprints
    const SVG_LEFT_FOOT = `
        <svg viewBox="0 0 100 160" width="100%" height="100%" fill="currentColor">
            <path d="M48,38 C68,38 76,55 74,80 C73,98 62,105 62,120 C62,138 58,152 44,152 C30,152 24,138 24,118 C24,88 26,38 48,38 Z" />
            <ellipse cx="68" cy="22" rx="11" ry="14" transform="rotate(8 68 22)" />
            <ellipse cx="51" cy="17" rx="8" ry="11" transform="rotate(0 51 17)" />
            <ellipse cx="35" cy="20" rx="7" ry="9.5" transform="rotate(-8 35 20)" />
            <ellipse cx="22" cy="26" rx="6" ry="8" transform="rotate(-15 22 26)" />
            <ellipse cx="12" cy="35" rx="5" ry="6.5" transform="rotate(-22 12 35)" />
        </svg>
    `;

    const SVG_RIGHT_FOOT = `
        <svg viewBox="0 0 100 160" width="100%" height="100%" fill="currentColor">
            <path d="M52,38 C32,38 24,55 26,80 C27,98 38,105 38,120 C38,138 42,152 56,152 C70,152 76,138 76,118 C76,88 74,38 52,38 Z" />
            <ellipse cx="32" cy="22" rx="11" ry="14" transform="rotate(-8 32 22)" />
            <ellipse cx="49" cy="17" rx="8" ry="11" transform="rotate(0 49 17)" />
            <ellipse cx="65" cy="20" rx="7" ry="9.5" transform="rotate(8 65 20)" />
            <ellipse cx="78" cy="26" rx="6" ry="8" transform="rotate(15 78 26)" />
            <ellipse cx="88" cy="35" rx="5" ry="6.5" transform="rotate(22 88 35)" />
        </svg>
    `;

    let container = null;
    let heroEl = null;
    let balloonEl = null;
    let pillEl = null;
    let isRunning = false;
    let activeTimeouts = [];

    function clearTimeouts() {
        activeTimeouts.forEach(t => clearTimeout(t));
        activeTimeouts = [];
    }

    function initHeroWalkingAnimation() {
        heroEl = document.getElementById('home');
        balloonEl = document.getElementById('hero-balloon');
        pillEl = document.getElementById('hero-join-pill');

        // Only run if the hero section and target elements exist
        if (!heroEl || !balloonEl || !pillEl) {
            return;
        }

        // Create dedicated hero footprints overlay inside #home
        container = document.getElementById('hero-footsteps-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'hero-footsteps-container';
            container.className = 'absolute inset-0 pointer-events-none overflow-hidden z-[5]';
            container.setAttribute('aria-hidden', 'true');
            heroEl.appendChild(container);
        }

        // Start walking loop
        scheduleNextWalk(600);

        // Recalculate cleanly on window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                clearTimeouts();
                if (container) container.innerHTML = '';
                scheduleNextWalk(400);
            }, 250);
        }, { passive: true });
    }

    function scheduleNextWalk(delay) {
        clearTimeouts();
        const t = setTimeout(() => {
            if (!document.hidden) {
                runWalkSequence();
            } else {
                scheduleNextWalk(1500);
            }
        }, delay);
        activeTimeouts.push(t);
    }

    function runWalkSequence() {
        if (!heroEl || !balloonEl || !pillEl || !container) return;

        // Clear existing prints from container
        container.innerHTML = '';

        // Calculate positions relative to hero section
        const heroRect = heroEl.getBoundingClientRect();
        const balloonRect = balloonEl.getBoundingClientRect();
        const pillRect = pillEl.getBoundingClientRect();

        // 1. Start point: directly below the floating balloon
        const startX = (balloonRect.left + balloonRect.right) / 2 - heroRect.left;
        const startY = Math.min(balloonRect.bottom - heroRect.top + 28, heroRect.height - 25);

        // 2. End point: right at the "Join Our Family! 🎈" button pill
        // Land slightly inside/under the front of the pill
        const endX = (pillRect.left - heroRect.left) + Math.min(42, pillRect.width * 0.28);
        const endY = (pillRect.top - heroRect.top) + (pillRect.height * 0.6);

        // Calculate distance and determine number of child steps (typically 6 - 8 steps)
        const dx = endX - startX;
        const dy = endY - startY;
        const totalDist = Math.hypot(dx, dy);
        
        // 6 to 8 steps based on screen spacing
        const numSteps = Math.max(6, Math.min(9, Math.round(totalDist / 42)));

        // Curve control point (gentle outward arc towards center)
        const cpX = (startX + endX) / 2 - 25;
        const cpY = (startY + endY) / 2 + 15;

        const stampedElements = [];
        const stepInterval = 400; // ms per step (natural toddler walking tempo)

        for (let i = 0; i < numSteps; i++) {
            const t = i / (numSteps - 1); // 0.0 at start below balloon -> 1.0 at pill

            // Quadratic bezier position
            const invT = 1 - t;
            const x = invT * invT * startX + 2 * invT * t * cpX + t * t * endX;
            const y = invT * invT * startY + 2 * invT * t * cpY + t * t * endY;

            // Tangent derivative for foot direction
            const vx = 2 * invT * (cpX - startX) + 2 * t * (endX - cpX);
            const vy = 2 * invT * (cpY - startY) + 2 * t * (endY - cpY);
            const angle = Math.atan2(vy, vx) * (180 / Math.PI);

            // Alternating feet (Step 0 = Left foot, Step 1 = Right foot...)
            const isLeft = (i % 2 === 0);
            // Red (#EF476F) and Yellow (#FFD166) matching school logo
            const color = isLeft ? '#EF476F' : '#FFD166';

            // Responsive footprint dimensions and toddler stride offset
            const isMobile = window.innerWidth < 640;
            const stepWidth = isMobile ? 22 : 30;
            const stepHeight = Math.round(stepWidth * 1.6);
            const strideOffset = isMobile ? 8 : 11;

            const footX = x + Math.cos(perpAngle) * strideOffset;
            const footY = y + Math.sin(perpAngle) * strideOffset;
            // Angle toes forward along path with gentle toddler splay
            const footRot = angle + 90 + (isLeft ? -7 : 7);

            // Step delay
            const stepDelay = i * stepInterval;

            const tStep = setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'hero-step-print';
                el.style.left = `${footX}px`;
                el.style.top = `${footY}px`;
                el.style.width = `${stepWidth}px`;
                el.style.height = `${stepHeight}px`;
                el.style.color = color;
                el.style.opacity = '0';
                el.style.transform = `translate(-50%, -50%) rotate(${footRot}deg) scale(0.4)`;
                el.innerHTML = isLeft ? SVG_LEFT_FOOT : SVG_RIGHT_FOOT;

                container.appendChild(el);
                stampedElements.push(el);

                // Stamp down firmly with elastic bounce
                requestAnimationFrame(() => {
                    el.style.opacity = '0.85';
                    el.style.transform = `translate(-50%, -50%) rotate(${footRot}deg) scale(1)`;
                });

                // When the final step reaches the pill:
                if (i === numSteps - 1) {
                    // Celebrate arrival at the "Join Our Family! 🎈" pill
                    pillEl.classList.add('hero-pill-celebrate');
                    setTimeout(() => {
                        pillEl.classList.remove('hero-pill-celebrate');
                    }, 1000);

                    // Keep full trail visible for 2.6 seconds so the path can be seen
                    const tHold = setTimeout(() => {
                        // Fade all footprints out smoothly
                        stampedElements.forEach(printEl => {
                            printEl.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
                            printEl.style.opacity = '0';
                            printEl.style.transform += ' scale(0.9)';
                        });

                        // After fade completes, pause briefly and walk again
                        const tNext = setTimeout(() => {
                            scheduleNextWalk(1200);
                        }, 750);
                        activeTimeouts.push(tNext);
                    }, 2600);
                    activeTimeouts.push(tHold);
                }
            }, stepDelay);

            activeTimeouts.push(tStep);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroWalkingAnimation);
    } else {
        initHeroWalkingAnimation();
    }
})();
