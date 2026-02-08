<?php
require __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $dir = (string)($_POST['dir'] ?? '');
    if (!isset($_FILES['file'])) {
        throw new Exception('No file uploaded');
    }

    $file = $_FILES['file'];
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        throw new Exception('Upload error: ' . (int)$file['error']);
    }

    $originalName = (string)($file['name'] ?? '');
    if ($originalName === '') {
        throw new Exception('Invalid file name');
    }

    // Разрешаем загрузку только в существующую директорию внутри project_root
    $targetDir = $fs->guard()->validateDir($dir);
    if (!is_dir($targetDir)) {
        throw new Exception('Target directory not found');
    }

    // Проверка расширения через guard (тот же список allowed_ext)
    $safeName = basename($originalName);
    $targetRelPath = trim($dir, "/\\");
    $targetRelPath = $targetRelPath !== '' ? ($targetRelPath . '/' . $safeName) : $safeName;
    $targetFull = $fs->guard()->validatePath($targetRelPath);

    // Не перезаписываем файл молча — добавим суффикс (1), (2)...
    if (file_exists($targetFull)) {
        $pi = pathinfo($safeName);
        $base = $pi['filename'] ?? 'file';
        $ext = isset($pi['extension']) && $pi['extension'] !== '' ? ('.' . $pi['extension']) : '';
        $i = 1;
        do {
            $candidate = $base . ' (' . $i . ')' . $ext;
            $targetRelPath = trim($dir, "/\\");
            $targetRelPath = $targetRelPath !== '' ? ($targetRelPath . '/' . $candidate) : $candidate;
            $targetFull = $fs->guard()->validatePath($targetRelPath);
            $i++;
        } while (file_exists($targetFull) && $i < 1000);
        if (file_exists($targetFull)) {
            throw new Exception('Cannot create unique file name');
        }
    }

    if (!move_uploaded_file($file['tmp_name'], $targetFull)) {
        throw new Exception('Failed to move uploaded file');
    }

    echo json_encode(['ok' => true, 'path' => $targetRelPath], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
