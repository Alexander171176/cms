<?php

return [
    'project_root' => dirname(__DIR__), // root проекта cms/
    'max_size' => 1024 * 1024 * 2,

    // Какие директории нельзя показывать/читать/писать.
    // По задаче: исключаем только админку.
    'excluded_dirs' => ['admin'],

    // можно оставить, но для root-файлов мы ниже сделаем нормальную логику
    'allowed_files' => [
        // 'index.html', // можно убрать/оставить
    ],

    // Разрешённые расширения
    // Это влияет на отображение дерева и на операции read/write/delete/upload.
    // Добавили типичные форматы, включая изображения, архивы, аудио/видео и т.д.
    'allowed_ext' => [
        // web/text
        'html', 'htm', 'css', 'scss', 'sass', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml', 'md', 'txt', 'yml', 'yaml', 'sql', 'csv',

        // server-side
        'php',

        // images
        'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg',

        // docs
        'pdf',

        // media
        'mp4', 'webm', 'mov', 'avi', 'mkv',
        'mp3', 'wav', 'ogg', 'flac', 'm4a',

        // archives
        'zip', 'rar', '7z', 'tar', 'gz',

        // fonts
        'ttf', 'otf', 'woff', 'woff2', 'eot',
    ],
];
