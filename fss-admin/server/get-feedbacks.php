<?php
// get-feedbacks.php — Public endpoint for approved parent testimonials
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM feedbacks WHERE status = 'Approved' ORDER BY created_at DESC LIMIT 10");
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['author_name'] = $row['parent_name'];
        $row['content']     = $row['feedback'];
        $row['created_at_formatted'] = !empty($row['created_at']) 
            ? date('M d, Y', strtotime($row['created_at'])) 
            : 'Recent';
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
        'message' => 'Failed to load feedbacks: ' . $e->getMessage(),
        'items'   => [],
        'data'    => []
    ]);
}
?>
