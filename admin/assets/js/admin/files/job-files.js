/**
 * files.js
 * Работа с файлами:
 * - дерево проекта (папки + файлы)
 * - open/read (текст + бинарные: изображения/pdf/svg)
 * - save/write
 * - active item highlight
 * - dirty state
 * - SVG иконки у файлов (по расширению) через window.Admin.FilesIcons
 * - ✅ upload в папку (кнопка + в дереве)
 * - ✅ delete файла (кнопка у файла)
 *
 * Важно:
 * - Иконки создаём через DOM (createElementNS), а не через HTML-строки.
 * - В collapsed режиме (sidebar.is-collapsed) скрываем текст, оставляем только иконки.
 */
    'use strict';

    const { qs, qsa, apiUrl, fetchJson } = window.Admin.Core;
    const State = window.Admin.State;
    const Preview = window.Admin.Preview;

    const Files = {};

    