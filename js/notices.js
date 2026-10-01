/**
 * First Steps Pre School - Dynamic Notice Board
 */

const FALLBACK_NOTICES = [
    {
        id: 1,
        title: "🎒 Admissions Open for Academic Year 2026-2027",
        content: "Enrollment is now officially open for Playgroup (1.5+ yrs), Nursery (2.5+ yrs), Junior KG, and Senior KG. Limited seats are available per batch to ensure our caring 1:8 teacher-child ratio.",
        publish_date_formatted: "May 15, 2026",
        is_highlighted: 1,
        attachment_name: "Admissions_Brochure_2026_27.pdf",
        tag: "Admissions"
    },
    {
        id: 2,
        title: "🌾 Traditional Magh Bihu Celebration & Cultural Day",
        content: "We invite our little learners to dress up in traditional attire for our annual festive celebration featuring traditional rhymes, story sharing, and delicious homemade sweets.",
        publish_date_formatted: "Jan 12, 2026",
        is_highlighted: 0,
        attachment_name: "Bihu_Schedule_Notice.pdf",
        tag: "Events"
    },
    {
        id: 3,
        title: "🌱 Nature Explorers & Seed Planting Workshop",
        content: "Under our unstructured learning framework, our teachers will lead a fun-filled outdoor gardening day where every child pots their own sunflower seed to take home and watch grow.",
        publish_date_formatted: "Apr 02, 2026",
        is_highlighted: 0,
        attachment_name: null,
        tag: "Curriculum"
    },
    {
        id: 4,
        title: "🍉 Annual Fruit Salad Day & Healthy Nutrition Fun",
        content: "Parents are requested to send one favorite sliced fruit with their child as we celebrate shapes, colors, and nutritious dining habits in our bright dining corner.",
        publish_date_formatted: "Mar 18, 2026",
        is_highlighted: 0,
        attachment_name: "Fruit_Day_Guidelines.pdf",
        tag: "Activity"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initNotices();
});

function initNotices() {
    const listContainer = document.getElementById('notices-list');
    const marqueeContainer = document.getElementById('notices-marquee');
    if (!listContainer && !marqueeContainer) return;

    fetch('fss-admin/server/get-notices.php')
        .then(res => res.json())
        .then(data => {
            let notices = [];
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                notices = data.data;
            } else {
                notices = FALLBACK_NOTICES;
            }
            renderNotices(notices);
        })
        .catch(() => {
            renderNotices(FALLBACK_NOTICES);
        });
}

function renderNotices(notices) {
    const listContainer = document.getElementById('notices-list');
    const marqueeContainer = document.getElementById('notices-marquee');

    // 1. Ticker / Marquee
    if (marqueeContainer) {
        if (!notices.length) {
            marqueeContainer.innerHTML = '<span class="text-gray-500 font-semibold text-xs">No current announcements.</span>';
        } else {
            let currentIdx = 0;
            const updateMarquee = () => {
                const n = notices[currentIdx];
                marqueeContainer.innerHTML = `
                    <a href="notices.html" class="inline-flex items-center gap-2 text-gray-800 font-semibold hover:text-fs-pink transition-all truncate">
                        <span class="text-fs-blue font-bold">${n.publish_date_formatted || 'Notice'}:</span>
                        <span class="truncate">${n.title}</span>
                        <span class="text-xs text-fs-pink ml-2 font-bold whitespace-nowrap">Read More →</span>
                    </a>
                `;
                currentIdx = (currentIdx + 1) % notices.length;
            };
            updateMarquee();
            if (notices.length > 1) {
                setInterval(updateMarquee, 4500);
            }
        }
    }

    // 2. Main Notice Cards
    if (listContainer) {
        const isHomePage = listContainer.getAttribute('data-limit') === '3';
        const displayNotices = isHomePage ? notices.slice(0, 3) : notices;

        listContainer.innerHTML = displayNotices.map(notice => {
            const fileName = notice.attachment_name || (notice.attachment_path ? notice.attachment_path.split('/').pop() : '');
            const hasAttachment = Boolean(fileName);
            const downloadUrl = notice.attachment_download 
                || (hasAttachment ? `fss-admin/server/download-handler.php?file=${encodeURIComponent(fileName)}` : '#');

            return `
                <div class="notice-pin-card fs-card relative p-6 bg-white rounded-3xl border-2 ${notice.is_highlighted ? 'border-fs-yellow bg-[#FFFDF7]' : 'border-gray-100'} hover:border-fs-blue transition-all duration-300">
                    <span class="notice-pin-icon">📌</span>
                    <div class="flex flex-wrap items-center gap-3 mb-3">
                        <span class="fun-badge ${notice.is_highlighted ? 'fun-badge-pink' : 'fun-badge-blue'} text-xs">
                            ${notice.is_highlighted ? '⭐ Urgent Announcement' : '🔔 General Notice'}
                        </span>
                        <span class="text-xs font-bold text-gray-500">
                            📅 ${notice.publish_date_formatted || 'Recent'}
                        </span>
                    </div>
                    <h3 class="font-heading text-xl md:text-2xl text-fs-blue mb-3">${notice.title}</h3>
                    <p class="text-gray-600 mb-6 leading-relaxed">${notice.content}</p>
                    
                    <div class="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        ${hasAttachment ? `
                            <div class="flex items-center gap-2">
                                <a href="${downloadUrl}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-bold text-fs-blue bg-fs-blue-light hover:bg-fs-blue hover:text-white py-2 px-4 rounded-full transition-colors">
                                    <span>📄</span> View Document
                                </a>
                                <a href="${downloadUrl}&download=1" class="inline-flex items-center gap-1.5 text-xs font-bold text-fs-green bg-fs-green-light hover:bg-fs-green hover:text-white py-2 px-4 rounded-full transition-colors">
                                    <span>📥</span> Download
                                </a>
                            </div>
                        ` : `
                            <span class="text-xs font-semibold text-gray-400">First Steps Pre School Administration</span>
                        `}
                        <a href="contact.html" class="text-xs font-bold text-fs-pink hover:underline ml-auto">
                            Inquire with Office →
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
}
