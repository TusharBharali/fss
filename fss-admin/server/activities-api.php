<?php
// activities-api.php — CRUD for activities
require_once __DIR__ . '/config.php';
requireLogin();
header('Content-Type: application/json; charset=utf-8');

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$db     = getDB();

switch ($action) {

    // ── GET ALL ────────────────────────────────────────────
    case 'get_all':
        $stmt = $db->query('SELECT * FROM activities ORDER BY sort_order ASC, created_at ASC');
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $name = $row['image_name'] ?: basename($row['image_path'] ?? '');
            $row['image_url'] = $name ? ACTIVITY_URL . '/' . rawurlencode($name) : '';
            $row['image_url_public'] = $name ? 'fss-admin/uploads/activities/' . rawurlencode($name) : '';
        }
        jsonResponse(true, 'OK', ['items' => $rows]);

    // ── ADD ────────────────────────────────────────────────
    case 'add':
        $title      = trim($_POST['title']       ?? '');
        $desc       = trim($_POST['description'] ?? '');
        $icon       = trim($_POST['icon']        ?? '🎨');
        $colorClass = trim($_POST['color_class'] ?? 'purple');
        $ageGroup   = trim($_POST['age_group']   ?? '');
        $schedule   = trim($_POST['schedule']    ?? '');
        $sortOrder  = (int)($_POST['sort_order'] ?? 0);

        if (!$title || !$desc) {
            jsonResponse(false, 'Activity title and description are required.');
        }

        $imgPath = null;
        $imgName = null;

        if (!empty($_FILES['image']['name'])) {
            try {
                $upload  = handleUpload($_FILES['image'], ACTIVITY_DIR, ALLOWED_IMAGES);
                $imgPath = $upload['path'];
                $imgName = $upload['filename'];
            } catch (RuntimeException $e) {
                jsonResponse(false, $e->getMessage());
            }
        }

        $stmt = $db->prepare(
            'INSERT INTO activities (title, description, icon, color_class, image_path, image_name, age_group, schedule, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$title, $desc, $icon, $colorClass, $imgPath, $imgName, $ageGroup, $schedule, $sortOrder]);
        jsonResponse(true, 'Activity added successfully!', ['id' => $db->lastInsertId()]);

    // ── UPDATE ─────────────────────────────────────────────
    case 'update':
        $id         = (int)($_POST['id']         ?? 0);
        $title      = trim($_POST['title']       ?? '');
        $desc       = trim($_POST['description'] ?? '');
        $icon       = trim($_POST['icon']        ?? '🎨');
        $colorClass = trim($_POST['color_class'] ?? 'purple');
        $ageGroup   = trim($_POST['age_group']   ?? '');
        $schedule   = trim($_POST['schedule']    ?? '');
        $active     = isset($_POST['is_active'])  ? (int)$_POST['is_active'] : 1;
        $sortOrder  = (int)($_POST['sort_order'] ?? 0);

        if (!$id || !$title) {
            jsonResponse(false, 'Activity ID and title are required.');
        }

        if (!empty($_FILES['image']['name'])) {
            try {
                // Delete old image if exists
                $old = $db->prepare('SELECT image_path, image_name FROM activities WHERE id = ?');
                $old->execute([$id]);
                $oldRow = $old->fetch();
                if ($oldRow) {
                    $possiblePaths = [
                        $oldRow['image_path'],
                        ACTIVITY_DIR . $oldRow['image_name'],
                        ROOT_DIR . '/' . ltrim($oldRow['image_path'] ?? '', '/')
                    ];
                    foreach ($possiblePaths as $p) {
                        if ($p && file_exists($p) && is_file($p)) {
                            @unlink($p);
                        }
                    }
                }

                $upload  = handleUpload($_FILES['image'], ACTIVITY_DIR, ALLOWED_IMAGES);
                $db->prepare(
                    'UPDATE activities SET title=?, description=?, icon=?, color_class=?, image_path=?, image_name=?, age_group=?, schedule=?, is_active=?, sort_order=? WHERE id=?'
                )->execute([
                    $title, $desc, $icon, $colorClass,
                    $upload['path'], $upload['filename'],
                    $ageGroup, $schedule, $active, $sortOrder, $id
                ]);
            } catch (RuntimeException $e) {
                jsonResponse(false, $e->getMessage());
            }
        } else {
            $db->prepare(
                'UPDATE activities SET title=?, description=?, icon=?, color_class=?, age_group=?, schedule=?, is_active=?, sort_order=? WHERE id=?'
            )->execute([$title, $desc, $icon, $colorClass, $ageGroup, $schedule, $active, $sortOrder, $id]);
        }
        jsonResponse(true, 'Activity updated successfully.');

    // ── DELETE ─────────────────────────────────────────────
    case 'delete':
        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            jsonResponse(false, 'Activity ID is required.');
        }
        $stmt = $db->prepare('SELECT image_path, image_name FROM activities WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $possiblePaths = [
                $row['image_path'],
                ACTIVITY_DIR . $row['image_name'],
                ROOT_DIR . '/' . ltrim($row['image_path'] ?? '', '/')
            ];
            foreach ($possiblePaths as $p) {
                if ($p && file_exists($p) && is_file($p)) {
                    @unlink($p);
                }
            }
        }
        $db->prepare('DELETE FROM activities WHERE id = ?')->execute([$id]);
        jsonResponse(true, 'Activity deleted successfully.');

    // ── TOGGLE ACTIVE ──────────────────────────────────────
    case 'toggle':
        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            jsonResponse(false, 'Activity ID is required.');
        }
        $db->prepare('UPDATE activities SET is_active = NOT is_active WHERE id = ?')->execute([$id]);
        jsonResponse(true, 'Activity status toggled successfully.');

    default:
        jsonResponse(false, 'Unknown activity action requested.');
}
?>
