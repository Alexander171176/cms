/**
 * drawer.js
 * Мобильный drawer для левого сайдбара: open/close + overlay.
 */
(function () {
    'use strict';

    const { qs, isMobile } = window.Admin.Core;

    const Drawer = {};

    Drawer.open = function () {
        const sidebar = qs('#sidebar');
        const overlay = qs('#sidebarOverlay');
        if (!sidebar || !overlay) return;

        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    };

    Drawer.close = function () {
        const sidebar = qs('#sidebar');
        const overlay = qs('#sidebarOverlay');
        if (!sidebar || !overlay) return;

        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    };

    Drawer.init = function () {
        const sidebar = qs('#sidebar');
        const overlay = qs('#sidebarOverlay');
        const openBtn = qs('#sidebarOpen');
        const closeBtn = qs('#sidebarClose');

        // если элементов нет — просто выключаем модуль
        if (!sidebar || !overlay || !openBtn || !closeBtn) return;

        openBtn.addEventListener('click', Drawer.open);
        closeBtn.addEventListener('click', Drawer.close);
        overlay.addEventListener('click', Drawer.close);

        // Закрывать drawer после выбора файла (на мобилке)
        document.addEventListener('click', (e) => {
            const li = e.target.closest('#rootFiles li, #cssFiles li, #jsFiles li');
            if (!li) return;
            if (isMobile()) Drawer.close();
        });
    };

    window.Admin.Drawer = Drawer;
})();
