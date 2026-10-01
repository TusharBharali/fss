<?php
// submit-feedback.php — Handles parent feedback & testimonial submission
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method. POST required.');
}

$parentName = trim($_POST['parent_name'] ?? $_POST['name'] ?? '');
$childInfo  = trim($_POST['child_info']  ?? $_POST['child_class'] ?? $_POST['subject'] ?? '');
$rating     = (int)($_POST['rating']     ?? 5);
$feedback   = trim($_POST['feedback']    ?? $_POST['message'] ?? '');

if (!$parentName || !$feedback) {
    jsonResponse(false, 'Parent name and testimonial message are required.');
}

if ($rating < 1 || $rating > 5) {
    $rating = 5;
}

try {
    $db   = getDB();
    $stmt = $db->prepare(
        'INSERT INTO feedbacks (parent_name, child_info, rating, feedback, status)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$parentName, $childInfo, $rating, $feedback, 'Approved']);

    jsonResponse(true, 'Heartfelt thanks! Your review has been saved successfully.', [
        'id' => $db->lastInsertId()
    ]);
} catch (Exception $e) {
    jsonResponse(false, 'Error recording review: ' . $e->getMessage());
}
?>
