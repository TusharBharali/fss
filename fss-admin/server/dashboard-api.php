<?php
// dashboard-api.php — Stats and summaries for the First Steps Admin Dashboard
require_once __DIR__ . '/config.php';
requireLogin();
header('Content-Type: application/json; charset=utf-8');

$db = getDB();

try {
    $stats = [];

    // Gallery counts
    $stmt = $db->query('SELECT COUNT(*) FROM gallery WHERE is_active = 1');
    $stats['gallery_active'] = (int)$stmt->fetchColumn();

    $stmt = $db->query('SELECT COUNT(*) FROM gallery');
    $stats['gallery_total'] = (int)$stmt->fetchColumn();

    // Notices counts
    $stmt = $db->query("SELECT COUNT(*) FROM notices WHERE status = 'Active'");
    $stats['notices_active'] = (int)$stmt->fetchColumn();

    $stmt = $db->query('SELECT COUNT(*) FROM notices');
    $stats['notices_total'] = (int)$stmt->fetchColumn();

    // Activities counts
    $stmt = $db->query('SELECT COUNT(*) FROM activities WHERE is_active = 1');
    $stats['activities_active'] = (int)$stmt->fetchColumn();

    $stmt = $db->query('SELECT COUNT(*) FROM activities');
    $stats['activities_total'] = (int)$stmt->fetchColumn();

    // Contact inquiries counts
    $stmt = $db->query("SELECT COUNT(*) FROM contact_submissions WHERE status = 'Unread'");
    $stats['inquiries_unread'] = (int)$stmt->fetchColumn();

    $stmt = $db->query('SELECT COUNT(*) FROM contact_submissions');
    $stats['inquiries_total'] = (int)$stmt->fetchColumn();

    // Recent Gallery Items (last 5)
    $stmt = $db->query('SELECT id, title, category, created_at FROM gallery ORDER BY created_at DESC LIMIT 5');
    $stats['recent_gallery'] = $stmt->fetchAll();

    // Recent Notices (last 5)
    $stmt = $db->query('SELECT id, title, publish_date, status, is_highlighted FROM notices ORDER BY publish_date DESC, created_at DESC LIMIT 5');
    $stats['recent_notices'] = $stmt->fetchAll();

    // Recent Inquiries (last 5)
    $stmt = $db->query('SELECT id, name, email, phone, message, status, created_at FROM contact_submissions ORDER BY created_at DESC LIMIT 5');
    $stats['recent_inquiries'] = $stmt->fetchAll();

    jsonResponse(true, 'OK', ['stats' => $stats]);
} catch (PDOException $e) {
    jsonResponse(false, 'Database query error: ' . $e->getMessage());
}
?>
