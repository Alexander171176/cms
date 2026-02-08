<?php
require_once __DIR__ . '/../bootstrap.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    $fs->write($data['path'], $data['content']);
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
