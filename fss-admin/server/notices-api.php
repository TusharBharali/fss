<?php
// notices-api.php — CRUD for notices
require_once __DIR__ . '/config.php';
requireLogin();
header('Content-Type: application/json; charset=utf-8');

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$db     = getDB();

switch ($action) {

    // ── GET ALL ────────────────────────────────────────────
    case 'get_all':
        $stmt = $db->query('SELECT * FROM notices ORDER BY is_highlighted DESC, publish_date DESC, created_at DESC');
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $name = $row['attachment_name'] ?: basename($row['attachment_path'] ?? '');
            $row['attachment_url'] = $name ? NOTICES_URL . '/' . rawurlencode($name) : '';
            $row['attachment_url_public'] = $name ? 'fss-admin/uploads/notices/' . rawurlencode($name) : '';
            if (!empty($row['publish_date'])) {
                $row['publish_date_formatted'] = date('M d, Y', strtotime($row['publish_date']));
            } else {
                $row['publish_date_formatted'] = 'Recent Notice';
            }
        }
        jsonResponse(true, 'OK', ['items' => $rows]);

    // ── ADD ────────────────────────────────────────────────
    case 'add':
        $title         = trim($_POST['title']        ?? '');
        $content       = trim($_POST['content']      ?? '');
        $publishDate   = !empty($_POST['publish_date']) ? $_POST['publish_date'] : date('Y-m-d');
        $expiryDate    = !empty($_POST['expiry_date'])  ? $_POST['expiry_date']  : null;
        $isHighlighted = isset($_POST['is_highlighted']) && $_POST['is_highlighted'] ? 1 : 0;
        $status        = in_array($_POST['status'] ?? '', ['Active','Draft','Expired']) ? $_POST['status'] : 'Active';

        if (!$title || !$content) {
            jsonResponse(false, 'Notice title and content are required.');
        }

        $attachPath = null;
        $attachName = null;
        $attachType = 'NONE';

        if (!empty($_FILES['attachment']['name'])) {
            try {
                $upload     = handleUpload($_FILES['attachment'], NOTICES_DIR, ALLOWED_DOCS);
                $attachPath = $upload['path'];
                $attachName = $upload['filename'];
                $ext        = strtoupper(pathinfo($upload['filename'], PATHINFO_EXTENSION));
                if ($ext === 'JPEG') $ext = 'JPG';
                $attachType = $ext ?: 'FILE';
            } catch (RuntimeException $e) {
                jsonResponse(false, $e->getMessage());
            }
        }

        $stmt = $db->prepare(
            'INSERT INTO notices (title, content, publish_date, expiry_date, is_highlighted, status, attachment_path, attachment_name, attachment_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $title, $content, $publishDate, $expiryDate, $isHighlighted, $status,
            $attachPath, $attachName, $attachType
        ]);
        jsonResponse(true, 'Notice published successfully!', ['id' => $db->lastInsertId()]);

    // ── UPDATE ─────────────────────────────────────────────
    case 'update':
        $id            = (int)($_POST['id']           ?? 0);
        $title         = trim($_POST['title']         ?? '');
        $content       = trim($_POST['content']       ?? '');
        $publishDate   = !empty($_POST['publish_date']) ? $_POST['publish_date'] : date('Y-m-d');
        $expiryDate    = !empty($_POST['expiry_date'])  ? $_POST['expiry_date']  : null;
        $isHighlighted = isset($_POST['is_highlighted']) && $_POST['is_highlighted'] ? 1 : 0;
        $status        = in_array($_POST['status'] ?? '', ['Active','Draft','Expired']) ? $_POST['status'] : 'Active';

        if (!$id || !$title || !$content) {
            jsonResponse(false, 'Notice ID, title, and content are required.');
        }

        // Optional new attachment
        if (!empty($_FILES['attachment']['name'])) {
            try {
                // Delete old attachment if exists
                $old = $db->prepare('SELECT attachment_path, attachment_name FROM notices WHERE id = ?');
                $old->execute([$id]);
                $oldRow = $old->fetch();
                if ($oldRow) {
                    $possiblePaths = [
                        $oldRow['attachment_path'],
                        NOTICES_DIR . $oldRow['attachment_name'],
                        ROOT_DIR . '/' . ltrim($oldRow['attachment_path'] ?? '', '/')
                    ];
                    foreach ($possiblePaths as $p) {
                        if ($p && file_exists($p) && is_file($p)) {
                            @unlink($p);
                        }
                    }
                }

                $upload     = handleUpload($_FILES['attachment'], NOTICES_DIR, ALLOWED_DOCS);
                $ext        = strtoupper(pathinfo($upload['filename'], PATHINFO_EXTENSION));
                if ($ext === 'JPEG') $ext = 'JPG';
                $attachType = $ext ?: 'FILE';

                $db->prepare(
                    'UPDATE notices SET title=?, content=?, publish_date=?, expiry_date=?, is_highlighted=?, status=?,
                     attachment_path=?, attachment_name=?, attachment_type=? WHERE id=?'
                )->execute([
                    $title, $content, $publishDate, $expiryDate, $isHighlighted, $status,
                    $upload['path'], $upload['filename'], $attachType, $id
                ]);
            } catch (RuntimeException $e) {
                jsonResponse(false, $e->getMessage());
            }
        } else {
            $db->prepare(
                'UPDATE notices SET title=?, content=?, publish_date=?, expiry_date=?, is_highlighted=?, status=? WHERE id=?'
            )->execute([$title, $content, $publishDate, $expiryDate, $isHighlighted, $status, $id]);
        }
        jsonResponse(true, 'Notice updated successfully.');

    // ── DELETE ─────────────────────────────────────────────
    case 'delete':
        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            jsonResponse(false, 'Notice ID is required.');
        }
        $stmt = $db->prepare('SELECT attachment_path, attachment_name FROM notices WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $possiblePaths = [
                $row['attachment_path'],
                NOTICES_DIR . $row['attachment_name'],
                ROOT_DIR . '/' . ltrim($row['attachment_path'] ?? '', '/')
            ];
            foreach ($possiblePaths as $p) {
                if ($p && file_exists($p) && is_file($p)) {
                    @unlink($p);
                }
            }
        }
        $db->prepare('DELETE FROM notices WHERE id = ?')->execute([$id]);
        jsonResponse(true, 'Notice deleted successfully.');

    default:
        jsonResponse(false, 'Unknown notice action requested.');
}
?>
