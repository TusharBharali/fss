<?php
// get-activities.php — Public endpoint for First Steps website curriculum & activities
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $db = getDB();
    $stmt = $db->query('SELECT * FROM activities WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC');
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $name = $row['image_name'] ?: basename($row['image_path'] ?? '');
        $row['image_url_public'] = $name ? 'fss-admin/uploads/activities/' . rawurlencode($name) : null;
        $row['image_url_admin']  = $name ? ACTIVITY_URL . '/' . rawurlencode($name) : null;
    }

    echo json_encode([
        'success' => true,
        'count'   => count($rows),
        'items'   => $rows,
        'data'    => $rows
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to retrieve activities: ' . $e->getMessage(),
        'items'   => [],
        'data'    => []
    ]);
}
?>
