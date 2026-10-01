<?php
// get-gallery.php — Public endpoint for First Steps website photo gallery
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $db = getDB();
    $stmt = $db->query('SELECT * FROM gallery WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $name = $row['image_name'] ?: basename($row['image_path']);
        // Relative path suitable for public frontend
        $row['image_url_public'] = 'fss-admin/uploads/gallery/' . rawurlencode($name);
        $row['image_url_admin']  = GALLERY_URL . '/' . rawurlencode($name);
        $row['image_url']        = 'fss-admin/uploads/gallery/' . rawurlencode($name);
        $row['category_raw']     = $row['category'];
        $row['category']         = strtolower(trim($row['category']));
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
        'message' => 'Failed to load gallery photos: ' . $e->getMessage(),
        'items'   => [],
        'data'    => []
    ]);
}
?>
