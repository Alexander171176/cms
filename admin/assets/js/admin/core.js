/**
 * core.js
 * Базовые утилиты: селекторы, fetchJson, apiUrl, media helpers, storage.
 */
(function () {
    'use strict';

    window.Admin = window.Admin || {};

    const Core = {};

    // Удобные селекторы
    Core.qs = (sel, root = document) => root.querySelector(sel);
    Core.qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // Сборка URL для API
    Core.apiUrl = (path) => (path.startsWith('api/') ? path : `api/${path}`);

    // JSON-fetch с защитой от HTML/ошибок сервера
    Core.fetchJson = async (url, options) => {
        const res = await fetch(url, options);
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            throw new Error('Non-JSON response:\n' + text.slice(0, 200));
        }
    };

    // Проверка мобилки по брейкпоинту (md)
    Core.isMobile = () => window.matchMedia('(max-width: 767px)').matches;

    // Storage helpers
    Core.storeGet = (key) => localStorage.getItem(key);
    Core.storeSet = (key, value) => localStorage.setItem(key, value);

    window.Admin.Core = Core;
})();
