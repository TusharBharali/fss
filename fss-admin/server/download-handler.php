<?php
// download-handler.php — Securely serve notice attachments
require_once __DIR__ . '/config.php';

$file = $_GET['file'] ?? '';
$file = basename($file); // sanitize directory traversal

if (!$file) {
    http_response_code(400);
    die('Missing file parameter.');
}

$filePath = NOTICES_DIR . $file;

if (!file_exists($filePath) || !is_file($filePath)) {
    http_response_code(404);
    die('The requested attachment does not exist on the server.');
}

$mime = 'application/octet-stream';
if (class_exists('finfo')) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($filePath);
}

header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($filePath));
header('Content-Disposition: inline; filename="' . addslashes($file) . '"');
header('Cache-Control: private, max-age=86400');
readfile($filePath);
exit;
?>
