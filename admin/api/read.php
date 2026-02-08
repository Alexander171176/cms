<?php
require_once __DIR__ . '/../bootstrap.php';

try {
    $path = $_GET['path'] ?? '';
    echo json_encode([
        'ok' => true,
        'content' => $fs->read($path),
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
