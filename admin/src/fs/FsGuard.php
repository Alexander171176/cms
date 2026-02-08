<?php
namespace Admin\Fs;

use Exception;

class FsGuard
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * @throws Exception
     */
    public function validatePath(string $path): string
    {
        $path = trim($path);

        if ($path === '' || str_contains($path, '..')) {
            throw new Exception('Invalid path');
        }

        // Первый сегмент пути (если нет / — значит файл в root)
        $first = str_contains($path, '/') ? explode('/', $path)[0] : '';

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (!in_array($ext, $this->config['allowed_ext'], true)) {
            throw new Exception('Forbidden extension: ' . $ext);
        }

        // Запрещаем доступ к исключённым директориям (по задаче: admin)
        $excluded = $this->config['excluded_dirs'] ?? [];
        if ($first !== '' && in_array($first, $excluded, true)) {
            throw new Exception('Forbidden path');
        }

        $full = $this->config['project_root'] . '/' . $path;

        // финальная защита: файл должен оставаться внутри project_root
        $root = realpath($this->config['project_root']);
        $real = realpath($full) ?: $full;

        if ($root && !str_starts_with(str_replace('\\', '/', $real), str_replace('\\', '/', $root))) {
            throw new Exception('Path escape detected');
        }

        return $full;
    }

    /**
     * Валидация директории (без проверки расширения).
     * Используется, например, для загрузки файла в папку.
     * @throws Exception
     */
    public function validateDir(string $dir): string
    {
        $dir = trim($dir);
        $dir = ltrim($dir, '/\\');

        if ($dir === '' || str_contains($dir, '..')) {
            throw new Exception('Invalid dir');
        }

        // Первый сегмент пути (если нет / — значит папка в root)
        $first = str_contains($dir, '/') ? explode('/', $dir)[0] : $dir;

        // Запрещаем доступ к исключённым директориям
        $excluded = $this->config['excluded_dirs'] ?? [];
        if ($first !== '' && in_array($first, $excluded, true)) {
            throw new Exception('Forbidden dir');
        }

        $full = $this->config['project_root'] . '/' . $dir;

        // финальная защита: папка должна оставаться внутри project_root
        $root = realpath($this->config['project_root']);
        $real = realpath($full) ?: $full;

        if ($root && !str_starts_with(str_replace('\\', '/', $real), str_replace('\\', '/', $root))) {
            throw new Exception('Path escape detected');
        }

        if (!is_dir($full)) {
            throw new Exception('Directory not found');
        }

        return $full;
    }

}
