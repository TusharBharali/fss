<?php
// contact-api.php — Admin management of tour requests & contact inquiries
require_once __DIR__ . '/config.php';
requireLogin();
header('Content-Type: application/json; charset=utf-8');

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$db     = getDB();

switch ($action) {

    // ── GET ALL ────────────────────────────────────────────
    case 'get_all':
        $stmt = $db->query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $row['created_at_formatted'] = !empty($row['created_at']) 
                ? date('M d, Y h:i A', strtotime($row['created_at'])) 
                : 'Recent';
        }
        jsonResponse(true, 'OK', ['items' => $rows]);

    // ── UPDATE STATUS ──────────────────────────────────────
    case 'update_status':
        $id     = (int)($_POST['id'] ?? 0);
        $status = in_array($_POST['status'] ?? '', ['Unread', 'Read', 'Replied']) ? $_POST['status'] : 'Read';

        if (!$id) {
            jsonResponse(false, 'Inquiry ID is required.');
        }

        $stmt = $db->prepare('UPDATE contact_submissions SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
        jsonResponse(true, 'Inquiry status updated to ' . $status);

    // ── DELETE ─────────────────────────────────────────────
    case 'delete':
        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            jsonResponse(false, 'Inquiry ID is required.');
        }

        $stmt = $db->prepare('DELETE FROM contact_submissions WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(true, 'Inquiry removed successfully.');

    default:
        jsonResponse(false, 'Unknown contact action requested.');
}
?>
