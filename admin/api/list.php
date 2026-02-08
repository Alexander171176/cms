<?php
require_once __DIR__ . '/../bootstrap.php';

$dir = $_GET['dir'] ?? '';

echo json_encode([
    'ok' => true,
    'files' => $fs->list($dir),
]);
