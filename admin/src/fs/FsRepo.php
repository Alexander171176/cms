<?php
namespace Admin\Fs;

use Exception;

class FsRepo
{
    private array $config;
    private FsGuard $guard;

    public function __construct(array $config, FsGuard $guard)
    {
        $this->config = $config;
        $this->guard = $guard;
    }

    public function guard(): FsGuard
    {
        return $this->guard;
    }

    public function list(string $dir): array
    {
        $dir = trim($dir, '/');

        // Валидация директории: внутри project_root и не в excluded_dirs
        $root = rtrim($this->config['project_root'], '/');
        $first = ($dir === '' || !str_contains($dir, '/')) ? $dir : explode('/', $dir)[0];
        if ($first !== '' && !empty($this->config['excluded_dirs']) && in_array($first, $this->config['excluded_dirs'], true)) {
            return [];
        }

        $path = $dir === '' ? $root : ($root . '/' . $dir);
        $real = realpath($path);
        if (!$real || strncmp($real, $root, strlen($root)) !== 0) {
            return [];
        }

        $path = $real;

        if (!is_dir($path)) {
            return [];
        }

        $files = [];
        foreach (scandir($path) as $file) {
            if ($file === '.' || $file === '..') continue;

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (!in_array($ext, $this->config['allowed_ext'], true)) continue;

            $full = $path . '/' . $file;
            if (!is_file($full)) continue;

            $files[] = [
                'name' => $file,
                // важно: для root не должно быть "/filename"
                'path' => ($dir !== '' ? ($dir . '/' . $file) : $file),
                'size' => filesize($full),
            ];
        }

        return $files;
    }

    /**
     * Рекурсивное дерево файлов/папок.
     * Возвращает массив узлов: {type: 'dir'|'file', name, path, children?}
     */
    public function tree(string $dir = ''): array
    {
        $dir = trim((string)$dir, '/');

        $rootCfg = (string)($this->config['project_root'] ?? '');
        $rootCfg = rtrim($rootCfg, "/\\");
        $rootAbs = realpath($rootCfg) ?: $rootCfg;

        // Собираем путь до директории и нормализуем слеши (важно для Windows).
        $path = $dir === '' ? $rootAbs : ($rootAbs . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $dir));
        $real = realpath($path);

        if (!$real || !is_dir($real)) {
            return [];
        }

        $realNorm = str_replace("\\", "/", $real);
        $rootNorm = str_replace("\\", "/", $rootAbs);
        $rootNorm = rtrim($rootNorm, '/');

        // Защита от выхода за пределы project_root
        if (strpos($realNorm, $rootNorm) !== 0) {
            return [];
        }

        return $this->buildTree($real, $dir);
    }

    private function buildTree(string $absDir, string $relDir): array
    {
        $nodes = [];

        foreach (scandir($absDir) as $name) {
            if ($name === '.' || $name === '..') continue;

            // пропускаем исключённые директории (по первому сегменту)
            if ($relDir === '' && is_dir($absDir . '/' . $name) && !empty($this->config['excluded_dirs'])
                && in_array($name, $this->config['excluded_dirs'], true)) {
                continue;
            }

            // пропускаем скрытые директории/файлы (.git, .env и т.п.)
            if (str_starts_with($name, '.')) continue;

            $abs = $absDir . '/' . $name;
            $rel = $relDir === '' ? $name : ($relDir . '/' . $name);

            if (is_dir($abs)) {
                $children = $this->buildTree($abs, $rel);
                // показываем папку только если в ней есть что-то допустимое
                if (count($children) === 0) continue;

                $nodes[] = [
                    'type' => 'dir',
                    'name' => $name,
                    'path' => $rel,
                    'children' => $children,
                ];
                continue;
            }

            if (!is_file($abs)) continue;

            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (!in_array($ext, $this->config['allowed_ext'], true)) continue;

            $nodes[] = [
                'type' => 'file',
                'name' => $name,
                'path' => $rel,
                'size' => filesize($abs),
            ];
        }

        // сортировка: папки вверх, затем файлы, всё по имени
        usort($nodes, function ($a, $b) {
            if ($a['type'] !== $b['type']) return $a['type'] === 'dir' ? -1 : 1;
            return strcasecmp($a['name'], $b['name']);
        });

        return $nodes;
    }

    /**
     * @throws Exception
     */
    public function read(string $path): string
    {
        $full = $this->guard->validatePath($path);
        return file_get_contents($full);
    }

    /**
     * @throws Exception
     */
    public function write(string $path, string $content): void
    {
        $full = $this->guard->validatePath($path);

        if (strlen($content) > $this->config['max_size']) {
            throw new Exception('File too large');
        }

        file_put_contents($full, $content);
    }

    /**
     * @throws Exception
     */
    public function deleteFile(string $path): void
    {
        $full = $this->guard->validatePath($path);
        if (!is_file($full)) {
            throw new Exception('File not found');
        }
        if (!@unlink($full)) {
            throw new Exception('Unable to delete file');
        }
    }

    /**
     * @throws Exception
     */
    public function uploadFile(string $dir, array $file): array
    {
        $fullDir = $this->guard->validateDir($dir);

        if (empty($file) || !isset($file['tmp_name'], $file['name'])) {
            throw new Exception('No file');
        }
        if (!is_uploaded_file($file['tmp_name'])) {
            throw new Exception('Invalid upload');
        }

        $name = basename((string)$file['name']);

        // простая защита от мусорных имён
        $name = preg_replace('/[^a-zA-Z0-9._-]+/u', '_', $name);

        // проверка расширения согласно allowed_ext
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $allowed = $this->config['allowed_ext'] ?? [];
        if ($ext === '' || !in_array($ext, $allowed, true)) {
            throw new Exception('Extension not allowed');
        }

        $target = rtrim($fullDir, '/\\') . '/' . $name;

        // если файл существует — добавляем суффикс
        if (file_exists($target)) {
            $base = pathinfo($name, PATHINFO_FILENAME);
            $i = 2;
            do {
                $candidate = $base . '-' . $i . '.' . $ext;
                $target = rtrim($fullDir, '/\\') . '/' . $candidate;
                $i++;
            } while (file_exists($target));
            $name = basename($target);
        }

        if (!@move_uploaded_file($file['tmp_name'], $target)) {
            throw new Exception('Unable to move uploaded file');
        }

        return [
            'name' => $name,
            'dir' => $dir,
            'path' => trim($dir, '/\\') === '' ? $name : trim($dir, '/\\') . '/' . $name,
        ];
    }
}
