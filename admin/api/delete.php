<?php
require __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $raw = file_get_contents('php://input');
    $payload = $raw ? json_decode($raw, true) : [];
    $path = (string)($payload['path'] ?? '');

    if ($path === '') {
        throw new Exception('Missing path');
    }

    $fs->deleteFile($path);

    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
