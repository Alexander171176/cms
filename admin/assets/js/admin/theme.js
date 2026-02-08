/**
 * theme.js
 * Переключатель dark/light с сохранением в localStorage.
 * ВАЖНО: не используем btn.textContent, чтобы не уничтожать SVG внутри кнопки.
 */
(function () {
    'use strict';

    const { qs, storeGet, storeSet } = window.Admin.Core;

    const Theme = {};

    Theme.apply = function (theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    };

    Theme.init = function () {
        const btn = qs('#themeToggle');
        if (!btn) return;

        // стартовая тема
        const initial = storeGet('theme') || 'dark';
        Theme.apply(initial);

        // клик = переключение темы
        btn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            const next = isDark ? 'light' : 'dark';
            Theme.apply(next);
            storeSet('theme', next);
        });
    };

    window.Admin.Theme = Theme;
})();
