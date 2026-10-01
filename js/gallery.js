/**
 * First Steps Pre School - Dynamic Gallery & Lightbox Viewer
 */

const FALLBACK_GALLERY_ITEMS = [
    {
        title: "Magh Bihu Traditional Celebration",
        description: "Children rejoicing in Assamese cultural roots, wearing traditional attire and sharing festive treats.",
        category: "celebrations",
        image_url: "images/bihu-celebration.jpg"
    },
    {
        title: "Fruit Salad Day Fun",
        description: "Little chefs exploring tasty fruits, bright colors, and healthy eating habits with big smiles.",
        category: "classroom",
        image_url: "images/fruit-salad-day.jpg"
    },
    {
        title: "Outdoor Nature & Sandpit Play",
        description: "Fresh air, gentle slides, and sensory sandcastle adventures in our secure shaded playground.",
        category: "outdoor",
        image_url: "images/playground.jpg"
    },
    {
        title: "Little Hands for Mother Earth",
        description: "Preschoolers planting saplings on Environmental Day, learning kindness towards nature.",
        category: "celebrations",
        image_url: "images/environmental-day.jpg"
    },
    {
        title: "Montessori & Creative Arts Studio",
        description: "Hands-on building blocks, easel painting, and cozy reading corners for active toddlers.",
        category: "classroom",
        image_url: "images/hero-classroom.jpg"
    },
    {
        title: "Joyful Music & Movement Circle",
        description: "Singing rhymes, dancing to rhythm, and developing early motor and social confidence.",
        category: "celebrations",
        image_url: "images/gallery/6837eb614dfb1.jpg"
    },
    {
        title: "Early Cognitive Building Blocks",
        description: "Solving tactile puzzles and learning shape recognition through guided unstructured play.",
        category: "classroom",
        image_url: "images/gallery/6837e9cfa1b60.jpg"
    },
    {
        title: "Annual Sports & Splash Day",
        description: "Cheering our little champions during fun hurdles, soft ball tosses, and water splash games.",
        category: "outdoor",
        image_url: "images/gallery/6837eb866dcc5.jpg"
    }
];

let currentGalleryList = [];
let currentFilteredList = [];
let currentLightboxIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initLightbox();
});

function normalizeCategory(cat) {
    const c = (cat || '').toLowerCase().trim();
    if (['classroom', 'activities', 'art & craft', 'art', 'craft', 'learning', 'academics'].includes(c)) return 'classroom';
    if (['outdoor', 'sports', 'games', 'playground'].includes(c)) return 'outdoor';
    if (['celebrations', 'events', 'festival', 'festivals', 'cultural', 'annual day'].includes(c)) return 'celebrations';
    return c;
}

function formatCategoryBadge(cat) {
    const map = {
        'classroom': 'Classroom 🎨',
        'outdoor': 'Outdoor 🎪',
        'celebrations': 'Celebration 🍉',
        'sports': 'Sports 🏃',
        'activities': 'Activity 🖌️',
        'general': 'School Life 🌟'
    };
    const key = (cat || '').toLowerCase().trim();
    return map[key] || (cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'First Steps');
}

function initGallery() {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    fetch('fss-admin/server/get-gallery.php')
        .then(res => res.json())
        .then(data => {
            if (data.success && Array.isArray(data.items) && data.items.length > 0) {
                const mapped = data.items.map(item => ({
                    title: item.title || 'First Steps Preschool Activity',
                    description: item.description || 'Joyful learning through unstructured play.',
                    category: (item.category || 'classroom').toLowerCase(),
                    raw_category: item.category_raw || item.category || 'Classroom',
                    image_url: item.image_url_public || item.image_url_admin || 'images/hero-classroom.jpg'
                }));
                // Show live admin items directly!
                currentGalleryList = mapped;
            } else {
                currentGalleryList = FALLBACK_GALLERY_ITEMS;
            }
            applyLimitAndRender(currentGalleryList);
        })
        .catch(() => {
            currentGalleryList = FALLBACK_GALLERY_ITEMS;
            applyLimitAndRender(currentGalleryList);
        });

    initFilterButtons();
}

function applyLimitAndRender(items) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    const limitAttr = container.getAttribute('data-limit');
    let itemsToRender = items;
    if (limitAttr && !isNaN(parseInt(limitAttr, 10))) {
        itemsToRender = items.slice(0, parseInt(limitAttr, 10));
    }
    currentFilteredList = itemsToRender;
    renderGallery(itemsToRender);
}

function renderGallery(items) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    currentFilteredList = items;

    if (!items.length) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <span class="text-5xl">🎨</span>
                <p class="font-heading text-xl text-gray-500 mt-3">No photos found in this category.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map((item, idx) => `
        <div class="gallery-card group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 sm:border-4 border-transparent hover:border-fs-pink transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
             onclick="openLightbox(${idx})" data-category="${item.category}">
            <div class="aspect-[4/3] sm:h-64 w-full overflow-hidden bg-gray-100 relative">
                <img src="${item.image_url}" alt="${item.title} - First Steps Pre School Tezpur" 
                     class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     loading="lazy" onerror="this.onerror=null; this.src='images/hero-classroom.jpg'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                    <span class="bg-fs-yellow text-fs-text font-bold text-xs uppercase tracking-wider py-1 px-3 rounded-full w-max mb-2">
                        ${formatCategoryBadge(item.category)}
                    </span>
                    <h4 class="font-heading text-xl mb-1 text-white">${item.title}</h4>
                    <p class="text-sm text-gray-200 line-clamp-2">${item.description}</p>
                    <span class="mt-3 inline-flex items-center text-fs-yellow font-bold text-sm">
                        View Full Photo 🔍
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function initFilterButtons() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('bg-fs-blue', 'text-white', 'shadow-md');
                b.classList.add('bg-white', 'text-gray-600');
            });
            btn.classList.remove('bg-white', 'text-gray-600');
            btn.classList.add('bg-fs-blue', 'text-white', 'shadow-md');

            const targetCategory = btn.getAttribute('data-filter');
            if (targetCategory === 'all') {
                applyLimitAndRender(currentGalleryList);
            } else {
                const filtered = currentGalleryList.filter(item => {
                    const norm = normalizeCategory(item.category);
                    return item.category === targetCategory || norm === targetCategory;
                });
                applyLimitAndRender(filtered);
            }
        });
    });
}

/* ==========================================================================
   Lightbox Modal
   ========================================================================== */
function initLightbox() {
    let modal = document.getElementById('lightbox-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'lightbox-modal';
        modal.className = 'lightbox-modal';
        modal.innerHTML = `
            <div class="lightbox-content max-w-4xl w-full mx-4 bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                <button id="close-lightbox" class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white font-bold flex items-center justify-center hover:bg-fs-pink transition-colors" aria-label="Close Lightbox">
                    ✕
                </button>
                <button id="prev-lightbox" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 text-white text-2xl flex items-center justify-center hover:bg-fs-blue transition-colors" aria-label="Previous Photo">
                    ‹
                </button>
                <button id="next-lightbox" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 text-white text-2xl flex items-center justify-center hover:bg-fs-blue transition-colors" aria-label="Next Photo">
                    ›
                </button>
                <div class="max-h-[75vh] bg-black flex items-center justify-center overflow-hidden">
                    <img id="lightbox-img" src="" alt="First Steps Gallery" class="max-h-[75vh] w-auto max-w-full object-contain">
                </div>
                <div class="p-6 bg-white border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 id="lightbox-title" class="font-heading text-2xl text-fs-blue mb-1"></h3>
                        <p id="lightbox-desc" class="text-gray-600 font-medium"></p>
                    </div>
                    <span id="lightbox-counter" class="text-sm font-bold text-gray-400 bg-gray-100 py-1.5 px-4 rounded-full"></span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-lightbox').addEventListener('click', closeLightbox);
        document.getElementById('prev-lightbox').addEventListener('click', prevLightbox);
        document.getElementById('next-lightbox').addEventListener('click', nextLightbox);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeLightbox();
        });

        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        modal.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        modal.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches[0]) {
                const diffX = touchStartX - e.changedTouches[0].clientX;
                const diffY = touchStartY - e.changedTouches[0].clientY;
                if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 0) {
                        nextLightbox();
                    } else {
                        prevLightbox();
                    }
                }
            }
        }, { passive: true });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevLightbox();
            if (e.key === 'ArrowRight') nextLightbox();
        });
    }
}

window.openLightbox = function(index) {
    const list = currentFilteredList.length ? currentFilteredList : currentGalleryList;
    if (!list.length) return;
    currentLightboxIndex = index;
    const modal = document.getElementById('lightbox-modal');
    updateLightboxContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function nextLightbox() {
    const list = currentFilteredList.length ? currentFilteredList : currentGalleryList;
    if (!list.length) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % list.length;
    updateLightboxContent();
}

function prevLightbox() {
    const list = currentFilteredList.length ? currentFilteredList : currentGalleryList;
    if (!list.length) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + list.length) % list.length;
    updateLightboxContent();
}

function updateLightboxContent() {
    const list = currentFilteredList.length ? currentFilteredList : currentGalleryList;
    const item = list[currentLightboxIndex];
    if (!item) return;

    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');
    const counter = document.getElementById('lightbox-counter');

    if (img) img.src = item.image_url;
    if (title) title.textContent = item.title;
    if (desc) desc.textContent = item.description;
    if (counter) counter.textContent = `${currentLightboxIndex + 1} of ${list.length}`;
}
