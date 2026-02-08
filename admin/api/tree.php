<?php
require __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // дерево проекта от корня, кроме excluded_dirs
    $tree = $fs->tree('');
    echo json_encode(['ok' => true, 'tree' => $tree], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
