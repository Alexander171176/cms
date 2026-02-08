/**
 * app.js
 * Единая точка запуска админки.
 */
(function () {
    'use strict';

    const { qs } = window.Admin.Core;
    const Files = window.Admin.Files;

    async function init() {
        try {
            window.Admin.Theme?.init();
            window.Admin.Seo?.init();
            window.Admin.Mode?.init();
            window.Admin.Drawer?.init();
            window.Admin.Preview?.init();
            window.Admin.Layout?.init();
            window.Admin.Files?.bindEditor();
            window.Admin.CodeEditor?.init();

            // ✅ Дерево всего проекта (все директории и подпапки), кроме /admin
            await Files.loadTree(qs('#projectTree'));

            // ✅ открыть дефолтный файл, если он есть, иначе первый файл в дереве
            const indexItem = document.querySelector('#projectTree li[data-path="index.html"]');
            if (indexItem) {
                await Files.open('index.html');
            } else {
                const first = document.querySelector('#projectTree li[data-path]');
                if (first?.dataset?.path) await Files.open(first.dataset.path);
            }

            window.Admin.Preview?.reload();
        } catch (e) {
            console.error(e);
            Admin.Toast.error(e?.message || 'Отсутствует инициализация');
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
