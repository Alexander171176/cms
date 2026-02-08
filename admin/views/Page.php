<!DOCTYPE html>
<html lang="ru" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Admin CMS</title>

    <script src="/admin/libs/tailwind/tailwindcss.js"></script>
    <script>
        tailwind.config = { darkMode: 'class' }
    </script>

    <link rel="stylesheet" href="/admin/assets/css/admin.css">
    <link rel="stylesheet" href="/admin/libs/codemirror/css/codemirror.min.css">
    <link rel="stylesheet" href="/admin/libs/codemirror/css/theme/dracula.min.css">

</head>
<body class="bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-200">

<!-- Overlay (мобилка) -->
<div id="sidebarOverlay"
     class="fixed inset-0 bg-black/40 hidden z-40 md:hidden"></div>

<div class="flex min-h-dvh">
    <?php include __DIR__ . '/Sidebar.php'; ?>

    <div id="main" class="flex-1 flex flex-col min-w-0">
        <?php include __DIR__ . '/Main.php'; ?>
    </div>

    <?php include __DIR__ . '/Preview.php'; ?>
</div>

<script src="/admin/assets/js/admin/core.js"></script>
<script src="/admin/assets/js/admin/state.js"></script>
<script src="/admin/assets/js/admin/marked.js"></script>
<script src="/admin/assets/js/admin/preview.js"></script>
<script src="/admin/assets/js/admin/theme.js"></script>
<script src="/admin/assets/js/admin/drawer.js"></script>
<script src="/admin/assets/js/admin/collapsibles.js"></script>
<script src="/admin/assets/js/admin/files/make-icons.js"></script>
<script src="/admin/assets/js/admin/files/job-files.js"></script>
<script src="/admin/assets/js/admin/files/helpers-ext.js"></script>
<script src="/admin/assets/js/admin/files/actions-plus-trash.js"></script>
<script src="/admin/assets/js/admin/files/active-highlight.js"></script>
<script src="/admin/assets/js/admin/files/render-file.js"></script>
<script src="/admin/assets/js/admin/files/load-list.js"></script>
<script src="/admin/assets/js/admin/files/tree-recursive.js"></script>
<script src="/admin/assets/js/admin/files/open-save.js"></script>
<script src="/admin/assets/js/admin/files/delete-upload.js"></script>
<script src="/admin/assets/js/admin/files/editor-bindings.js"></script>
<script src="/admin/assets/js/admin/files/gallery-mode.js"></script>
<script src="/admin/assets/js/admin/seo.js"></script>
<script src="/admin/assets/js/admin/mode.js"></script>
<script src="/admin/assets/js/admin/toast.js"></script>
<script src="/admin/assets/js/admin/app.js"></script>

<script src="/admin/libs/codemirror/js/codemirror.min.js"></script>

<!-- Code Mirror https://cdnjs.com/libraries/codemirror/5.65.16 -->
<script src="/admin/libs/codemirror/js/mode/xml.min.js"></script><!-- xml -->
<script src="/admin/libs/codemirror/js/mode/sql.min.js"></script><!-- sql -->
<script src="/admin/libs/codemirror/js/mode/javascript.min.js"></script><!-- js -->
<script src="/admin/libs/codemirror/js/mode/css.min.js"></script><!-- css -->
<script src="/admin/libs/codemirror/js/mode/sass.min.js"></script><!-- sass -->
<script src="/admin/libs/codemirror/js/mode/htmlmixed.min.js"></script><!-- html -->
<script src="/admin/libs/codemirror/js/mode/php.min.js"></script><!-- php -->
<script src="/admin/libs/codemirror/js/mode/markdown.min.js"></script><!-- md -->

<!-- наш модуль -->
<script src="/admin/assets/js/admin/code-editor.js"></script>

<div id="toastRoot"
     class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
</div>

</body>
</html>
