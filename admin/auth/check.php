<?php
session_start();

if (empty($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('Location: /admin/login.php');
    exit;
}
