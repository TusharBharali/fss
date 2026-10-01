<?php
// contact-handler.php — Handles tour schedule requests and inquiries from public website
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method. POST required.');
}

$name     = trim($_POST['name']     ?? '');
$email    = trim($_POST['email']    ?? '');
$phone    = trim($_POST['phone']    ?? '');
$interest = trim($_POST['interest'] ?? 'General Inquiry');
$message  = trim($_POST['message']  ?? '');

if (!$name || !$email) {
    jsonResponse(false, 'Please provide both your name and email address.');
}

$fullMessage = $message;
if ($interest && strpos($message, $interest) === false) {
    $fullMessage = "[Interest: {$interest}]\n" . ($message ?: 'Schedule a tour inquiry.');
}

try {
    $db   = getDB();
    $stmt = $db->prepare(
        'INSERT INTO contact_submissions (name, email, phone, message, status)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$name, $email, $phone, $fullMessage, 'Unread']);

    jsonResponse(true, 'Thank you! Your tour request has been received. Our administration will contact you shortly.', [
        'id' => $db->lastInsertId()
    ]);
} catch (Exception $e) {
    jsonResponse(false, 'Could not save inquiry: ' . $e->getMessage());
}
?>
