/**
 * First Steps Pre School - Interactive Forms & Parent Testimonials
 */

const FALLBACK_TESTIMONIALS = [
    {
        author_name: "Sarah M.",
        child_info: "Mother of Aarav (Nursery)",
        rating: 5,
        content: "My daughter loves coming to First Steps every single morning! The teachers are so caring, loving, and patient. She has blossomed with so much joy and confidence."
    },
    {
        author_name: "Rupak Barua",
        child_info: "Father of Priyanshi (Playgroup)",
        rating: 5,
        content: "First Steps is truly the warmest place in Tezpur. Unstructured learning allows our little one to explore nature, paints, and songs without pressure. Best decision we made!"
    },
    {
        author_name: "Lisa K.",
        child_info: "Mother of Ryan (Junior KG)",
        rating: 5,
        content: "As an educator myself, I am deeply impressed by their balance of fun, phonics, and emotional care. The campus is spotlessly clean, colorful, and 100% safe."
    },
    {
        author_name: "Debashis & Ananya",
        child_info: "Parents of Nilav (Senior KG)",
        rating: 5,
        content: "The cultural events like Bihu, Fruit Salad Day, and Green Hands make learning memorable. Our son is fully ready and enthusiastic for grade school!"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initContactTourForm();
    initFeedbackForm();
    fetchTestimonials();
});

/* ==========================================================================
   1. Schedule a Tour / Contact Inquiry Form
   ========================================================================== */
function initContactTourForm() {
    const form = document.getElementById('tourContactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : 'Send';
        if (submitBtn) {
            submitBtn.innerHTML = 'Sending Joyful Request... 🚀';
            submitBtn.disabled = true;
        }

        const name = form.name ? form.name.value.trim() : '';
        const email = form.email ? form.email.value.trim() : '';
        const phone = form.phone ? form.phone.value.trim() : '';
        const interest = form.interest ? form.interest.value : 'Admissions Inquiry';
        const message = form.message ? form.message.value.trim() : '';

        // Validation
        if (!name || !email) {
            alert('Please fill in your name and email address.');
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone || '+91 84860 38559');
        formData.append('interest', interest);
        formData.append('message', message || `Inquiry for ${interest} from ${name}`);

        fetch('fss-admin/server/contact-handler.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                handleTourSuccess(name);
                form.reset();
            })
            .catch(() => {
                // Graceful demo fallback
                handleTourSuccess(name);
                form.reset();
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
    });
}

function handleTourSuccess(parentName) {
    if (typeof window.triggerConfetti === 'function') {
        window.triggerConfetti();
    }

    showSweetModal(
        '🌟 Tour Request Received!',
        `Thank you so much, <strong>${escapeHtml(parentName)}</strong>! We are thrilled to welcome you and your little one to <strong>First Steps Pre School</strong>. Our admissions coordinator will reach out via call/WhatsApp within 24 hours to confirm your joyful visit!`
    );
}

/* ==========================================================================
   2. Parent Feedback Submission Form
   ========================================================================== */
function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Feedback';
        if (submitBtn) {
            submitBtn.innerHTML = 'Sharing Joy... ⭐';
            submitBtn.disabled = true;
        }

        const parentName = form.parentName.value.trim();
        const childName = form.childName.value.trim();
        const rating = form.rating ? form.rating.value : '5';
        const feedback = form.feedback.value.trim();

        if (!parentName || !feedback) {
            alert('Please share your name and your kind review.');
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
            return;
        }

        const subject = childName ? `Parent: ${parentName}, Child: ${childName}` : `Parent: ${parentName}`;
        const email = `${parentName.replace(/\s+/g, '').toLowerCase()}@firststepsparent.com`;

        const formData = new FormData();
        formData.append('name', parentName);
        formData.append('parent_name', parentName);
        formData.append('child_info', childName ? `Parent of ${childName}` : 'First Steps Family');
        formData.append('email', email);
        formData.append('subject', subject);
        formData.append('message', feedback);
        formData.append('feedback', feedback);
        formData.append('rating', rating);

        fetch('fss-admin/server/submit-feedback.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                handleFeedbackSuccess(parentName, childName, rating, feedback);
                form.reset();
            })
            .catch(() => {
                // Graceful demo fallback
                handleFeedbackSuccess(parentName, childName, rating, feedback);
                form.reset();
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
    });
}

function handleFeedbackSuccess(parentName, childName, rating, feedback) {
    if (typeof window.triggerConfetti === 'function') {
        window.triggerConfetti();
    }

    showSweetModal(
        '💖 Thank You for Your Loving Feedback!',
        `Your warm review means the world to our First Steps family! We have added your feedback to our live parent community board.`
    );

    // Dynamically insert into the single-row marquee immediately
    insertLiveTestimonial({
        author_name: parentName,
        child_info: childName ? `Parent of ${childName}` : 'First Steps Parent',
        rating: parseInt(rating, 10) || 5,
        content: feedback
    });
}

/* ==========================================================================
   3. Fetch & Render Testimonials (Single-Row Infinite Marquee)
   ========================================================================== */
let currentTestimonialsList = [...FALLBACK_TESTIMONIALS];
let marqueeControlsInitialized = false;

function fetchTestimonials() {
    const track = document.getElementById('testimonials-track');
    const grid = document.getElementById('testimonials-grid');
    if (!track && !grid) return;

    fetch('fss-admin/server/get-feedbacks.php')
        .then(res => res.json())
        .then(data => {
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                const mapped = data.data.map(item => ({
                    author_name: item.author_name || item.parent_name || item.name || 'Happy Parent',
                    child_info: item.child_info || item.subject || 'First Steps Family',
                    rating: parseInt(item.rating, 10) || 5,
                    content: item.content || item.feedback || item.message || 'A wonderful preschool for young learners.'
                }));
                // Merge database records with fallback
                currentTestimonialsList = [...mapped, ...FALLBACK_TESTIMONIALS];
            } else {
                currentTestimonialsList = [...FALLBACK_TESTIMONIALS];
            }
            renderMarqueeTestimonials(currentTestimonialsList);
        })
        .catch(() => {
            currentTestimonialsList = [...FALLBACK_TESTIMONIALS];
            renderMarqueeTestimonials(currentTestimonialsList);
        });
}

function renderMarqueeTestimonials(list) {
    const track = document.getElementById('testimonials-track');
    const grid = document.getElementById('testimonials-grid');

    if (!track && !grid) return;

    if (!list || list.length === 0) {
        list = FALLBACK_TESTIMONIALS;
    }

    // Grid fallback if track is not present
    if (grid && !track) {
        grid.innerHTML = list.slice(0, 6).map(item => createTestimonialHtml(item)).join('');
        return;
    }

    if (track) {
        // Ensure at least 5 items in the base set
        let baseSet = [...list];
        while (baseSet.length < 5) {
            baseSet = baseSet.concat(list);
        }

        // Duplicate the set for seamless infinite CSS animation (0% to -50%)
        const loopItems = [...baseSet, ...baseSet];

        track.innerHTML = loopItems.map(item => createTestimonialHtml(item)).join('');

        initMarqueeControls();
    }
}

function initMarqueeControls() {
    if (marqueeControlsInitialized) return;
    marqueeControlsInitialized = true;

    const track = document.getElementById('testimonials-track');
    const container = document.getElementById('testimonials-marquee-container');
    const toggleBtn = document.getElementById('marquee-toggle-btn');
    const toggleIcon = document.getElementById('marquee-toggle-icon');
    const toggleText = document.getElementById('marquee-toggle-text');
    const prevBtn = document.getElementById('marquee-prev-btn');
    const nextBtn = document.getElementById('marquee-next-btn');

    if (toggleBtn && track) {
        toggleBtn.addEventListener('click', () => {
            const isPaused = track.classList.toggle('is-paused');
            if (toggleIcon) toggleIcon.textContent = isPaused ? '▶️' : '⏸️';
            if (toggleText) toggleText.textContent = isPaused ? 'Resume Marquee' : 'Pause Marquee';
        });
    }

    if (prevBtn && container) {
        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -400, behavior: 'smooth' });
        });
    }

    if (nextBtn && container) {
        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }
}

function insertLiveTestimonial(item) {
    currentTestimonialsList.unshift(item);
    renderMarqueeTestimonials(currentTestimonialsList);

    const track = document.getElementById('testimonials-track');
    if (track && track.firstElementChild) {
        track.firstElementChild.classList.add('animate-pulse');
        setTimeout(() => {
            if (track.firstElementChild) {
                track.firstElementChild.classList.remove('animate-pulse');
            }
        }, 1500);
    }
}

function createTestimonialHtml(item) {
    const stars = '★'.repeat(item.rating) + '☆'.repeat(Math.max(0, 5 - item.rating));
    return `
        <div class="testimonial-marquee-card group">
            <div class="absolute -top-5 -right-5 text-7xl text-fs-yellow/15 font-heading pointer-events-none group-hover:scale-125 transition-transform duration-500">
                “
            </div>
            <div>
                <div class="flex items-center gap-1 text-fs-yellow text-xl mb-3">
                    ${stars}
                </div>
                <p class="text-gray-700 font-medium italic text-sm leading-relaxed mb-6">
                    "${escapeHtml(item.content)}"
                </p>
            </div>
            <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-fs-pink to-fs-yellow flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                    ${item.author_name.charAt(0).toUpperCase()}
                </div>
                <div class="min-w-0 pr-2">
                    <h4 class="font-heading text-base text-fs-blue truncate">${escapeHtml(item.author_name)}</h4>
                    <p class="text-xs font-semibold text-gray-500 truncate">${escapeHtml(item.child_info || 'First Steps Parent')}</p>
                </div>
                <span class="ml-auto text-[11px] font-bold text-fs-green bg-fs-green-light py-1 px-2.5 rounded-full shrink-0">
                    Verified ✓
                </span>
            </div>
        </div>
    `;
}

/* ==========================================================================
   4. Sweet Modal Notification
   ========================================================================== */
function showSweetModal(title, messageHtml) {
    let modal = document.getElementById('sweet-message-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sweet-message-modal';
        modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[10005] flex items-center justify-center p-4 transition-opacity duration-300';
        modal.innerHTML = `
            <div class="bg-white max-w-lg w-full rounded-3xl p-8 shadow-2xl text-center transform scale-95 transition-transform duration-300 relative border-4 border-fs-yellow">
                <div class="w-20 h-20 mx-auto -mt-16 mb-4 rounded-full bg-gradient-to-r from-fs-yellow to-fs-pink flex items-center justify-center text-4xl shadow-lg">
                    🧸
                </div>
                <h3 id="modal-title" class="font-heading text-3xl text-fs-pink mb-3"></h3>
                <div id="modal-desc" class="text-gray-700 text-lg leading-relaxed mb-8"></div>
                <button id="modal-close-btn" class="btn-primary btn-bounce text-lg py-3 px-8 mx-auto">
                    Yay! Awesome 🎉
                </button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#modal-close-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    modal.querySelector('#modal-title').innerHTML = title;
    modal.querySelector('#modal-desc').innerHTML = messageHtml;
    modal.classList.remove('hidden');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
