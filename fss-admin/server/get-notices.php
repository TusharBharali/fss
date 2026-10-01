<?php
// get-notices.php — Public endpoint for First Steps website noticeboard announcements
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $db = getDB();
    $today = date('Y-m-d');
    
    // Fetch active notices that have not expired
    $stmt = $db->prepare(
        "SELECT * FROM notices 
         WHERE status = 'Active' 
           AND (expiry_date IS NULL OR expiry_date >= ?)
         ORDER BY is_highlighted DESC, publish_date DESC, created_at DESC"
    );
    $stmt->execute([$today]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $name = $row['attachment_name'] ?: basename($row['attachment_path'] ?? '');
        $row['attachment_url_public'] = $name ? 'fss-admin/uploads/notices/' . rawurlencode($name) : null;
        $row['attachment_url_admin']  = $name ? NOTICES_URL . '/' . rawurlencode($name) : null;
        $row['attachment_download']   = $name ? 'fss-admin/server/download-handler.php?file=' . rawurlencode($name) : null;
        $row['publish_date_formatted'] = !empty($row['publish_date']) 
            ? date('M d, Y', strtotime($row['publish_date'])) 
            : date('M d, Y');
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
        'message' => 'Failed to retrieve notices: ' . $e->getMessage(),
        'items'   => [],
        'data'    => []
    ]);
}
?>
