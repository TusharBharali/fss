<?php
// gallery-api.php — CRUD for gallery items
require_once __DIR__ . '/config.php';
requireLogin();
header('Content-Type: application/json; charset=utf-8');

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$db     = getDB();

switch ($action) {

    // ── GET ALL ────────────────────────────────────────────
    case 'get_all':
        $stmt = $db->query('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC');
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $name = $row['image_name'] ?: basename($row['image_path']);
            $row['image_url'] = $name ? GALLERY_URL . '/' . rawurlencode($name) : '';
            $row['image_url_public'] = $name ? 'fss-admin/uploads/gallery/' . rawurlencode($name) : '';
        }
        jsonResponse(true, 'OK', ['items' => $rows]);

    // ── ADD ────────────────────────────────────────────────
    case 'add':
        $title    = trim($_POST['title']       ?? '');
        $desc     = trim($_POST['description'] ?? '');
        $category = trim($_POST['category']    ?? 'General');

        if (!$title) {
            jsonResponse(false, 'Photo title is required.');
        }
        if (empty($_FILES['image']['name'])) {
            jsonResponse(false, 'Please select an image file to upload.');
        }

        try {
            $upload = handleUpload($_FILES['image'], GALLERY_DIR, ALLOWED_IMAGES);
            $stmt   = $db->prepare(
                'INSERT INTO gallery (title, description, category, image_path, image_name, file_size, mime_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $title,
                $desc,
                $category,
                $upload['path'],
                $upload['filename'],
                $upload['size'],
                $upload['mime']
            ]);
            jsonResponse(true, 'Photo successfully added to gallery!', ['id' => $db->lastInsertId()]);
        } catch (RuntimeException $e) {
            jsonResponse(false, $e->getMessage());
        }

    // ── UPDATE ─────────────────────────────────────────────
    case 'update':
        $id       = (int)($_POST['id']          ?? 0);
        $title    = trim($_POST['title']       ?? '');
        $desc     = trim($_POST['description'] ?? '');
        $category = trim($_POST['category']    ?? 'General');
        $active   = isset($_POST['is_active']) ? (int)$_POST['is_active'] : 1;

        if (!$id || !$title) {
            jsonResponse(false, 'Item ID and title are required.');
        }

        // Optional new image replacement
        if (!empty($_FILES['image']['name'])) {
            try {
                // Delete old image file if exists
                $old = $db->prepare('SELECT image_path, image_name FROM gallery WHERE id = ?');
                $old->execute([$id]);
                $oldRow = $old->fetch();
                if ($oldRow) {
                    $possiblePaths = [
                        $oldRow['image_path'],
                        GALLERY_DIR . $oldRow['image_name'],
                        ROOT_DIR . '/' . ltrim($oldRow['image_path'], '/')
                    ];
                    foreach ($possiblePaths as $p) {
                        if ($p && file_exists($p) && is_file($p)) {
                            @unlink($p);
                        }
                    }
                }

                $upload = handleUpload($_FILES['image'], GALLERY_DIR, ALLOWED_IMAGES);
                $db->prepare(
                    'UPDATE gallery SET title=?, description=?, category=?, image_path=?, image_name=?, file_size=?, mime_type=?, is_active=? WHERE id=?'
                )->execute([
                    $title, $desc, $category,
                    $upload['path'], $upload['filename'],
                    $upload['size'], $upload['mime'], $active, $id
                ]);
            } catch (RuntimeException $e) {
                jsonResponse(false, $e->getMessage());
            }
        } else {
            $db->prepare('UPDATE gallery SET title=?, description=?, category=?, is_active=? WHERE id=?')
               ->execute([$title, $desc, $category, $active, $id]);
        }
        jsonResponse(true, 'Gallery item updated successfully.');

    // ── DELETE ─────────────────────────────────────────────
    case 'delete':
        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            jsonResponse(false, 'Valid photo ID is required.');
        }
        $stmt = $db->prepare('SELECT image_path, image_name FROM gallery WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $possiblePaths = [
                $row['image_path'],
                GALLERY_DIR . $row['image_name'],
                ROOT_DIR . '/' . ltrim($row['image_path'], '/')
            ];
            foreach ($possiblePaths as $p) {
                if ($p && file_exists($p) && is_file($p)) {
                    @unlink($p);
                }
            }
        }
        $db->prepare('DELETE FROM gallery WHERE id = ?')->execute([$id]);
        jsonResponse(true, 'Photo deleted from gallery.');

    // ── TOGGLE ACTIVE ──────────────────────────────────────
    case 'toggle':
        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            jsonResponse(false, 'Photo ID is required.');
        }
        $db->prepare('UPDATE gallery SET is_active = NOT is_active WHERE id = ?')->execute([$id]);
        jsonResponse(true, 'Visibility status toggled successfully.');

    default:
        jsonResponse(false, 'Unknown gallery action requested.');
}
?>
