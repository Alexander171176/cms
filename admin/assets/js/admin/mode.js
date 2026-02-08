/**
 * mode.js
 * Переключение Editor/SEO
 * - Кнопки Editor/SEO показываем ТОЛЬКО на HTML
 * - Если файл НЕ html → всегда Editor и без переключателя
 * - Если мы в SEO-режиме и открыли другой HTML → Seo.open(...) вызывается заново
 */
(function () {
    'use strict';

    const { qs, storeGet, storeSet } = window.Admin.Core;

    const Mode = {};
    Mode.current = 'editor';

    function isHtmlPath(path) {
        return /\.(html?|htm)$/i.test(String(path || ''));
    }

    function updateVisibility(path) {
        const btnEditor = qs('#modeEditor');
        const btnSeo = qs('#modeSeo');

        const show = isHtmlPath(path);

        // скрываем обе кнопки, если файл не html
        if (btnEditor) btnEditor.classList.toggle('hidden', !show);
        if (btnSeo) btnSeo.classList.toggle('hidden', !show);
    }

    Mode.apply = async function (mode) {
        const panelEditor = qs('#panelEditor');
        const panelSeo = qs('#panelSeo');

        const btnEditor = qs('#modeEditor');
        const btnSeo = qs('#modeSeo');

        const currentPath = window.Admin.State?.currentPath || 'index.html';
        const isHtml = isHtmlPath(currentPath);

        // если это не html — SEO режим запрещён
        if (!isHtml) mode = 'editor';

        Mode.current = mode;
        storeSet('admin_mode', mode);

        updateVisibility(currentPath);

        if (panelEditor) panelEditor.classList.toggle('hidden', mode === 'seo');
        if (panelSeo) panelSeo.classList.toggle('hidden', mode !== 'seo');

        // подсветка кнопок
        if (btnEditor) btnEditor.classList.toggle('bg-slate-200', mode === 'editor');
        if (btnSeo) btnSeo.classList.toggle('bg-slate-200', mode === 'seo');

        if (btnEditor) btnEditor.classList.toggle('dark:bg-slate-700', mode === 'editor');
        if (btnSeo) btnSeo.classList.toggle('dark:bg-slate-700', mode === 'seo');

        // ✅ SEO всегда должен открываться именно для текущего файла
        if (mode === 'seo') {
            await window.Admin.Seo?.open?.(currentPath);
            // и превью должно смотреть тот же html
            window.Admin.Preview?.set?.(currentPath);
        }
    };

    // Вызывается, когда Files.open(...) сменил активный файл
    Mode.onFileChanged = async function (path) {
        updateVisibility(path);

        const isHtml = isHtmlPath(path);

        // если открыли НЕ html и сейчас SEO — принудительно вернёмся в Editor
        if (!isHtml && Mode.current === 'seo') {
            await Mode.apply('editor');
            return;
        }

        // если открыли html и мы уже в seo — нужно обновить форму
        if (isHtml && Mode.current === 'seo') {
            await window.Admin.Seo?.open?.(path);
            window.Admin.Preview?.set?.(path);
        }
    };

    Mode.init = function () {
        const btnEditor = qs('#modeEditor');
        const btnSeo = qs('#modeSeo');

        if (btnEditor) btnEditor.addEventListener('click', () => Mode.apply('editor'));
        if (btnSeo) btnSeo.addEventListener('click', () => Mode.apply('seo'));

        const saved = storeGet('admin_mode') || 'editor';
        Mode.current = saved;
        Mode.apply(saved);
    };

    window.Admin.Mode = Mode;
})();
