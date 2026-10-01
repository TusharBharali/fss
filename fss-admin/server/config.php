<?php
// ============================================================
// First Steps Pre-School — Resilient Admin Panel Config
// ============================================================

// --- Database Configuration ---
define('DB_HOST',    getenv('DB_HOST')    ?: 'localhost');
define('DB_PORT',    getenv('DB_PORT')    ?: '3306');
define('DB_NAME',    getenv('DB_NAME')    ?: 'fss_admin');
define('DB_USER',    getenv('DB_USER')    ?: 'root');
define('DB_PASS',    getenv('DB_PASS')    ?: '');
define('DB_CHARSET', 'utf8mb4');

// --- Paths ---
define('ROOT_DIR',     dirname(__DIR__));          // /fss-admin
define('UPLOAD_DIR',   ROOT_DIR . '/uploads/');    // absolute upload root
define('GALLERY_DIR',  UPLOAD_DIR . 'gallery/');
define('NOTICES_DIR',  UPLOAD_DIR . 'notices/');
define('ACTIVITY_DIR', UPLOAD_DIR . 'activities/');

// --- URL Auto-detection (with proper space/URI handling) ---
if (!defined('ADMIN_URL')) {
    $proto   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host    = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $docRoot = isset($_SERVER['DOCUMENT_ROOT']) ? realpath($_SERVER['DOCUMENT_ROOT']) : '';
    $rootDir = realpath(ROOT_DIR);

    if ($docRoot && $rootDir && strpos($rootDir, $docRoot) === 0) {
        $rawPath = substr($rootDir, strlen($docRoot));
        $parts   = array_map('rawurlencode', explode('/', trim($rawPath, '/\\')));
        $webPath = '/' . implode('/', $parts);
    } else {
        $script  = $_SERVER['SCRIPT_NAME'] ?? '';
        $webPath = preg_replace('#/(server/)?[^/]*$#', '', $script);
    }
    define('ADMIN_URL', rtrim($proto . '://' . $host . '/' . ltrim($webPath, '/'), '/'));
}

define('UPLOAD_URL',      ADMIN_URL . '/uploads');
define('GALLERY_URL',     UPLOAD_URL . '/gallery');
define('NOTICES_URL',     UPLOAD_URL . '/notices');
define('ACTIVITY_URL',    UPLOAD_URL . '/activities');

// --- Generous Upload Limits & Allowed MIME Types ---
// Parses human readable PHP ini values like "40M" or "2G" to bytes
function parseSizeToBytes(string $size): int {
    $size = trim($size);
    $last = strtolower($size[strlen($size) - 1] ?? '');
    $val  = (int)$size;
    switch ($last) {
        case 'g': $val *= 1024;
        case 'm': $val *= 1024;
        case 'k': $val *= 1024;
    }
    return $val > 0 ? $val : 25 * 1024 * 1024;
}

$iniUploadMax = parseSizeToBytes(ini_get('upload_max_filesize') ?: '32M');
$iniPostMax   = parseSizeToBytes(ini_get('post_max_size') ?: '35M');
$maxAllowed   = min($iniUploadMax, $iniPostMax, 25 * 1024 * 1024); // up to 25 MB

define('MAX_FILE_SIZE', $maxAllowed);

// Expanded modern image MIME types (includes AVIF, HEIC/HEIF from phone cameras, SVG, WebP)
define('ALLOWED_IMAGES', [
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/x-png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/avif',
    'image/heic',
    'image/heif',
    'image/heic-sequence',
]);

// Expanded document MIME types (includes PDF, Images, Word Docs, Excel, Text)
define('ALLOWED_DOCS', [
    'application/pdf',
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/rtf',
]);

// --- Session Initialization ---
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 3600 * 12,  // 12 hours
        'path'     => '/',
        'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

// --- Create upload directories if missing & ensure 777 write permissions ---
foreach ([UPLOAD_DIR, GALLERY_DIR, NOTICES_DIR, ACTIVITY_DIR] as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    @chmod($dir, 0777);
}

// --- DB Connection with Multi-Fallback Resiliency ---
function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsnCandidates = [
        // 1. Primary TCP / Host
        'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET,
        // 2. Loopback TCP (bypasses missing local socket)
        'mysql:host=127.0.0.1;port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET,
        // 3. XAMPP macOS Socket
        'mysql:unix_socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock;dbname=' . DB_NAME . ';charset=' . DB_CHARSET,
        // 4. Standard UNIX Socket
        'mysql:unix_socket=/tmp/mysql.sock;dbname=' . DB_NAME . ';charset=' . DB_CHARSET,
    ];

    $lastError = null;

    foreach ($dsnCandidates as $dsn) {
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
            $pdo->exec("SET NAMES " . DB_CHARSET);
            return $pdo;
        } catch (PDOException $e) {
            $lastError = $e;

            // If the database does not exist, try to create it automatically
            if ($e->getCode() == 1049 || strpos($e->getMessage(), 'Unknown database') !== false) {
                try {
                    $serverDsn = preg_replace('/dbname=[^;]+;?/', '', $dsn);
                    $tempPdo   = new PDO($serverDsn, DB_USER, DB_PASS);
                    $tempPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET " . DB_CHARSET . " COLLATE utf8mb4_unicode_ci");
                    unset($tempPdo);

                    // Re-attempt connecting to newly created database
                    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES   => false,
                    ]);
                    $pdo->exec("SET NAMES " . DB_CHARSET);
                    return $pdo;
                } catch (Exception $ex) {
                    // Continue to next candidate
                }
            }
        }
    }

    // If all connection attempts failed
    http_response_code(500);
    $msg = 'Database connection failed. Please ensure MySQL is running in XAMPP. (' . ($lastError ? $lastError->getMessage() : 'Unknown error') . ')';

    if (php_sapi_name() === 'cli' || (!empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
        die(json_encode(['success' => false, 'message' => $msg]));
    } else {
        die('<div style="font-family:sans-serif;padding:30px;background:#FFF4F2;border:2px solid #EF476F;border-radius:12px;max-width:600px;margin:50px auto;color:#2B2D42;">'
            . '<h2 style="color:#EF476F;margin-top:0;">⚠️ First Steps Database Connection Notice</h2>'
            . '<p>' . htmlspecialchars($msg) . '</p>'
            . '<p style="font-size:0.9em;color:#5C627A;">Tip: Open your <strong>XAMPP Control Panel</strong> and verify that <strong>MySQL Database</strong> is started and active.</p>'
            . '</div>');
    }
}

// --- Auth Helpers ---
function isLoggedIn(): bool {
    return !empty($_SESSION['fss_admin_id']);
}

function requireLogin(): void {
    if (!isLoggedIn()) {
        jsonResponse(false, 'Unauthorized. Please sign in to continue.', ['unauthorized' => true]);
    }
}

function jsonResponse(bool $success, string $message, array $data = []): never {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $data), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// --- High-End File Upload Helper ---
function handleUpload(array $file, string $destDir, array $allowedMimes = []): array {
    if (!isset($file['error'])) {
        throw new RuntimeException('No upload data detected from browser.');
    }

    // Friendly error handling for all PHP upload error codes
    switch ($file['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_INI_SIZE:
            throw new RuntimeException('The file is larger than the server allows (' . ini_get('upload_max_filesize') . ').');
        case UPLOAD_ERR_FORM_SIZE:
            throw new RuntimeException('The file exceeds the form upload limit.');
        case UPLOAD_ERR_PARTIAL:
            throw new RuntimeException('The file was only partially uploaded. Please try again.');
        case UPLOAD_ERR_NO_FILE:
            throw new RuntimeException('No file was chosen for upload.');
        case UPLOAD_ERR_NO_TMP_DIR:
            throw new RuntimeException('Server configuration error: missing temporary upload folder.');
        case UPLOAD_ERR_CANT_WRITE:
            throw new RuntimeException('Server failed to write file to disk. Please check storage permissions.');
        case UPLOAD_ERR_EXTENSION:
            throw new RuntimeException('A server security extension blocked the file upload.');
        default:
            throw new RuntimeException('Upload failed with unknown error code: ' . $file['error']);
    }

    if ($file['size'] > MAX_FILE_SIZE) {
        $mb = round(MAX_FILE_SIZE / (1024 * 1024));
        throw new RuntimeException("File exceeds the allowable {$mb} MB size limit.");
    }

    $mimeCheck = empty($allowedMimes) ? ALLOWED_IMAGES : $allowedMimes;

    // Detect MIME type safely
    $mime = null;
    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($file['tmp_name']);
    }
    if (!$mime && function_exists('mime_content_type')) {
        $mime = @mime_content_type($file['tmp_name']);
    }
    if (!$mime) {
        $mime = $file['type'] ?? 'application/octet-stream';
    }

    // Normalize JPEG/JPG variants
    if ($mime === 'image/pjpeg') $mime = 'image/jpeg';
    if ($mime === 'image/x-png') $mime = 'image/png';

    if (!in_array($mime, $mimeCheck, true)) {
        // Fallback check extension for documents (like docx/xlsx which may report zip mime)
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'svg', 'heic', 'heif'];
        if (!in_array($ext, $allowedExtensions, true)) {
            throw new RuntimeException('File format not permitted (' . htmlspecialchars($mime) . '). Supported: JPG, PNG, WEBP, GIF, PDF, DOCX, etc.');
        }
    }

    $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($ext === 'jpeg') $ext = 'jpg';
    $filename = uniqid('fss_', true) . '.' . $ext;

    // Ensure target directory exists and is writable
    if (!is_dir($destDir)) {
        @mkdir($destDir, 0777, true);
    }
    @chmod($destDir, 0777);

    $destPath = rtrim($destDir, '/') . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        throw new RuntimeException('Could not save file to upload destination directory. Please check folder write permissions.');
    }
    @chmod($destPath, 0666);

    return [
        'path'     => $destPath,
        'filename' => $filename,
        'size'     => $file['size'],
        'mime'     => $mime,
    ];
}
?>
