<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Sign In — First Steps Pre School | Tezpur</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :root {
            --fs-yellow: #FFD166;
            --fs-yellow-light: #FFF2D1;
            --fs-blue: #118AB2;
            --fs-blue-light: #E0F4FB;
            --fs-blue-dark: #0A5A75;
            --fs-pink: #EF476F;
            --fs-pink-light: #FFE3EA;
            --fs-green: #06D6A0;
            --fs-green-light: #E1FAF3;
            --fs-purple: #8338EC;
            --fs-purple-light: #F1E6FF;
            --fs-orange: #FF9F1C;
            --fs-orange-light: #FFF0DE;
            --fs-bg: #FDF9F1;
            --fs-card-bg: #FFFFFF;
            --fs-text: #2B2D42;
            --fs-text-muted: #5C627A;
            --fs-shadow-sm: 0 4px 15px rgba(17, 138, 178, 0.08);
            --fs-shadow-md: 0 10px 30px rgba(17, 138, 178, 0.12);
            --fs-shadow-lg: 0 20px 50px rgba(17, 138, 178, 0.18);
            --fs-shadow-colored: 0 12px 30px rgba(239, 71, 111, 0.28);
        }

        body {
            min-height: 100vh;
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--fs-bg);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(255, 209, 102, 0.35) 0%, transparent 35%),
                radial-gradient(circle at 90% 80%, rgba(239, 71, 111, 0.18) 0%, transparent 40%),
                radial-gradient(circle at 50% 90%, rgba(17, 138, 178, 0.15) 0%, transparent 35%),
                radial-gradient(circle at 80% 20%, rgba(6, 214, 160, 0.2) 0%, transparent 30%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            color: var(--fs-text);
            position: relative;
            overflow-x: hidden;
        }

        /* Cheerful rotating sun decoration */
        .sun-anim {
            position: fixed;
            top: 5%;
            right: 8%;
            font-size: 4.5rem;
            opacity: 0.75;
            user-select: none;
            animation: rotateSun 28s linear infinite;
            filter: drop-shadow(0 0 20px rgba(255, 209, 102, 0.6));
            z-index: 1;
        }
        @keyframes rotateSun {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }

        /* Floating preschool doodles */
        .floating-doodles span {
            position: fixed;
            font-size: 2.2rem;
            opacity: 0.22;
            animation: floatDoodle 9s ease-in-out infinite alternate;
            user-select: none;
            z-index: 1;
        }
        .floating-doodles span:nth-child(1) { top: 12%; left: 8%; animation-delay: 0s; }
        .floating-doodles span:nth-child(2) { top: 75%; left: 10%; animation-delay: 2s; }
        .floating-doodles span:nth-child(3) { top: 25%; right: 18%; animation-delay: 4s; }
        .floating-doodles span:nth-child(4) { bottom: 12%; right: 9%; animation-delay: 1.5s; }
        .floating-doodles span:nth-child(5) { top: 52%; left: 4%; animation-delay: 3s; }
        @keyframes floatDoodle {
            0%   { transform: translateY(0) rotate(-6deg); }
            100% { transform: translateY(-24px) rotate(8deg); }
        }

        /* Login Card */
        .login-card {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 460px;
            background: #FFFFFF;
            border-radius: 28px;
            padding: 44px 38px;
            box-shadow: var(--fs-shadow-lg);
            border: 2px solid rgba(17, 138, 178, 0.12);
            border-top: 6px solid var(--fs-pink);
            animation: cardEntrance .6s cubic-bezier(0.34, 1.45, 0.64, 1) both;
        }
        @keyframes cardEntrance {
            from { opacity: 0; transform: translateY(32px) scale(0.94); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Brand Header */
        .login-header {
            text-align: center;
            margin-bottom: 28px;
        }
        .school-logo-wrap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
            background: var(--fs-yellow-light);
            border-radius: 22px;
            margin-bottom: 12px;
            border: 2px dashed var(--fs-yellow);
            box-shadow: var(--fs-shadow-sm);
        }
        .school-logo-wrap img {
            width: 72px;
            height: 72px;
            object-fit: contain;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .school-logo-wrap:hover img {
            transform: scale(1.08) rotate(3deg);
        }
        .brand-title {
            font-family: 'Fredoka', cursive;
            font-size: 1.85rem;
            color: var(--fs-blue-dark);
            line-height: 1.15;
            margin-bottom: 4px;
        }
        .brand-title span {
            color: var(--fs-pink);
        }
        .brand-subtitle {
            font-size: 0.88rem;
            font-weight: 700;
            color: var(--fs-text-muted);
            letter-spacing: 0.3px;
        }

        /* Welcome Badge */
        .portal-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 14px;
            border-radius: 30px;
            background: var(--fs-blue-light);
            color: var(--fs-blue);
            font-family: 'Fredoka', cursive;
            font-size: 0.85rem;
            font-weight: 600;
            margin-top: 8px;
        }

        /* Divider */
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--fs-yellow), transparent);
            margin: 20px 0 24px;
        }

        /* Form */
        .form-group {
            margin-bottom: 20px;
        }
        .form-label {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.82rem;
            font-weight: 800;
            color: var(--fs-blue-dark);
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 8px;
        }
        .input-wrap {
            position: relative;
        }
        .input-wrap i.input-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--fs-blue);
            font-size: 1rem;
            pointer-events: none;
            transition: color 0.2s;
        }
        .input-wrap input {
            width: 100%;
            padding: 13px 15px 13px 44px;
            background: var(--fs-bg);
            border: 2px solid #E5E7EB;
            border-radius: 14px;
            color: var(--fs-text);
            font-family: 'Nunito', sans-serif;
            font-size: 0.95rem;
            font-weight: 700;
            outline: none;
            transition: all 0.25s ease;
        }
        .input-wrap input:focus {
            border-color: var(--fs-blue);
            background: #FFFFFF;
            box-shadow: 0 0 0 4px rgba(17, 138, 178, 0.16);
        }
        .input-wrap .toggle-pw {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: var(--fs-text-muted);
            background: none;
            border: none;
            font-size: 1rem;
            padding: 6px;
            border-radius: 8px;
            transition: color 0.2s, background-color 0.2s;
        }
        .input-wrap .toggle-pw:hover {
            color: var(--fs-pink);
            background-color: var(--fs-pink-light);
        }

        /* Submit Button */
        .btn-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, var(--fs-pink) 0%, var(--fs-orange) 100%);
            color: #FFFFFF;
            font-family: 'Fredoka', cursive;
            font-size: 1.15rem;
            letter-spacing: 0.4px;
            border: none;
            border-radius: 16px;
            cursor: pointer;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, opacity 0.2s;
            box-shadow: var(--fs-shadow-colored);
            margin-top: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .btn-submit:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 16px 36px rgba(239, 71, 111, 0.38);
        }
        .btn-submit:active {
            transform: translateY(0) scale(0.99);
        }
        .btn-submit:disabled {
            opacity: 0.65;
            cursor: not-allowed;
            transform: none;
        }

        /* Demo Auto-fill Helper */
        .demo-helper {
            margin-top: 18px;
            padding: 10px 14px;
            background: var(--fs-yellow-light);
            border: 1px dashed var(--fs-yellow);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.8rem;
            font-weight: 700;
            color: #92400E;
        }
        .demo-fill-btn {
            background: #FFFFFF;
            border: 1px solid var(--fs-yellow);
            color: #B45309;
            font-family: 'Nunito', sans-serif;
            font-size: 0.75rem;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .demo-fill-btn:hover {
            background: #FEF3C7;
            transform: translateY(-1px);
        }

        /* Alerts */
        #login-alert {
            display: none;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.88rem;
            font-weight: 700;
            margin-bottom: 20px;
            animation: alertSlideIn 0.3s ease;
        }
        @keyframes alertSlideIn {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        #login-alert.error {
            background: #FEE2E2;
            border: 1.5px solid #FCA5A5;
            color: #B91C1C;
        }
        #login-alert.success {
            background: var(--fs-green-light);
            border: 1.5px solid var(--fs-green);
            color: #065F46;
        }

        /* Spinner */
        .spinner {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 2.5px solid rgba(255, 255, 255, 0.4);
            border-top-color: #FFFFFF;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Footer */
        .login-footer {
            text-align: center;
            margin-top: 24px;
            font-size: 0.82rem;
            color: var(--fs-text-muted);
            line-height: 1.5;
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: var(--fs-blue);
            font-weight: 800;
            text-decoration: none;
            margin-top: 10px;
            transition: color 0.2s, transform 0.2s;
        }
        .back-link:hover {
            color: var(--fs-pink);
            transform: translateX(-3px);
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 32px 22px;
                border-radius: 22px;
            }
            .brand-title {
                font-size: 1.6rem;
            }
            .sun-anim {
                display: none;
            }
        }
    </style>
</head>
<body>

<!-- Animated preschool elements -->
<div class="sun-anim" title="Sunshine at First Steps">☀️</div>
<div class="floating-doodles">
    <span>🎨</span><span>🧸</span><span>📚</span><span>🎵</span><span>🌈</span>
</div>

<div class="login-card">
    <div class="login-header">
        <div class="school-logo-wrap">
            <img src="../images/logo.png" alt="First Steps Pre School Logo">
        </div>
        <h1 class="brand-title">First Steps <span>Admin</span></h1>
        <p class="brand-subtitle">Administration & Content Management</p>
        <div class="portal-badge">
            <i class="fa fa-shield-halved"></i> Authorized Personnel Only
        </div>
    </div>

    <div class="divider"></div>

    <div id="login-alert"></div>

    <form id="login-form" novalidate>
        <div class="form-group">
            <label class="form-label" for="username">
                <span>Username</span>
            </label>
            <div class="input-wrap">
                <i class="fa fa-user input-icon"></i>
                <input type="text" id="username" name="username"
                       placeholder="Enter admin username"
                       autocomplete="username" required>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label" for="password">
                <span>Password</span>
            </label>
            <div class="input-wrap">
                <i class="fa fa-lock input-icon"></i>
                <input type="password" id="password" name="password"
                       placeholder="Enter your password"
                       autocomplete="current-password" required>
                <button type="button" class="toggle-pw" id="toggle-pw" aria-label="Toggle password visibility">
                    <i class="fa fa-eye"></i>
                </button>
            </div>
        </div>

        <button type="submit" class="btn-submit" id="login-btn">
            <i class="fa fa-arrow-right-to-bracket"></i>
            <span>Sign In to Dashboard</span>
        </button>

        <!-- Quick credential fill helper -->
        <div class="demo-helper">
            <span>🔑 Default: <strong>admin</strong> / <strong>Admin@123</strong></span>
            <button type="button" class="demo-fill-btn" id="auto-fill-btn">Fill In</button>
        </div>
    </form>

    <div class="login-footer">
        First Steps Pre School &bull; Tezpur, Assam<br>
        <a href="../index.html" class="back-link">
            <i class="fa fa-arrow-left"></i> Return to Public Website
        </a>
    </div>
</div>

<script>
    // Password visibility toggle
    const toggleBtn = document.getElementById('toggle-pw');
    const pwInput   = document.getElementById('password');
    toggleBtn.addEventListener('click', () => {
        const isPw = pwInput.type === 'password';
        pwInput.type = isPw ? 'text' : 'password';
        toggleBtn.innerHTML = isPw ? '<i class="fa fa-eye-slash"></i>' : '<i class="fa fa-eye"></i>';
    });

    // Auto fill helper
    document.getElementById('auto-fill-btn')?.addEventListener('click', () => {
        document.getElementById('username').value = 'admin';
        document.getElementById('password').value = 'Admin@123';
        document.getElementById('password').focus();
    });

    // Alert helper
    function showAlert(msg, type = 'error') {
        const el = document.getElementById('login-alert');
        el.innerHTML = (type === 'error' ? '<i class="fa fa-circle-exclamation"></i> ' : '<i class="fa fa-circle-check"></i> ') + msg;
        el.className = type;
        el.style.display = 'block';
    }

    // Submit handler
    document.getElementById('login-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn      = document.getElementById('login-btn');
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showAlert('Please enter both your admin username and password.');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Signing in…';

        const fd = new FormData();
        fd.append('action', 'login');
        fd.append('username', username);
        fd.append('password', password);

        try {
            const res  = await fetch('server/auth.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                showAlert('Welcome back! Loading your dashboard…', 'success');
                setTimeout(() => { window.location.href = 'dashboard.php'; }, 700);
            } else {
                showAlert(data.message || 'Login failed. Please verify your credentials.');
                btn.disabled = false;
                btn.innerHTML = '<i class="fa fa-arrow-right-to-bracket"></i> <span>Sign In to Dashboard</span>';
            }
        } catch (err) {
            showAlert('Network or server connection issue. Please check your XAMPP Apache/MySQL status.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa fa-arrow-right-to-bracket"></i> <span>Sign In to Dashboard</span>';
        }
    });
</script>
</body>
</html>
