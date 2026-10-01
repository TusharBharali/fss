/* ==========================================================================
   First Steps Pre School — Premium Admin Panel Controller
   Handles state management, client-side validation, and smooth CRUD actions
   ========================================================================== */

'use strict';

// ─── API Endpoints ────────────────────────────────────
const API = {
    auth:       'server/auth.php',
    gallery:    'server/gallery-api.php',
    notices:    'server/notices-api.php',
    activities: 'server/activities-api.php',
    inquiries:  'server/contact-api.php',
    dashboard:  'server/dashboard-api.php',
};

// Generous 25 MB client validation limit
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

// ─── Application State ────────────────────────────────
let currentSection      = 'dashboard';
let galleryFilterCat    = 'all';
let allGalleryItems     = [];
let allNotices          = [];
let allActivities       = [];
let allInquiries        = [];
let pendingDeleteAction = null;

// ─── Initialization ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupNavigation();
    setupMobileSidebar();
    setupLogout();
    setupGalleryModal();
    setupNoticeModal();
    setupActivityModal();
    setupPasswordForm();
    setupConfirmModal();
    loadDashboard();
});

// ─── Authentication Check ─────────────────────────────
async function checkAuth() {
    try {
        const fd = new FormData();
        fd.append('action', 'check');
        const res  = await fetch(API.auth, { method: 'POST', body: fd });
        const data = await res.json();
        if (!data.success) {
            window.location.href = 'login.php';
        } else {
            const nameEl = document.getElementById('admin-name-badge');
            if (nameEl) nameEl.textContent = data.name || 'Administrator';
        }
    } catch {
        window.location.href = 'login.php';
    }
}

// ─── Navigation & Routing ─────────────────────────────
function setupNavigation() {
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const sec = item.dataset.section;
            switchSection(sec);
            closeSidebar();
        });
    });
}

function switchSection(sec) {
    currentSection = sec;

    // Update sidebar navigation pills
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.section === sec);
    });

    // Update section visibility
    document.querySelectorAll('.section').forEach(s => {
        s.classList.toggle('hidden', s.id !== `section-${sec}`);
    });

    // Update topbar title
    const titles = {
        dashboard:  'Dashboard Overview',
        gallery:    'Photo Gallery Management',
        notices:    'Notice Board Announcements',
        activities: 'Curriculum & Activities',
        inquiries:  'Tour Inquiries & Messages',
        settings:   'Change Admin Password',
    };
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = titles[sec] || 'Admin Dashboard';

    // Lazy load section data
    if (sec === 'dashboard')  loadDashboard();
    if (sec === 'gallery')    loadGallery();
    if (sec === 'notices')    loadNotices();
    if (sec === 'activities') loadActivities();
    if (sec === 'inquiries')  loadInquiries();
}

// ─── Mobile Sidebar Controls ──────────────────────────
function setupMobileSidebar() {
    const toggle  = document.getElementById('menu-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    const close   = document.getElementById('sidebar-close');

    toggle?.addEventListener('click', openSidebar);
    overlay?.addEventListener('click', closeSidebar);
    close?.addEventListener('click',  closeSidebar);
}
function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ─── Sign Out ─────────────────────────────────────────
function setupLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        const fd = new FormData();
        fd.append('action', 'logout');
        await fetch(API.auth, { method: 'POST', body: fd });
        window.location.href = 'login.php';
    });
}

// ─── Cheerful Toast Notifications ─────────────────────
function toast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : 'ℹ ';
    t.innerHTML = `<strong>${icon}</strong> ${esc(msg)}`;
    container.appendChild(t);

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(60px)';
        t.style.transition = '0.35s ease';
        setTimeout(() => t.remove(), 350);
    }, 3600);
}

// ─── Modal Helpers ────────────────────────────────────
function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('hidden');
    document.body.style.overflow = '';
}
window.openModal     = openModal;
window.closeModal    = closeModal;
window.switchSection = switchSection;

// Close modals when clicking the backdrop
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

// ─── Modal Alert Helpers ──────────────────────────────
function showModalAlert(containerId, msg, type = 'error') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = (type === 'error' ? '⚠️ ' : '✓ ') + esc(msg);
    el.className = type === 'error' ? 'alert-error' : 'alert-success';
    el.style.display = 'block';
}
function hideModalAlert(containerId) {
    const el = document.getElementById(containerId);
    if (el) { el.style.display = 'none'; el.className = ''; el.textContent = ''; }
}

// ─── Delete Confirmation Modal ────────────────────────
function setupConfirmModal() {
    document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
        if (pendingDeleteAction) {
            await pendingDeleteAction();
            pendingDeleteAction = null;
        }
        closeModal('confirm-modal');
    });
}
function confirmDelete(message, action) {
    document.getElementById('confirm-message').textContent = message;
    pendingDeleteAction = action;
    openModal('confirm-modal');
}

// ══════════════════════════════════════════════════════
// 1. DASHBOARD OVERVIEW
// ══════════════════════════════════════════════════════
async function loadDashboard() {
    try {
        const res  = await fetch(API.dashboard);
        const data = await res.json();
        if (!data.success) return;

        const s = data.stats;
        setText('stat-gallery',    `${s.gallery_active} / ${s.gallery_total}`);
        setText('stat-notices',    `${s.notices_active} / ${s.notices_total}`);
        setText('stat-activities', `${s.activities_active} / ${s.activities_total}`);
        setText('stat-inquiries',  `${s.inquiries_unread} Unread`);

        // Update sidebar unread badge
        const badge = document.getElementById('sidebar-inquiries-badge');
        if (badge) {
            if (s.inquiries_unread > 0) {
                badge.textContent = s.inquiries_unread;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        // Recent Gallery Items
        const rg = document.getElementById('recent-gallery');
        if (rg) {
            rg.innerHTML = s.recent_gallery?.length
                ? s.recent_gallery.map(i => `
                    <li>
                        <span class="item-title">📷 ${esc(i.title)}</span>
                        <span class="item-meta">${esc(i.category || 'General')} &bull; ${fmtDate(i.created_at)}</span>
                    </li>`).join('')
                : '<li><span class="item-meta">No photos uploaded yet.</span></li>';
        }

        // Recent Notices
        const rn = document.getElementById('recent-notices');
        if (rn) {
            rn.innerHTML = s.recent_notices?.length
                ? s.recent_notices.map(i => `
                    <li>
                        <span class="item-title">${i.is_highlighted ? '📌 ' : '🔔 '}${esc(i.title)}</span>
                        <span class="item-meta">${badgeHtml(i.status)}</span>
                    </li>`).join('')
                : '<li><span class="item-meta">No notices published yet.</span></li>';
        }

        // Recent Inquiries
        const ri = document.getElementById('recent-inquiries');
        if (ri) {
            ri.innerHTML = s.recent_inquiries?.length
                ? s.recent_inquiries.map(i => `
                    <li>
                        <span class="item-title">
                            ${i.status === 'Unread' ? '🔴 ' : '💬 '}
                            <strong>${esc(i.name)}</strong> 
                            <span style="font-weight:normal;color:var(--fs-text-muted)">(${esc(i.phone || i.email)})</span>
                        </span>
                        <span class="item-meta">
                            ${badgeHtml(i.status)}
                            <button class="link-btn" style="margin-left:8px" onclick="viewInquiry(${i.id})">Read</button>
                        </span>
                    </li>`).join('')
                : '<li><span class="item-meta">No tour requests received yet.</span></li>';
        }

    } catch (err) {
        console.error('Failed to load dashboard data:', err);
    }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ══════════════════════════════════════════════════════
// 2. PHOTO GALLERY
// ══════════════════════════════════════════════════════
async function loadGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-state"><div class="spinner-lg"></div> Loading photo collection…</div>';

    try {
        const fd = new FormData();
        fd.append('action', 'get_all');
        const res  = await fetch(API.gallery, { method: 'POST', body: fd });
        const data = await res.json();
        allGalleryItems = data.items || [];
        renderGallery();
    } catch {
        grid.innerHTML = '<div class="loading-state">Could not connect to photo gallery API.</div>';
    }
}

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const items = galleryFilterCat === 'all'
        ? allGalleryItems
        : allGalleryItems.filter(i => (i.category || '').toLowerCase() === galleryFilterCat.toLowerCase());

    if (!items.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎨</div>
                <p>No photos found in this category.</p>
                <button class="btn-primary" style="margin-top:14px" onclick="openModal('gallery-modal')">
                    <i class="fa fa-camera"></i> Upload Photo Now
                </button>
            </div>`;
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="gallery-card ${item.is_active == 0 ? 'gallery-inactive' : ''}" data-id="${item.id}">
            <div class="gallery-card-img-wrap">
                ${item.image_url
                    ? `<img class="gallery-card-img" src="${esc(item.image_url)}" alt="${esc(item.title)}" loading="lazy">`
                    : `<div class="gallery-card-img-placeholder">🖼️</div>`}
            </div>
            <div class="gallery-card-body">
                <div class="gallery-card-title" title="${esc(item.title)}">${esc(item.title)}</div>
                <div class="gallery-card-cat">${esc(item.category || 'General')}</div>
                <div class="gallery-card-actions">
                    <button class="btn-icon btn-edit" title="Edit Photo Details"
                        onclick="editGalleryItem(${item.id})"><i class="fa fa-pen"></i></button>
                    <button class="btn-icon btn-toggle" title="${item.is_active ? 'Hide from Website' : 'Show on Website'}"
                        onclick="toggleGalleryItem(${item.id})"><i class="fa ${item.is_active ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
                    <button class="btn-icon btn-del" title="Delete Photo"
                        onclick="deleteGalleryItem(${item.id}, '${esc(item.title)}')"><i class="fa fa-trash"></i></button>
                </div>
            </div>
        </div>`).join('');
}

// Gallery filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        galleryFilterCat = btn.dataset.cat;
        renderGallery();
    });
});

// Gallery Modal Setup
function setupGalleryModal() {
    const dropZone   = document.getElementById('gallery-drop-zone');
    const imgInput   = document.getElementById('gallery-image-input');
    const previewImg = document.getElementById('gallery-preview-img');
    const dropInner  = document.getElementById('gallery-drop-inner');
    const changeBtn  = document.getElementById('gallery-change-img-btn');

    function showPreview(file) {
        if (!file) return;

        // Client-side file size validation (25MB)
        if (file.size > MAX_UPLOAD_BYTES) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            showModalAlert('gallery-modal-alert', `Photo is too large (${sizeMB} MB). Maximum allowed size is 25 MB.`);
            imgInput.value = '';
            return;
        }

        hideModalAlert('gallery-modal-alert');
        const reader = new FileReader();
        reader.onload = e => {
            previewImg.src = e.target.result;
            previewImg.classList.remove('hidden');
            dropInner.classList.add('hidden');
            changeBtn.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
    }

    dropZone.addEventListener('click', () => imgInput.click());
    imgInput.addEventListener('change', () => { if (imgInput.files[0]) showPreview(imgInput.files[0]); });
    changeBtn.addEventListener('click', () => {
        imgInput.value = '';
        previewImg.classList.add('hidden');
        dropInner.classList.remove('hidden');
        changeBtn.style.display = 'none';
    });

    // Drag & drop
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
            const dt = new DataTransfer();
            dt.items.add(file);
            imgInput.files = dt.files;
            showPreview(file);
        }
    });

    // Form submit
    document.getElementById('gallery-form').addEventListener('submit', async e => {
        e.preventDefault();
        hideModalAlert('gallery-modal-alert');
        const form   = e.target;
        const btn    = document.getElementById('gallery-submit-btn');
        const isEdit = form.querySelector('[name=id]').value;

        if (!isEdit && !imgInput.files[0]) {
            showModalAlert('gallery-modal-alert', 'Please select an image file to upload.');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Uploading…';

        const fd = new FormData(form);
        fd.set('action', isEdit ? 'update' : 'add');

        try {
            const res  = await fetch(API.gallery, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                toast(data.message || 'Photo saved successfully!');
                closeModal('gallery-modal');
                resetGalleryModal();
                loadGallery();
                loadDashboard();
            } else {
                showModalAlert('gallery-modal-alert', data.message || 'Upload error occurred.');
            }
        } catch {
            showModalAlert('gallery-modal-alert', 'Network or server error during upload. Please verify file size and connection.');
        }

        btn.disabled = false;
        btn.innerHTML = isEdit ? '<i class="fa fa-save"></i> Save Changes' : '<i class="fa fa-upload"></i> Upload Photo';
    });
}

function resetGalleryModal() {
    document.getElementById('gallery-form').reset();
    document.getElementById('gallery-id').value = '';
    document.getElementById('gallery-preview-img').classList.add('hidden');
    document.getElementById('gallery-drop-inner').classList.remove('hidden');
    document.getElementById('gallery-change-img-btn').style.display = 'none';
    document.getElementById('gallery-modal-title').textContent = 'Upload Gallery Photo';
    document.getElementById('gallery-submit-btn').innerHTML = '<i class="fa fa-upload"></i> Upload Photo';
    hideModalAlert('gallery-modal-alert');
}

window.editGalleryItem = function (id) {
    const item = allGalleryItems.find(i => i.id == id);
    if (!item) return;
    resetGalleryModal();
    const form = document.getElementById('gallery-form');
    form.querySelector('[name=id]').value          = id;
    form.querySelector('[name=title]').value       = item.title || '';
    form.querySelector('[name=description]').value = item.description || '';
    form.querySelector('[name=category]').value    = item.category || 'General';
    document.getElementById('gallery-modal-title').textContent = 'Edit Photo Details';
    document.getElementById('gallery-submit-btn').innerHTML    = '<i class="fa fa-save"></i> Save Changes';

    if (item.image_url) {
        const img = document.getElementById('gallery-preview-img');
        img.src = item.image_url;
        img.classList.remove('hidden');
        document.getElementById('gallery-drop-inner').classList.add('hidden');
        document.getElementById('gallery-change-img-btn').style.display = 'inline-flex';
    }
    openModal('gallery-modal');
};

window.toggleGalleryItem = async function (id) {
    const fd = new FormData();
    fd.append('action', 'toggle');
    fd.append('id', id);
    const res  = await fetch(API.gallery, { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
        toast('Visibility status updated.', 'info');
        loadGallery();
        loadDashboard();
    } else {
        toast(data.message, 'error');
    }
};

window.deleteGalleryItem = function (id, title) {
    confirmDelete(`Permanently delete photo "${title}"? This cannot be undone.`, async () => {
        const fd = new FormData();
        fd.append('action', 'delete');
        fd.append('id', id);
        const res  = await fetch(API.gallery, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            toast('Photo permanently deleted.');
            loadGallery();
            loadDashboard();
        } else {
            toast(data.message, 'error');
        }
    });
};

// ══════════════════════════════════════════════════════
// 3. NOTICE BOARD
// ══════════════════════════════════════════════════════
async function loadNotices() {
    const tbody = document.getElementById('notices-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell"><div class="spinner-lg"></div></td></tr>';

    try {
        const fd = new FormData();
        fd.append('action', 'get_all');
        const res  = await fetch(API.notices, { method: 'POST', body: fd });
        const data = await res.json();
        allNotices = data.items || [];
        renderNotices();
    } catch {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Could not load notices from database.</td></tr>';
    }
}

function renderNotices() {
    const tbody = document.getElementById('notices-tbody');
    if (!tbody) return;

    if (!allNotices.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No notices published yet. Click "Publish New Notice" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = allNotices.map(n => `
        <tr>
            <td>
                <strong>${esc(n.title)}</strong>
                <div style="font-size:0.8rem;color:var(--fs-text-muted);margin-top:2px;max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                    ${esc(n.content)}
                </div>
            </td>
            <td><strong>${fmtDate(n.publish_date)}</strong></td>
            <td>${badgeHtml(n.status)}</td>
            <td>${n.is_highlighted ? '<span class="badge badge-pinned">📌 Pinned</span>' : 'Standard'}</td>
            <td>
                ${n.attachment_name
                    ? `<a href="${esc(n.attachment_url)}" target="_blank" class="link-btn">
                         <i class="fa fa-paperclip"></i> ${esc(n.attachment_type || 'Doc')}
                       </a>`
                    : '—'}
            </td>
            <td>
                <div style="display:flex;gap:6px">
                    <button class="btn-icon btn-edit" title="Edit Notice" onclick="editNotice(${n.id})"><i class="fa fa-pen"></i></button>
                    <button class="btn-icon btn-del"  title="Delete Notice" onclick="deleteNotice(${n.id}, '${esc(n.title)}')"><i class="fa fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

function setupNoticeModal() {
    const fileInput = document.getElementById('notice-file-input');
    const fileName  = document.getElementById('notice-file-name');

    fileInput?.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            if (file.size > MAX_UPLOAD_BYTES) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                showModalAlert('notice-modal-alert', `Attachment is too large (${sizeMB} MB). Maximum allowed size is 25 MB.`);
                fileInput.value = '';
                fileName.textContent = 'No file selected';
                return;
            }
            hideModalAlert('notice-modal-alert');
            fileName.textContent = file.name;
        } else {
            fileName.textContent = 'No file selected';
        }
    });

    // Default publish date to today
    const dateInput = document.querySelector('#notice-form [name=publish_date]');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    document.getElementById('notice-form').addEventListener('submit', async e => {
        e.preventDefault();
        hideModalAlert('notice-modal-alert');
        const form   = e.target;
        const btn    = document.getElementById('notice-submit-btn');
        const isEdit = form.querySelector('[name=id]').value;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Publishing…';

        const fd = new FormData(form);
        fd.set('action', isEdit ? 'update' : 'add');

        try {
            const res  = await fetch(API.notices, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                toast(data.message || 'Notice saved successfully!');
                closeModal('notice-modal');
                resetNoticeModal();
                loadNotices();
                loadDashboard();
            } else {
                showModalAlert('notice-modal-alert', data.message || 'Error publishing notice.');
            }
        } catch {
            showModalAlert('notice-modal-alert', 'Network or server error. Please try again.');
        }

        btn.disabled = false;
        btn.innerHTML = isEdit ? '<i class="fa fa-save"></i> Save Changes' : '<i class="fa fa-bullhorn"></i> Publish Notice';
    });
}

function resetNoticeModal() {
    document.getElementById('notice-form').reset();
    document.getElementById('notice-id').value = '';
    document.getElementById('notice-file-name').textContent = 'No file selected';
    document.getElementById('notice-modal-title').textContent = 'Publish Notice Announcement';
    document.getElementById('notice-submit-btn').innerHTML = '<i class="fa fa-bullhorn"></i> Publish Notice';

    const dateInput = document.querySelector('#notice-form [name=publish_date]');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    hideModalAlert('notice-modal-alert');
}

window.editNotice = function (id) {
    const item = allNotices.find(n => n.id == id);
    if (!item) return;
    resetNoticeModal();
    const form = document.getElementById('notice-form');
    form.querySelector('[name=id]').value               = id;
    form.querySelector('[name=title]').value            = item.title || '';
    form.querySelector('[name=content]').value          = item.content || '';
    form.querySelector('[name=publish_date]').value     = item.publish_date || '';
    form.querySelector('[name=expiry_date]').value      = item.expiry_date  || '';
    form.querySelector('[name=status]').value           = item.status || 'Active';
    form.querySelector('[name=is_highlighted]').checked = item.is_highlighted == 1;

    if (item.attachment_name) {
        document.getElementById('notice-file-name').textContent = item.attachment_name;
    }

    document.getElementById('notice-modal-title').textContent = 'Edit Notice Announcement';
    document.getElementById('notice-submit-btn').innerHTML    = '<i class="fa fa-save"></i> Save Changes';
    openModal('notice-modal');
};

window.deleteNotice = function (id, title) {
    confirmDelete(`Delete notice "${title}"? This cannot be undone.`, async () => {
        const fd = new FormData();
        fd.append('action', 'delete');
        fd.append('id', id);
        const res  = await fetch(API.notices, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            toast('Notice deleted.');
            loadNotices();
            loadDashboard();
        } else {
            toast(data.message, 'error');
        }
    });
};

// ══════════════════════════════════════════════════════
// 4. CURRICULUM ACTIVITIES
// ══════════════════════════════════════════════════════
async function loadActivities() {
    const grid = document.getElementById('activities-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-state"><div class="spinner-lg"></div> Loading activities…</div>';

    try {
        const fd = new FormData();
        fd.append('action', 'get_all');
        const res  = await fetch(API.activities, { method: 'POST', body: fd });
        const data = await res.json();
        allActivities = data.items || [];
        renderActivities();
    } catch {
        grid.innerHTML = '<div class="loading-state">Could not load activities from database.</div>';
    }
}

function renderActivities() {
    const grid = document.getElementById('activities-grid');
    if (!grid) return;

    if (!allActivities.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⭐</div>
                <p>No activities added yet.</p>
                <button class="btn-primary" style="margin-top:14px" onclick="openModal('activity-modal')">
                    <i class="fa fa-plus"></i> Add First Activity
                </button>
            </div>`;
        return;
    }

    grid.innerHTML = allActivities.map(a => `
        <div class="activity-card ${esc(a.color_class || 'blue')} ${a.is_active == 0 ? 'inactive' : ''}">
            <div class="activity-icon">${esc(a.icon || '🎨')}</div>
            <div class="activity-title">${esc(a.title)}</div>
            <div class="activity-desc">${esc(a.description)}</div>
            <div class="activity-meta">
                ${a.age_group ? `<span>👶 Age Group: ${esc(a.age_group)}</span>` : ''}
                ${a.schedule  ? `<span>🕐 Schedule: ${esc(a.schedule)}</span>`  : ''}
            </div>
            <div class="activity-actions">
                <button class="btn-icon btn-edit" title="Edit Activity" onclick="editActivity(${a.id})"><i class="fa fa-pen"></i></button>
                <button class="btn-icon btn-toggle" title="${a.is_active ? 'Hide from Website' : 'Show on Website'}" onclick="toggleActivity(${a.id})"><i class="fa ${a.is_active ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
                <button class="btn-icon btn-del" title="Delete Activity" onclick="deleteActivity(${a.id}, '${esc(a.title)}')"><i class="fa fa-trash"></i></button>
            </div>
        </div>`).join('');
}

function setupActivityModal() {
    const imgInput = document.getElementById('activity-img-input');
    const imgName  = document.getElementById('activity-img-name');

    imgInput?.addEventListener('change', () => {
        imgName.textContent = imgInput.files[0]?.name || 'No photo selected';
    });

    document.getElementById('activity-form').addEventListener('submit', async e => {
        e.preventDefault();
        hideModalAlert('activity-modal-alert');
        const form   = e.target;
        const btn    = document.getElementById('activity-submit-btn');
        const isEdit = form.querySelector('[name=id]').value;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Saving…';

        const fd = new FormData(form);
        fd.set('action', isEdit ? 'update' : 'add');

        try {
            const res  = await fetch(API.activities, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                toast(data.message || 'Activity saved successfully!');
                closeModal('activity-modal');
                resetActivityModal();
                loadActivities();
                loadDashboard();
            } else {
                showModalAlert('activity-modal-alert', data.message || 'Error saving activity.');
            }
        } catch {
            showModalAlert('activity-modal-alert', 'Network or server error.');
        }

        btn.disabled = false;
        btn.innerHTML = isEdit ? '<i class="fa fa-save"></i> Save Changes' : '<i class="fa fa-star"></i> Save Activity';
    });
}

function resetActivityModal() {
    document.getElementById('activity-form').reset();
    document.getElementById('activity-id').value = '';
    document.getElementById('activity-img-name').textContent = 'No photo selected';
    document.getElementById('activity-modal-title').textContent = 'Add Activity Program';
    document.getElementById('activity-submit-btn').innerHTML = '<i class="fa fa-star"></i> Save Activity';
    hideModalAlert('activity-modal-alert');
}

window.editActivity = function (id) {
    const item = allActivities.find(a => a.id == id);
    if (!item) return;
    resetActivityModal();
    const form = document.getElementById('activity-form');
    form.querySelector('[name=id]').value          = id;
    form.querySelector('[name=title]').value       = item.title || '';
    form.querySelector('[name=description]').value = item.description || '';
    form.querySelector('[name=icon]').value        = item.icon || '🎨';
    form.querySelector('[name=color_class]').value = item.color_class || 'blue';
    form.querySelector('[name=age_group]').value   = item.age_group || '';
    form.querySelector('[name=schedule]').value    = item.schedule || '';
    form.querySelector('[name=sort_order]').value  = item.sort_order || 0;
    document.getElementById('activity-modal-title').textContent = 'Edit Activity Program';
    document.getElementById('activity-submit-btn').innerHTML    = '<i class="fa fa-save"></i> Save Changes';
    openModal('activity-modal');
};

window.toggleActivity = async function (id) {
    const fd = new FormData();
    fd.append('action', 'toggle');
    fd.append('id', id);
    const res  = await fetch(API.activities, { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
        toast('Activity status updated.', 'info');
        loadActivities();
        loadDashboard();
    } else {
        toast(data.message, 'error');
    }
};

window.deleteActivity = function (id, title) {
    confirmDelete(`Delete activity "${title}"? This cannot be undone.`, async () => {
        const fd = new FormData();
        fd.append('action', 'delete');
        fd.append('id', id);
        const res  = await fetch(API.activities, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            toast('Activity deleted.');
            loadActivities();
            loadDashboard();
        } else {
            toast(data.message, 'error');
        }
    });
};

// ══════════════════════════════════════════════════════
// 5. INQUIRIES & TOUR REQUESTS
// ══════════════════════════════════════════════════════
async function loadInquiries() {
    const tbody = document.getElementById('inquiries-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell"><div class="spinner-lg"></div></td></tr>';

    try {
        const fd = new FormData();
        fd.append('action', 'get_all');
        const res  = await fetch(API.inquiries, { method: 'POST', body: fd });
        const data = await res.json();
        allInquiries = data.items || [];
        renderInquiries();
    } catch {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Could not load inquiries.</td></tr>';
    }
}

function renderInquiries() {
    const tbody = document.getElementById('inquiries-tbody');
    if (!tbody) return;

    if (!allInquiries.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No tour inquiries or parent messages received yet.</td></tr>';
        return;
    }

    tbody.innerHTML = allInquiries.map(inq => `
        <tr>
            <td>
                <strong>${esc(inq.name)}</strong>
            </td>
            <td>
                <div style="font-size:0.85rem">
                    <div><a href="mailto:${esc(inq.email)}" style="color:var(--fs-blue)">✉ ${esc(inq.email)}</a></div>
                    <div><a href="tel:${esc(inq.phone)}" style="color:var(--fs-green);font-weight:700">📞 ${esc(inq.phone || 'N/A')}</a></div>
                </div>
            </td>
            <td>
                <div style="font-size:0.88rem;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(inq.message)}">
                    ${esc(inq.message)}
                </div>
            </td>
            <td><strong>${esc(inq.created_at_formatted || inq.created_at)}</strong></td>
            <td>${badgeHtml(inq.status)}</td>
            <td>
                <div style="display:flex;gap:6px">
                    <button class="btn-icon btn-view" title="Read Details" onclick="viewInquiry(${inq.id})"><i class="fa fa-envelope-open"></i></button>
                    <button class="btn-icon btn-del"  title="Delete Inquiry" onclick="deleteInquiry(${inq.id}, '${esc(inq.name)}')"><i class="fa fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

window.viewInquiry = function (id) {
    const item = allInquiries.find(i => i.id == id);
    if (!item) return;

    document.getElementById('inquiry-modal-name').textContent    = item.name;
    document.getElementById('inquiry-modal-email').textContent   = item.email;
    document.getElementById('inquiry-modal-email').href          = 'mailto:' + item.email;
    document.getElementById('inquiry-modal-phone').textContent   = item.phone || 'None provided';
    document.getElementById('inquiry-modal-phone').href          = 'tel:' + item.phone;
    document.getElementById('inquiry-modal-date').textContent    = item.created_at_formatted || item.created_at;
    document.getElementById('inquiry-modal-message').textContent = item.message;

    const statusBadge = document.getElementById('inquiry-modal-status');
    statusBadge.className = 'badge ' + (item.status === 'Unread' ? 'badge-unread' : item.status === 'Replied' ? 'badge-replied' : 'badge-read');
    statusBadge.textContent = item.status;

    // Mark as Read automatically if unread
    if (item.status === 'Unread') {
        markInquiryStatus(item.id, 'Read', false);
    }

    const replyBtn = document.getElementById('inquiry-reply-btn');
    replyBtn.onclick = () => {
        markInquiryStatus(item.id, 'Replied', true);
        closeModal('inquiry-modal');
    };

    openModal('inquiry-modal');
};

async function markInquiryStatus(id, newStatus, showToast = true) {
    const fd = new FormData();
    fd.append('action', 'update_status');
    fd.append('id', id);
    fd.append('status', newStatus);

    const res  = await fetch(API.inquiries, { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
        if (showToast) toast(`Inquiry marked as ${newStatus}.`);
        loadInquiries();
        loadDashboard();
    }
}

window.deleteInquiry = function (id, name) {
    confirmDelete(`Delete inquiry from "${name}"?`, async () => {
        const fd = new FormData();
        fd.append('action', 'delete');
        fd.append('id', id);
        const res  = await fetch(API.inquiries, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            toast('Inquiry deleted.');
            loadInquiries();
            loadDashboard();
        } else {
            toast(data.message, 'error');
        }
    });
};

// ══════════════════════════════════════════════════════
// 6. ADMIN PASSWORD FORM
// ══════════════════════════════════════════════════════
function setupPasswordForm() {
    const alert = document.getElementById('pw-alert');
    document.getElementById('pw-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        alert.style.display = 'none';
        const form = e.target;
        const btn  = form.querySelector('button[type=submit]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Updating Password…';

        const fd = new FormData(form);
        fd.append('action', 'change_password');

        try {
            const res  = await fetch(API.auth, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                alert.textContent = '✓ ' + data.message;
                alert.className = 'alert-success';
                alert.style.display = 'block';
                form.reset();
                toast('Password successfully updated!');
            } else {
                alert.textContent = '⚠️ ' + data.message;
                alert.className = 'alert-error';
                alert.style.display = 'block';
            }
        } catch {
            alert.textContent = '⚠️ Network error. Please try again.';
            alert.className = 'alert-error';
            alert.style.display = 'block';
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fa fa-save"></i> Save New Password';
    });
}

// ─── Utility Helpers ──────────────────────────────────
function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function fmtDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) 
        ? dateStr 
        : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function badgeHtml(status) {
    const map = {
        Active:  'badge-active',
        Draft:   'badge-draft',
        Expired: 'badge-expired',
        Unread:  'badge-unread',
        Read:    'badge-read',
        Replied: 'badge-replied',
    };
    return `<span class="badge ${map[status] || 'badge-draft'}">${esc(status)}</span>`;
}
