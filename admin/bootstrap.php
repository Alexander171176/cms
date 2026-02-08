<?php

$config = require __DIR__ . '/config.php';

require_once __DIR__ . '/src/fs/FsGuard.php';
require_once __DIR__ . '/src/fs/FsRepo.php';

use Admin\Fs\FsGuard;
use Admin\Fs\FsRepo;

$guard = new FsGuard($config);
$fs = new FsRepo($config, $guard);

header('Content-Type: application/json; charset=utf-8');
