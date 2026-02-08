<?php
session_start();

$config = require __DIR__ . '/config.php';

$login = trim($_POST['login'] ?? '');
$password = $_POST['password'] ?? '';

if (
    $login === ($config['login'] ?? 'admin')
    && !empty($config['password_hash'])
    && password_verify($password, $config['password_hash'])
) {
    $_SESSION['admin_logged'] = true;
    header('Location: /admin/');
    exit;
}

$_SESSION['admin_login_error'] = 'Неверный логин или пароль';
header('Location: /admin/login.php');
exit;
