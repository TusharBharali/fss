<?php
// auth.php — Login / Logout / Change-Password API
require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {

    // ── LOGIN ──────────────────────────────────────────────
    case 'login':
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        if (!$username || !$password) {
            jsonResponse(false, 'Please enter username and password.');
        }

        $db   = getDB();
        $stmt = $db->prepare('SELECT * FROM admin_users WHERE username = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(false, 'Invalid username or password.');
        }

        $passwordValid = password_verify($password, $user['password_hash']);
        // If password was stored plain-text in DB, allow login and auto-upgrade to bcrypt
        if (!$passwordValid && $user['password_hash'] === $password) {
            $passwordValid = true;
            $upgradedHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            $db->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')->execute([$upgradedHash, $user['id']]);
        }

        if (!$passwordValid) {
            jsonResponse(false, 'Invalid username or password.');
        }

        // Update last login
        $db->prepare('UPDATE admin_users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

        $_SESSION['fss_admin_id']   = $user['id'];
        $_SESSION['fss_admin_name'] = $user['full_name'] ?: $user['username'];
        $_SESSION['fss_admin_user'] = $user['username'];

        jsonResponse(true, 'Login successful.', ['name' => $_SESSION['fss_admin_name']]);

    // ── LOGOUT ─────────────────────────────────────────────
    case 'logout':
        session_destroy();
        jsonResponse(true, 'Logged out.');

    // ── CHANGE PASSWORD ────────────────────────────────────
    case 'change_password':
        requireLogin();
        $current = $_POST['current_password'] ?? '';
        $new     = $_POST['new_password'] ?? '';
        $confirm = $_POST['confirm_password'] ?? '';

        if (!$current || !$new || !$confirm) {
            jsonResponse(false, 'All fields are required.');
        }
        if (strlen($new) < 8) {
            jsonResponse(false, 'New password must be at least 8 characters.');
        }
        if ($new !== $confirm) {
            jsonResponse(false, 'New passwords do not match.');
        }

        $db   = getDB();
        $stmt = $db->prepare('SELECT password_hash FROM admin_users WHERE id = ?');
        $stmt->execute([$_SESSION['fss_admin_id']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($current, $user['password_hash'])) {
            jsonResponse(false, 'Current password is incorrect.');
        }

        $newHash = password_hash($new, PASSWORD_BCRYPT, ['cost' => 12]);
        $db->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
           ->execute([$newHash, $_SESSION['fss_admin_id']]);

        jsonResponse(true, 'Password updated successfully.');

    // ── CHECK SESSION ──────────────────────────────────────
    case 'check':
        if (isLoggedIn()) {
            jsonResponse(true, 'Authenticated.', [
                'name' => $_SESSION['fss_admin_name'],
                'user' => $_SESSION['fss_admin_user'],
            ]);
        }
        jsonResponse(false, 'Not authenticated.');

    default:
        jsonResponse(false, 'Unknown action.');
}
?>
