/**
 * state.js
 * Единое состояние админки: текущий файл, оригинал, dirty-флаг.
 */
(function () {
    'use strict';

    window.Admin = window.Admin || {};

    window.Admin.State = {
        currentPath: null,
        original: '',
        dirty: false,
    };
})();
