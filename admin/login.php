<?php
session_start();

if (!empty($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true) {
    header('Location: /admin/');
    exit;
}

$error = $_SESSION['admin_login_error'] ?? null;
unset($_SESSION['admin_login_error']);
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Вход в админку</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body{font-family:Arial,serif;margin:0;background:#f4f6f8;display:flex;min-height:100vh;align-items:center;justify-content:center}
        .card{background:#fff;padding:24px;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.08);width:270px}
        .title{font-size:18px;font-weight:700;margin:0 0 14px;text-align:center;color:#2563eb}
        .inp{width:240px;padding:10px 12px;border:1px solid #d5dbe1;border-radius:8px;margin:0 0 10px}
        .btn{width:266px;padding:10px 12px;border:0;border-radius:8px;background:#2563eb;color:#fff;font-weight:700;cursor:pointer}
        .err{color:#b91c1c;font-size:13px;margin:0 0 10px;text-align:center;}
    </style>
</head>
<body>
<form class="card" method="post" action="/admin/auth/action.php">
    <h1 class="title">Вход в админку</h1>

    <?php if ($error): ?>
        <div class="err"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <input class="inp" name="login" placeholder="Логин" required>
    <input class="inp" type="password" name="password" placeholder="Пароль" required>

    <button class="btn" type="submit">Войти</button>
</form>
</body>
</html>
