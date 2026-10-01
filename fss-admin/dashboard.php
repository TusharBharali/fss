<?php
require_once __DIR__ . '/server/config.php';
if (!isLoggedIn()) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard — First Steps Pre School | Tezpur</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>

<!-- ═══ MOBILE OVERLAY ═══ -->
<div class="sidebar-overlay" id="sidebar-overlay"></div>

<!-- ═══ SIDEBAR ═══ -->
<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <img src="../images/logo.png" alt="First Steps Logo" class="sidebar-logo">
        <div>
            <div class="sidebar-title">First Steps <span>Admin</span></div>
            <div class="sidebar-sub">Pre School &bull; Tezpur</div>
        </div>
        <button class="sidebar-close" id="sidebar-close" aria-label="Close sidebar"><i class="fa fa-times"></i></button>
    </div>

    <nav class="sidebar-nav">
        <a href="#" class="nav-item active" data-section="dashboard">
            <i class="fa fa-chart-pie"></i><span>Dashboard</span>
        </a>
        <a href="#" class="nav-item" data-section="gallery">
            <i class="fa fa-images"></i><span>Photo Gallery</span>
        </a>
        <a href="#" class="nav-item" data-section="notices">
            <i class="fa fa-bullhorn"></i><span>Notice Board</span>
        </a>
        <a href="#" class="nav-item" data-section="activities">
            <i class="fa fa-star"></i><span>Activities</span>
        </a>
        <a href="#" class="nav-item" data-section="inquiries">
            <i class="fa fa-envelope-open-text"></i><span>Tour Requests</span>
            <span class="nav-pill-badge hidden" id="sidebar-inquiries-badge">0</span>
        </a>
        <div class="nav-divider"></div>
        <a href="#" class="nav-item" data-section="settings">
            <i class="fa fa-lock"></i><span>Change Password</span>
        </a>
    </nav>

    <div class="sidebar-footer">
        <a href="../index.html" target="_blank" class="view-site-btn">
            <i class="fa fa-globe"></i> View Public Website
        </a>
        <button class="logout-btn" id="logout-btn">
            <i class="fa fa-sign-out-alt"></i> Sign Out
        </button>
    </div>
</aside>

<!-- ═══ MAIN CONTENT ═══ -->
<main class="main-content">

    <!-- TOP BAR -->
    <header class="topbar">
        <button class="menu-toggle" id="menu-toggle" aria-label="Toggle Navigation">
            <i class="fa fa-bars"></i>
        </button>
        <div class="topbar-title-wrap">
            <div class="topbar-title" id="topbar-title">Dashboard Overview</div>
        </div>
        <div class="topbar-right">
            <a href="../index.html" target="_blank" class="topbar-link">
                <i class="fa fa-external-link"></i> Website
            </a>
            <div class="admin-badge">
                <div class="admin-avatar">👤</div>
                <span id="admin-name-badge">Administrator</span>
            </div>
        </div>
    </header>

    <!-- ── DASHBOARD SECTION ── -->
    <section class="section" id="section-dashboard">
        <div class="section-header">
            <div>
                <h2 class="section-title">👋 Welcome Back!</h2>
                <p class="section-sub">Here is a quick overview of your preschool's public content and inquiries.</p>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button class="btn-primary" onclick="openModal('gallery-modal')">
                    <i class="fa fa-camera"></i> Quick Add Photo
                </button>
                <button class="btn-secondary" onclick="openModal('notice-modal')">
                    <i class="fa fa-bullhorn"></i> Post Notice
                </button>
            </div>
        </div>

        <!-- 4 Stat Cards -->
        <div class="stats-grid" id="stats-grid">
            <div class="stat-card blue" style="cursor:pointer" onclick="switchSection('gallery')">
                <div class="stat-icon">🖼️</div>
                <div class="stat-info">
                    <div class="stat-num" id="stat-gallery">—</div>
                    <div class="stat-label">Gallery Photos</div>
                </div>
            </div>
            <div class="stat-card pink" style="cursor:pointer" onclick="switchSection('notices')">
                <div class="stat-icon">📢</div>
                <div class="stat-info">
                    <div class="stat-num" id="stat-notices">—</div>
                    <div class="stat-label">Active Notices</div>
                </div>
            </div>
            <div class="stat-card green" style="cursor:pointer" onclick="switchSection('activities')">
                <div class="stat-icon">⭐</div>
                <div class="stat-info">
                    <div class="stat-num" id="stat-activities">—</div>
                    <div class="stat-label">Curriculum Activities</div>
                </div>
            </div>
            <div class="stat-card orange" style="cursor:pointer" onclick="switchSection('inquiries')">
                <div class="stat-icon">💌</div>
                <div class="stat-info">
                    <div class="stat-num" id="stat-inquiries">—</div>
                    <div class="stat-label">Tour Inquiries</div>
                </div>
            </div>
        </div>

        <div class="cards-row">
            <!-- Recent Gallery -->
            <div class="dash-card">
                <div class="dash-card-head">
                    <h3>🖼️ Recent Photo Uploads</h3>
                    <button class="link-btn" onclick="switchSection('gallery')">View All</button>
                </div>
                <ul class="recent-list" id="recent-gallery">
                    <li><span class="item-meta">Loading gallery…</span></li>
                </ul>
            </div>

            <!-- Recent Notices -->
            <div class="dash-card">
                <div class="dash-card-head">
                    <h3>📢 Notice Board Highlights</h3>
                    <button class="link-btn" onclick="switchSection('notices')">View All</button>
                </div>
                <ul class="recent-list" id="recent-notices">
                    <li><span class="item-meta">Loading notices…</span></li>
                </ul>
            </div>
        </div>

        <!-- Recent Inquiries Row -->
        <div class="dash-card" style="margin-top:24px">
            <div class="dash-card-head">
                <h3>💌 Recent Tour & Admission Requests</h3>
                <button class="link-btn" onclick="switchSection('inquiries')">Manage Inquiries</button>
            </div>
            <ul class="recent-list" id="recent-inquiries">
                <li><span class="item-meta">Loading inquiries…</span></li>
            </ul>
        </div>
    </section>

    <!-- ── GALLERY SECTION ── -->
    <section class="section hidden" id="section-gallery">
        <div class="section-header">
            <div>
                <h2 class="section-title">🖼️ Photo Gallery Management</h2>
                <p class="section-sub">Upload, categorize, and showcase cheerful moments on the school website.</p>
            </div>
            <button class="btn-primary" onclick="openModal('gallery-modal')">
                <i class="fa fa-plus"></i> Upload New Photo
            </button>
        </div>

        <!-- Category Filters -->
        <div class="filter-bar">
            <button class="filter-btn active" data-cat="all">🌟 All Categories</button>
            <button class="filter-btn" data-cat="Classroom">🎨 Classroom Activities</button>
            <button class="filter-btn" data-cat="Outdoor">🎪 Outdoor Playground</button>
            <button class="filter-btn" data-cat="Celebrations">🍉 Festivals & Celebrations</button>
            <button class="filter-btn" data-cat="Activities">⭐ General Activities</button>
            <button class="filter-btn" data-cat="Events">🎈 Annual Events</button>
            <button class="filter-btn" data-cat="Sports">🏅 Sports & Movement</button>
        </div>

        <div class="gallery-grid" id="gallery-grid">
            <div class="loading-state"><div class="spinner-lg"></div> Loading photo collection…</div>
        </div>
    </section>

    <!-- ── NOTICES SECTION ── -->
    <section class="section hidden" id="section-notices">
        <div class="section-header">
            <div>
                <h2 class="section-title">📢 Notice Board Announcements</h2>
                <p class="section-sub">Publish official notices, admission dates, holidays, and downloadable brochures.</p>
            </div>
            <button class="btn-primary" onclick="openModal('notice-modal')">
                <i class="fa fa-plus"></i> Publish New Notice
            </button>
        </div>

        <div class="table-wrap">
            <table class="admin-table" id="notices-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Publish Date</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Attachment</th>
                        <th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody id="notices-tbody">
                    <tr><td colspan="6" class="loading-cell"><div class="spinner-lg"></div></td></tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- ── ACTIVITIES SECTION ── -->
    <section class="section hidden" id="section-activities">
        <div class="section-header">
            <div>
                <h2 class="section-title">⭐ Curriculum & Activities</h2>
                <p class="section-sub">Manage unstructured play programs, timing schedules, and age groups.</p>
            </div>
            <button class="btn-primary" onclick="openModal('activity-modal')">
                <i class="fa fa-plus"></i> Add New Activity
            </button>
        </div>

        <div class="activities-grid" id="activities-grid">
            <div class="loading-state"><div class="spinner-lg"></div> Loading activities…</div>
        </div>
    </section>

    <!-- ── INQUIRIES & TOUR REQUESTS SECTION ── -->
    <section class="section hidden" id="section-inquiries">
        <div class="section-header">
            <div>
                <h2 class="section-title">💌 Tour Inquiries & Messages</h2>
                <p class="section-sub">Requests received directly from parents through the contact and tour booking forms.</p>
            </div>
        </div>

        <div class="table-wrap">
            <table class="admin-table" id="inquiries-table">
                <thead>
                    <tr>
                        <th>Parent Name</th>
                        <th>Contact Details</th>
                        <th>Message / Interest</th>
                        <th>Received Date</th>
                        <th>Status</th>
                        <th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody id="inquiries-tbody">
                    <tr><td colspan="6" class="loading-cell"><div class="spinner-lg"></div></td></tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- ── SETTINGS SECTION ── -->
    <section class="section hidden" id="section-settings">
        <div class="section-header">
            <div>
                <h2 class="section-title">🔒 Change Admin Password</h2>
                <p class="section-sub">Update your First Steps administration credentials safely.</p>
            </div>
        </div>

        <div class="settings-card">
            <div id="pw-alert"></div>
            <form id="pw-form" novalidate>
                <div class="form-group">
                    <label class="form-label">Current Password *</label>
                    <input type="password" name="current_password" class="form-input" placeholder="Enter current admin password" required>
                </div>
                <div class="form-group">
                    <label class="form-label">New Password *</label>
                    <input type="password" name="new_password" class="form-input" placeholder="At least 8 characters" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Confirm New Password *</label>
                    <input type="password" name="confirm_password" class="form-input" placeholder="Re-enter new password" required>
                </div>
                <div style="margin-top:24px">
                    <button type="submit" class="btn-primary">
                        <i class="fa fa-save"></i> Save New Password
                    </button>
                </div>
            </form>
        </div>
    </section>

</main>

<!-- ══════════════════════════════════════════════════════════
     MODALS
══════════════════════════════════════════════════════════ -->

<!-- GALLERY MODAL -->
<div class="modal-overlay hidden" id="gallery-modal">
    <div class="modal">
        <div class="modal-header">
            <h3 id="gallery-modal-title">Upload Gallery Photo</h3>
            <button class="modal-close" onclick="closeModal('gallery-modal')"><i class="fa fa-times"></i></button>
        </div>
        <form id="gallery-form" enctype="multipart/form-data" novalidate>
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="id" id="gallery-id">
            <div id="gallery-modal-alert"></div>

            <!-- Image drop zone with generous 25MB limit -->
            <div class="drop-zone" id="gallery-drop-zone">
                <div class="drop-zone-inner" id="gallery-drop-inner">
                    <div class="drop-icon">📷</div>
                    <p>Click or drag & drop a photo here</p>
                    <span>JPG, PNG, GIF, WEBP, AVIF, HEIC &bull; Up to 25 MB</span>
                </div>
                <img id="gallery-preview-img" class="drop-preview hidden" alt="Preview">
                <input type="file" id="gallery-image-input" name="image" accept="image/*" class="file-input">
            </div>
            <button type="button" class="btn-outline sm-btn" id="gallery-change-img-btn" style="display:none">
                <i class="fa fa-redo"></i> Select Different Photo
            </button>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Photo Title *</label>
                    <input type="text" name="title" class="form-input" placeholder="e.g. Magh Bihu Celebration 2026" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Category *</label>
                    <select name="category" class="form-input" required>
                        <option value="Classroom">Classroom Activities</option>
                        <option value="Outdoor">Outdoor Playground</option>
                        <option value="Celebrations">Festivals & Celebrations</option>
                        <option value="Activities">General Activities</option>
                        <option value="Events">Annual Events</option>
                        <option value="Sports">Sports & Movement</option>
                        <option value="Art & Craft">Art & Craft</option>
                        <option value="General">General Campus</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Description / Caption</label>
                <textarea name="description" class="form-input" rows="2" placeholder="Brief description of the joyful activity…"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-outline" onclick="closeModal('gallery-modal')">Cancel</button>
                <button type="submit" class="btn-primary" id="gallery-submit-btn">
                    <i class="fa fa-upload"></i> Upload Photo
                </button>
            </div>
        </form>
    </div>
</div>

<!-- NOTICE MODAL -->
<div class="modal-overlay hidden" id="notice-modal">
    <div class="modal">
        <div class="modal-header">
            <h3 id="notice-modal-title">Publish Notice Announcement</h3>
            <button class="modal-close" onclick="closeModal('notice-modal')"><i class="fa fa-times"></i></button>
        </div>
        <form id="notice-form" enctype="multipart/form-data" novalidate>
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="id" id="notice-id">
            <div id="notice-modal-alert"></div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Publish Date *</label>
                    <input type="date" name="publish_date" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Expiry Date (Optional)</label>
                    <input type="date" name="expiry_date" class="form-input">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Notice Title *</label>
                <input type="text" name="title" class="form-input" placeholder="e.g. Admissions Open for Academic Year 2026-2027" required>
            </div>
            <div class="form-group">
                <label class="form-label">Announcement Content *</label>
                <textarea name="content" class="form-input" rows="4" placeholder="Enter notice details for parents…" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select name="status" class="form-input">
                        <option value="Active">Active (Visible)</option>
                        <option value="Draft">Draft (Hidden)</option>
                    </select>
                </div>
                <div class="form-group" style="align-self:flex-end;padding-bottom:10px">
                    <label class="checkbox-label">
                        <input type="checkbox" name="is_highlighted" id="notice-highlighted" value="1">
                        📌 Pin & Feature on Notice Board
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Attachment (PDF / Image / Document &bull; Max 25MB)</label>
                <div class="file-pick-row">
                    <label class="file-pick-btn">
                        <i class="fa fa-paperclip"></i> Select File
                        <input type="file" name="attachment" id="notice-file-input" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" class="file-input">
                    </label>
                    <span class="file-pick-name" id="notice-file-name">No file selected</span>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-outline" onclick="closeModal('notice-modal')">Cancel</button>
                <button type="submit" class="btn-primary" id="notice-submit-btn">
                    <i class="fa fa-bullhorn"></i> Publish Notice
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ACTIVITY MODAL -->
<div class="modal-overlay hidden" id="activity-modal">
    <div class="modal">
        <div class="modal-header">
            <h3 id="activity-modal-title">Add Activity Program</h3>
            <button class="modal-close" onclick="closeModal('activity-modal')"><i class="fa fa-times"></i></button>
        </div>
        <form id="activity-form" enctype="multipart/form-data" novalidate>
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="id" id="activity-id">
            <div id="activity-modal-alert"></div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Activity Title *</label>
                    <input type="text" name="title" class="form-input" placeholder="e.g. Art & Craft Exploration" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Icon (Emoji)</label>
                    <input type="text" name="icon" class="form-input emoji-input" placeholder="🎨" maxlength="4" value="🎨">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea name="description" class="form-input" rows="3" placeholder="Brief description of the play-based program…" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Color Theme</label>
                    <select name="color_class" class="form-input">
                        <option value="blue">Ocean Blue</option>
                        <option value="pink">Joyful Pink</option>
                        <option value="green">Mint Green</option>
                        <option value="yellow">Sunshine Yellow</option>
                        <option value="purple">Playful Purple</option>
                        <option value="orange">Warm Orange</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Age Group</label>
                    <input type="text" name="age_group" class="form-input" placeholder="e.g. 2-5 years">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Schedule</label>
                    <input type="text" name="schedule" class="form-input" placeholder="e.g. Mon, Wed | 9AM-10AM">
                </div>
                <div class="form-group">
                    <label class="form-label">Sort Order</label>
                    <input type="number" name="sort_order" class="form-input" value="0" min="0">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Activity Photo (Optional)</label>
                <div class="file-pick-row">
                    <label class="file-pick-btn">
                        <i class="fa fa-image"></i> Choose Photo
                        <input type="file" name="image" id="activity-img-input" accept="image/*" class="file-input">
                    </label>
                    <span class="file-pick-name" id="activity-img-name">No photo selected</span>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-outline" onclick="closeModal('activity-modal')">Cancel</button>
                <button type="submit" class="btn-primary" id="activity-submit-btn">
                    <i class="fa fa-star"></i> Save Activity
                </button>
            </div>
        </form>
    </div>
</div>

<!-- INQUIRY VIEW MODAL -->
<div class="modal-overlay hidden" id="inquiry-modal">
    <div class="modal">
        <div class="modal-header">
            <h3 id="inquiry-modal-title">Parent Inquiry Details</h3>
            <button class="modal-close" onclick="closeModal('inquiry-modal')"><i class="fa fa-times"></i></button>
        </div>
        <div style="padding:24px 28px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
                <span class="badge badge-unread" id="inquiry-modal-status">Unread</span>
                <span style="font-size:0.85rem;color:var(--fs-text-muted);font-weight:700" id="inquiry-modal-date">—</span>
            </div>
            <div style="background:var(--fs-card-subtle);padding:16px 20px;border-radius:16px;margin-bottom:18px;border:1px solid var(--fs-border-light)">
                <div style="font-size:1.15rem;font-weight:800;color:var(--fs-blue-dark);margin-bottom:4px" id="inquiry-modal-name">—</div>
                <div style="font-size:0.9rem;color:var(--fs-text);margin-bottom:4px">
                    <i class="fa fa-envelope" style="color:var(--fs-blue);margin-right:6px"></i> <a id="inquiry-modal-email" href="#" style="color:var(--fs-blue);text-decoration:underline">—</a>
                </div>
                <div style="font-size:0.9rem;color:var(--fs-text)">
                    <i class="fa fa-phone" style="color:var(--fs-green);margin-right:6px"></i> <a id="inquiry-modal-phone" href="#" style="color:var(--fs-green);font-weight:700">—</a>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Message / Request</label>
                <div id="inquiry-modal-message" style="white-space:pre-wrap;background:var(--fs-bg);padding:16px;border-radius:12px;border:2px solid var(--fs-border);font-size:0.95rem;line-height:1.6"></div>
            </div>
            <div class="modal-footer" style="margin-top:20px">
                <button type="button" class="btn-outline" onclick="closeModal('inquiry-modal')">Close</button>
                <button type="button" class="btn-secondary" id="inquiry-reply-btn">
                    <i class="fa fa-reply"></i> Mark as Replied
                </button>
            </div>
        </div>
    </div>
</div>

<!-- DELETE CONFIRM MODAL -->
<div class="modal-overlay hidden" id="confirm-modal">
    <div class="modal modal-sm">
        <div class="modal-header">
            <h3>⚠️ Confirm Deletion</h3>
            <button class="modal-close" onclick="closeModal('confirm-modal')"><i class="fa fa-times"></i></button>
        </div>
        <div style="padding:22px 26px">
            <p id="confirm-message" style="font-size:0.95rem;font-weight:600;color:var(--fs-text)">
                Are you sure you want to permanently delete this item? This action cannot be undone.
            </p>
        </div>
        <div class="modal-footer" style="padding:16px 26px">
            <button class="btn-outline" onclick="closeModal('confirm-modal')">Cancel</button>
            <button class="btn-danger" id="confirm-delete-btn">
                <i class="fa fa-trash"></i> Delete Permanently
            </button>
        </div>
    </div>
</div>

<!-- TOAST CONTAINER -->
<div class="toast-container" id="toast-container"></div>

<script src="js/admin.js"></script>
</body>
</html>
