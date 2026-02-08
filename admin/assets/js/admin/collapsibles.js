/**
 * collapsibles.js
 * Сворачивание/разворачивание левого и правого сайдбаров (desktop).
 */
(function () {
    'use strict';

    const { qs, storeGet, storeSet } = window.Admin.Core;

    const Layout = {};

    Layout.setSidebarState = function (state) {
        const sidebar = qs('#sidebar');
        const btn = qs('#sidebarCollapse');
        if (!sidebar) return;

        const collapsed = state === 'collapsed';
        sidebar.dataset.state = state;

        sidebar.classList.toggle('is-collapsed', collapsed);

        // ВАЖНО: убираем базовый md:w-72 из разметки, чтобы md:w-16 работал
        sidebar.classList.remove('md:w-72');

        sidebar.classList.toggle('md:w-16', collapsed);
        sidebar.classList.toggle('md:w-80', !collapsed);

        const body = sidebar.querySelector('.sidebar-body');
        const title = sidebar.querySelector('.sidebar-title');

        // title прячем (в шапке сайдбара)
        if (title) title.classList.toggle('hidden', collapsed);

        // body НЕ прячем целиком — иначе исчезнут и иконки.
        // Вместо этого переключаем "икон-режим" классом на sidebar (ты уже добавляешь is-collapsed)
        // и чуть меняем поведение через Tailwind-классы в разметке/рендере.
        if (body) {
            // чтобы в collapsed было меньше отступов
            body.classList.toggle('p-3', !collapsed);
            body.classList.toggle('p-2', collapsed);
        }

        if (btn) {
            btn.textContent = collapsed ? '▶' : '◀';
            btn.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
        }
    };

    Layout.setPreviewState = function (state) {
        const preview = qs('#preview');
        const btn = qs('#previewCollapse');
        const reload = qs('#previewReload');
        const fullBtn = qs('#previewFull');
        const sidebar = qs('#sidebar');
        const main = qs('#main');
        if (!preview) return;

        const collapsed = state === 'collapsed';
        const full = state === 'full';
        preview.dataset.state = state;

        // reset classes for all modes first
        preview.classList.remove('fixed', 'inset-0', 'z-50');
        preview.classList.remove('w-full');
        preview.classList.remove('w-16');
        preview.classList.remove('w-[340px]');

        // show/hide other columns in "full" mode
        if (sidebar) sidebar.classList.toggle('hidden', full);
        if (main) main.classList.toggle('hidden', full);
        document.body.classList.toggle('overflow-hidden', full);

        if (full) {
            // Full-screen preview (desktop)
            preview.classList.add('fixed', 'inset-0', 'z-50', 'w-full');
        } else {
            // Normal / collapsed widths
            preview.classList.add(collapsed ? 'w-16' : 'w-[340px]');
        }

        const body = preview.querySelector('.preview-body');
        const title = preview.querySelector('.preview-title');

        // Body/title hidden only in collapsed mode (в full — показываем)
        if (body) body.classList.toggle('hidden', collapsed);
        if (title) title.classList.toggle('hidden', collapsed);
        if (reload) reload.classList.toggle('hidden', collapsed);

        // Full button UI
        if (fullBtn) {
            fullBtn.textContent = full ? '🗗' : '🗖';
            fullBtn.title = full ? 'Exit full preview' : 'Full preview';
        }

        if (btn) {
            // В full режиме кнопку "collapse" показываем как "Exit" (быстро вернуться)
            if (full) {
                btn.textContent = '⤺';
                btn.title = 'Exit full preview';
            } else {
                btn.textContent = collapsed ? '◀' : '▶';
                btn.title = collapsed ? 'Expand preview' : 'Collapse preview';
            }
        }
    };

    Layout.init = function () {
        const sidebar = qs('#sidebar');
        const sidebarBtn = qs('#sidebarCollapse');
        if (sidebar && sidebarBtn) {
            sidebarBtn.addEventListener('click', () => {
                const next = sidebar.dataset.state === 'collapsed' ? 'open' : 'collapsed';
                Layout.setSidebarState(next);
                storeSet('sidebar_state', next);
            });

            const saved = storeGet('sidebar_state');
            Layout.setSidebarState(saved === 'collapsed' ? 'collapsed' : 'open');
        }

        const preview = qs('#preview');
        const previewBtn = qs('#previewCollapse');
        const previewFullBtn = qs('#previewFull');
        if (preview && previewBtn) {
            previewBtn.addEventListener('click', () => {
                // If we are in full mode — exit to previous state
                if (preview.dataset.state === 'full') {
                    const prev = storeGet('preview_state_prev') || 'open';
                    Layout.setPreviewState(prev);
                    storeSet('preview_state', prev);
                    return;
                }

                const next = preview.dataset.state === 'collapsed' ? 'open' : 'collapsed';
                Layout.setPreviewState(next);
                storeSet('preview_state', next);
            });

            if (previewFullBtn) {
                previewFullBtn.addEventListener('click', () => {
                    const current = preview.dataset.state || 'open';

                    if (current === 'full') {
                        const prev = storeGet('preview_state_prev') || 'open';
                        Layout.setPreviewState(prev);
                        storeSet('preview_state', prev);
                        return;
                    }

                    // entering full: remember current state
                    storeSet('preview_state_prev', current);
                    Layout.setPreviewState('full');
                });
            }

            const saved = storeGet('preview_state');
            Layout.setPreviewState(saved === 'collapsed' ? 'collapsed' : 'open');
        }
    };

    window.Admin.Layout = Layout;
})();
