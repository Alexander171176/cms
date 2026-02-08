/**
 * seo.js
 * SEO-редактор для ROOT HTML файлов:
 * - Парсит <head> (title/meta/link)
 * - Добавляет поля для OG/Twitter/Dublin Core (в форме они всегда есть)
 * - Ограничения по символам + счётчики + динамические бордеры + валидация
 * - Автогенерация части полей по кнопке
 * - Сохраняет изменения обратно в HTML (внутри <head>)
 *
 * Требует:
 *  - #seoPages (sidebar)
 *  - #modeEditor, #modeSeo
 *  - #panelEditor, #panelSeo
 *  - #seoForm
 *  - api/list.php, api/read.php, api/write.php
 */

(function () {
    'use strict';

    const { qs, qsa, apiUrl, fetchJson } = window.Admin.Core;
    const State = window.Admin.State;
    const Preview = window.Admin.Preview;

    const Seo = {};

    // -----------------------------
    // Limits
    // -----------------------------
    const LIMITS = {
        title: 60,
        description: 160,
        keywords: 255,
        robots: 255,
        canonical: 2048,
        viewport: 255,
        charset: 40,

        'og:title': 60,
        'og:description': 160,
        'og:url': 2048,
        'og:image': 2048,
        'og:site_name': 120,
        'og:type': 60,
        'og:locale': 30,

        'twitter:title': 60,
        'twitter:description': 160,
        'twitter:image': 2048,
        'twitter:site': 120,
        'twitter:card': 60,

        'DC.title': 60,
        'DC.description': 160,
        'DC.subject': 255,
        'DC.creator': 120,
        'DC.publisher': 120,
        'DC.language': 20,
    };

    const BASE_FIELDS = [
        { key: 'title', label: 'Title', type: 'text', hint: 'Рекомендуемо до 60 символов' },
        { key: 'description', label: 'Meta Description', type: 'textarea', hint: 'Рекомендуемо до 160 символов' },
        { key: 'keywords', label: 'Meta Keywords', type: 'text' },
        { key: 'robots', label: 'Robots', type: 'text', placeholder: 'index,follow' },
        { key: 'canonical', label: 'Canonical URL', type: 'text', placeholder: 'https://example.com/page' },
        { key: 'viewport', label: 'Viewport', type: 'text' },
        { key: 'charset', label: 'Charset', type: 'text' },
    ];

    const OG_FIELDS = [
        'og:title',
        'og:description',
        'og:type',
        'og:url',
        'og:image',
        'og:site_name',
        'og:locale',
    ];

    const TW_FIELDS = [
        'twitter:card',
        'twitter:title',
        'twitter:description',
        'twitter:image',
        'twitter:site',
    ];

    const DC_FIELDS = [
        'DC.title',
        'DC.description',
        'DC.subject',
        'DC.creator',
        'DC.publisher',
        'DC.language',
    ];

    // -----------------------------
    // Mode
    // -----------------------------
    Seo.setMode = function (mode) {
        const panelEditor = qs('#panelEditor');
        const panelSeo = qs('#panelSeo');
        const btnEditor = qs('#modeEditor');
        const btnSeo = qs('#modeSeo');

        if (panelEditor) panelEditor.classList.toggle('hidden', mode === 'seo');
        if (panelSeo) panelSeo.classList.toggle('hidden', mode !== 'seo');

        if (btnEditor) {
            btnEditor.classList.toggle('bg-slate-200', mode === 'editor');
            btnEditor.classList.toggle('dark:bg-slate-700', mode === 'editor');
            btnEditor.classList.toggle('bg-white', mode === 'seo');
            btnEditor.classList.toggle('dark:bg-slate-900', mode === 'seo');
        }

        if (btnSeo) {
            btnSeo.classList.toggle('bg-slate-200', mode === 'seo');
            btnSeo.classList.toggle('dark:bg-slate-700', mode === 'seo');
            btnSeo.classList.toggle('bg-white', mode === 'editor');
            btnSeo.classList.toggle('dark:bg-slate-900', mode === 'editor');
        }
    };

    function bindModeButtons() {
        const btnEditor = qs('#modeEditor');
        const btnSeo = qs('#modeSeo');

        if (btnEditor) btnEditor.addEventListener('click', () => Seo.setMode('editor'));
        if (btnSeo) {
            btnSeo.addEventListener('click', async () => {
                const path = State.currentPath || 'index.html';
                await Seo.open(path);
                Seo.setMode('seo');
            });
        }
    }

    // -----------------------------
    // Helpers
    // -----------------------------
    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function escapeAttr(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;');
    }

    function cssEscapeAttr(v) {
        return (v || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    function safeId(s) {
        return String(s || '').replace(/[^a-zA-Z0-9_-]+/g, '_');
    }

    function stripText(s) {
        return String(s || '').replace(/\s+/g, ' ').trim();
    }

    // -----------------------------
    // HEAD parsing/apply
    // -----------------------------
    function parseHtml(html) {
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }

    function getOrCreateMeta(doc, attrName, attrValue) {
        let el = doc.head.querySelector(`meta[${attrName}="${cssEscapeAttr(attrValue)}"]`);
        if (!el) {
            el = doc.createElement('meta');
            el.setAttribute(attrName, attrValue);
            doc.head.appendChild(el);
        }
        return el;
    }

    function getOrCreateLinkRel(doc, relValue) {
        let el = doc.head.querySelector(`link[rel="${cssEscapeAttr(relValue)}"]`);
        if (!el) {
            el = doc.createElement('link');
            el.setAttribute('rel', relValue);
            doc.head.appendChild(el);
        }
        return el;
    }

    function getOrCreateCharset(doc) {
        let el = doc.head.querySelector('meta[charset]');
        if (!el) {
            el = doc.createElement('meta');
            el.setAttribute('charset', 'UTF-8');
            doc.head.insertBefore(el, doc.head.firstChild);
        }
        return el;
    }

    function headToString(doc) {
        return doc.head.innerHTML;
    }

    function replaceHeadInHtml(originalHtml, newHeadInnerHtml) {
        const re = /<head\b[^>]*>[\s\S]*?<\/head>/i;
        if (!re.test(originalHtml)) {
            return originalHtml.replace(
                /<html\b[^>]*>/i,
                (m) => `${m}\n<head>\n${newHeadInnerHtml}\n</head>`
            );
        }
        return originalHtml.replace(re, (m) => {
            const open = m.match(/<head\b[^>]*>/i)?.[0] || '<head>';
            return `${open}\n${newHeadInnerHtml}\n</head>`;
        });
    }

    function extractSeo(doc) {
        const data = {};
        data.title = doc.title || '';

        const metaByName = (name) =>
            doc.head.querySelector(`meta[name="${cssEscapeAttr(name)}"]`)?.getAttribute('content') || '';
        const metaByProp = (prop) =>
            doc.head.querySelector(`meta[property="${cssEscapeAttr(prop)}"]`)?.getAttribute('content') || '';

        data.description = metaByName('description');
        data.keywords = metaByName('keywords');
        data.robots = metaByName('robots');
        data.viewport = metaByName('viewport');

        data.charset = doc.head.querySelector('meta[charset]')?.getAttribute('charset') || '';
        data.canonical = doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

        data.og = {};
        OG_FIELDS.forEach((k) => (data.og[k] = metaByProp(k)));

        data.twitter = {};
        TW_FIELDS.forEach((k) => (data.twitter[k] = metaByName(k)));

        data.dc = {};
        DC_FIELDS.forEach((k) => (data.dc[k] = metaByName(k)));

        return data;
    }

    function applySeo(doc, data) {
        doc.title = data.title || '';

        const setMetaName = (name, value) => {
            const el = getOrCreateMeta(doc, 'name', name);
            if (value) el.setAttribute('content', value);
            else el.removeAttribute('content');
        };

        const setMetaProp = (prop, value) => {
            const el = getOrCreateMeta(doc, 'property', prop);
            if (value) el.setAttribute('content', value);
            else el.removeAttribute('content');
        };

        setMetaName('description', data.description || '');
        setMetaName('keywords', data.keywords || '');
        setMetaName('robots', data.robots || '');
        setMetaName('viewport', data.viewport || '');

        const charsetEl = getOrCreateCharset(doc);
        charsetEl.setAttribute('charset', data.charset || 'UTF-8');

        const link = getOrCreateLinkRel(doc, 'canonical');
        if (data.canonical) link.setAttribute('href', data.canonical);
        else link.removeAttribute('href');

        OG_FIELDS.forEach((k) => setMetaProp(k, (data.og && data.og[k]) || ''));
        TW_FIELDS.forEach((k) => setMetaName(k, (data.twitter && data.twitter[k]) || ''));
        DC_FIELDS.forEach((k) => setMetaName(k, (data.dc && data.dc[k]) || ''));
    }

    // -----------------------------
    // UI: field templates
    // -----------------------------
    function fieldTpl({ id, label, type, value, placeholder, limit, hint }) {
        const hasLimit = Number.isFinite(limit) && limit > 0;

        const counter = hasLimit
            ? `<div class="mt-1 text-[11px] flex justify-between">
           <span class="text-slate-500 dark:text-slate-400">${escapeHtml(hint || '')}</span>
           <span class="seo-counter text-slate-500 dark:text-slate-400" data-for="${id}">0/${limit}</span>
         </div>`
            : `<div class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">${escapeHtml(hint || '')}</div>`;

        const commonAttrs = `id="${id}" data-seo="1" ${hasLimit ? `data-limit="${limit}"` : ''}`;

        const cls =
            `w-full p-2 rounded border border-slate-300 bg-white text-slate-900 text-sm
       focus:outline-none focus:ring-1 focus:border-indigo-500
       dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100
       dark:focus:border-indigo-400`;

        if (type === 'textarea') {
            return `
        <div class="mb-4">
          <label class="block text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">${escapeHtml(label)}</label>
          <textarea ${commonAttrs}
            class="${cls} min-h-[90px]"
            placeholder="${escapeAttr(placeholder || '')}">${escapeHtml(value || '')}</textarea>
          ${counter}
        </div>
      `;
        }

        return `
      <div class="mb-4">
        <label class="block text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">${escapeHtml(label)}</label>
        <input ${commonAttrs}
          type="text"
          class="${cls}"
          placeholder="${escapeAttr(placeholder || '')}"
          value="${escapeAttr(value || '')}" />
        ${counter}
      </div>
    `;
    }

    function sectionTpl(title, inner) {
        return `
      <div class="mb-6">
        <div class="ml-1 text-xs uppercase tracking-wider 
                    font-semibold text-slate-600 dark:text-slate-400 mb-2">${escapeHtml(title)}</div>
        <div class="p-3 rounded-lg bg-white/70 dark:bg-slate-950/40 shadow shadow-gray-300
                    border border-slate-300 dark:border-slate-500">${inner}</div>
      </div>
    `;
    }

    // -----------------------------
    // Counters + dynamic border states
    // -----------------------------
    function clearState(el) {
        el.classList.remove(
            'border-red-400', 'dark:border-red-500',
            'border-amber-400', 'dark:border-amber-500',
            'border-emerald-400', 'dark:border-emerald-500'
        );

        // базовый бордер
        el.classList.add('border-slate-300', 'dark:border-slate-800');
        delete el.dataset.error;
    }

    function setStateOk(el) {
        clearState(el);
        el.classList.remove('border-slate-300', 'dark:border-slate-800');
        el.classList.add('border-emerald-400', 'dark:border-emerald-500');
    }

    function setStateWarn(el, msg) {
        clearState(el);
        el.classList.remove('border-slate-300', 'dark:border-slate-800');
        el.classList.add('border-amber-400', 'dark:border-amber-500');
        el.dataset.error = msg || 'Almost at limit';
    }

    function setStateBad(el, msg) {
        clearState(el);
        el.classList.remove('border-slate-300', 'dark:border-slate-800');
        el.classList.add('border-red-400', 'dark:border-red-500');
        el.dataset.error = msg || 'Too long';
    }

    function updateCounterAndState(el) {
        const limit = Number(el.dataset.limit || 0);
        const counter = document.querySelector(`.seo-counter[data-for="${el.id}"]`);
        const len = (el.value || '').length;

        // --- counter text + color ---
        if (limit && counter) {
            counter.textContent = `${len}/${limit}`;

            counter.classList.remove(
                'text-slate-500',
                'text-amber-600',
                'text-red-600',
                'dark:text-amber-400',
                'dark:text-red-400'
            );

            if (len === 0) counter.classList.add('text-slate-500');
            else if (len > limit) counter.classList.add('text-red-600', 'dark:text-red-400');
            else if (len >= Math.floor(limit * 0.8)) counter.classList.add('text-amber-600', 'dark:text-amber-400');
            else counter.classList.add('text-slate-500');
        }

        // --- state (border) ---
        // ✅ пустое — нейтрально (серый)
        if (len === 0) {
            clearState(el);
            return;
        }

        // если лимита нет — нейтрально
        if (!limit) {
            clearState(el);
            return;
        }

        if (len > limit) {
            setStateBad(el, `Слишком длинно: ${len}/${limit}`);
            return;
        }

        if (len >= Math.floor(limit * 0.8)) {
            setStateWarn(el, `Почти лимит: ${len}/${limit}`);
            return;
        }

        // ✅ заполнено и далеко от лимита — зелёный
        setStateOk(el);
    }

    // -----------------------------
    // Validation (необязательные поля)
    // -----------------------------
    function validateField(el) {
        const v = (el.value || '').trim();

        // если пусто — всегда ок (все поля необязательные)
        if (!v) {
            // пустое поле — нейтрально, но счётчик обновляем
            updateCounterAndState(el);
            delete el.dataset.error;
            return true;
        }

        // canonical URL
        if (el.id === 'seo_canonical') {
            try { new URL(v); } catch { setStateBad(el, 'Некорректный URL'); return false; }
        }

        // robots (очень мягкая проверка)
        if (el.id === 'seo_robots') {
            const ok = /^[a-z,\s-]+$/i.test(v);
            if (!ok) { setStateBad(el, 'Robots: только слова через запятую'); return false; }
        }

        // charset
        if (el.id === 'seo_charset') {
            const ok = /^[A-Za-z0-9._-]+$/.test(v);
            if (!ok) { setStateBad(el, 'Charset выглядит некорректно'); return false; }
        }

        // лимит
        const limit = Number(el.dataset.limit || 0);
        if (limit && v.length > limit) {
            setStateBad(el, `Слишком длинно: ${v.length}/${limit}`);
            return false;
        }

        updateCounterAndState(el);
        return true;
    }

    function bindSeoFormLiveValidation() {
        const inputs = qsa('#seoForm [data-seo="1"]');

        const validateAll = () => inputs.every((el) => validateField(el));

        inputs.forEach((el) => {
            updateCounterAndState(el);
            validateField(el);

            el.addEventListener('input', () => {
                updateCounterAndState(el);
                validateField(el);
            });

            el.addEventListener('focus', () => {
                updateCounterAndState(el);
                validateField(el);
            });
        });

        return { validateAll };
    }

    // -----------------------------
    // Auto-generate
    // -----------------------------
    function genFromDoc(doc) {
        const h1 = doc.body?.querySelector('h1')?.textContent || '';
        const h2 = doc.body?.querySelector('h2')?.textContent || '';
        const mainTitle = stripText(h1 || h2 || doc.title || '');

        const bodyText = stripText(doc.body?.textContent || '');
        const desc = bodyText.slice(0, LIMITS.description || 160);

        return { mainTitle, desc };
    }

    // -----------------------------
    // Build form
    // -----------------------------
    function buildForm(data) {
        let html = '';

        const baseInputs = BASE_FIELDS.map((f) =>
            fieldTpl({
                id: `seo_${f.key}`,
                label: f.label,
                type: f.type,
                value: data[f.key] || '',
                placeholder: f.placeholder || '',
                limit: LIMITS[f.key],
                hint: f.hint || '',
            })
        ).join('');

        html += sectionTpl('Base SEO', baseInputs);

        const ogInputs = OG_FIELDS.map((k) =>
            fieldTpl({
                id: `seo_og_${safeId(k)}`,
                label: k,
                type: 'text',
                value: (data.og && data.og[k]) || '',
                placeholder: '',
                limit: LIMITS[k],
            })
        ).join('');
        html += sectionTpl('Open Graph', ogInputs);

        const twInputs = TW_FIELDS.map((k) =>
            fieldTpl({
                id: `seo_tw_${safeId(k)}`,
                label: k,
                type: 'text',
                value: (data.twitter && data.twitter[k]) || '',
                placeholder: '',
                limit: LIMITS[k],
            })
        ).join('');
        html += sectionTpl('Twitter', twInputs);

        const dcInputs = DC_FIELDS.map((k) =>
            fieldTpl({
                id: `seo_dc_${safeId(k)}`,
                label: k,
                type: 'text',
                value: (data.dc && data.dc[k]) || '',
                placeholder: '',
                limit: LIMITS[k],
            })
        ).join('');
        html += sectionTpl('Dublin Core', dcInputs);

        html += `
      <div class="flex flex-wrap items-center gap-2">
        <button id="seoAuto"
          class="bg-teal-600 hover:bg-teal-800 text-white text-xs px-3 py-1.5 rounded 
                 flex items-center justify-center gap-2">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
            <path class="fill-current text-slate-100" 
            d="M23.625,5.219l-5-4A1,1,0,0,0,17,2V5H4A3,3,0,0,0,1,8v3a1,1,0,0,0,2,0V8A1,1,0,0,1,4,7H17v3a1,1,0,0,0,1.625.781l5-4a1,1,0,0,0,0-1.562Z"></path>
            <path class="fill-current text-slate-100" 
            d="M22,12a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H7V14a1,1,0,0,0-1.625-.781l-5,4a1,1,0,0,0,0,1.562l5,4A1,1,0,0,0,7,22V19H20a3,3,0,0,0,3-3V13A1,1,0,0,0,22,12Z"></path>
          </svg>
          <span>Авто-генерация</span>
        </button>

        <button id="seoSave"
          class="bg-indigo-500 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded
                 flex items-center justify-center gap-2">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
            <path class="fill-current text-slate-100" 
            d="M22.707,6.707,17.293,1.293A1,1,0,0,0,16.586,1H4A3,3,0,0,0,1,4V20a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V7.414A1,1,0,0,0,22.707,6.707ZM14.5,4h1a.5.5,0,0,1,.5.5v4a.5.5,0,0,1-.5.5h-1a.5.5,0,0,1-.5-.5v-4A.5.5,0,0,1,14.5,4ZM19,12.5v6a.5.5,0,0,1-.5.5H5.5a.5.5,0,0,1-.5-.5v-6a.5.5,0,0,1,.5-.5h13A.5.5,0,0,1,19,12.5Z"></path>
           </svg>
          <span>Сохранить SEO</span>
        </button>

        <button id="seoBack"
          class="border border-slate-400 dark:border-slate-300 text-xs px-3 py-1.5 rounded
                 bg-slate-100 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-900
                 flex items-center justify-center gap-2">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
            <path class="fill-current text-slate-500" 
            d="M22,1H14a1,1,0,0,0-.707,1.707L16.586,6l-6.293,6.293a1,1,0,1,0,1.414,1.414L18,7.414l3.293,3.293A1,1,0,0,0,22,11a.987.987,0,0,0,.383-.076A1,1,0,0,0,23,10V2A1,1,0,0,0,22,1Z"></path>
            <path class="fill-current text-slate-500" 
            d="M4,23H18a3,3,0,0,0,3-3V15a1,1,0,0,0-2,0v5a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V6A1,1,0,0,1,4,5H9A1,1,0,0,0,9,3H4A3,3,0,0,0,1,6V20A3,3,0,0,0,4,23Z"></path>
          </svg>
          <span>Назад</span>
        </button>

        <span class="text-[11px] text-slate-500 dark:text-slate-400 ml-auto">
          * Все поля необязательные
        </span>
      </div>
    `;

        return html;
    }

    function readFormToData(originalData) {
        const data = JSON.parse(JSON.stringify(originalData || {}));

        BASE_FIELDS.forEach((f) => {
            const el = qs(`#seo_${f.key}`);
            data[f.key] = el ? el.value : (data[f.key] || '');
        });

        data.og = data.og || {};
        OG_FIELDS.forEach((k) => {
            const el = qs(`#seo_og_${safeId(k)}`);
            data.og[k] = el ? el.value : (data.og[k] || '');
        });

        data.twitter = data.twitter || {};
        TW_FIELDS.forEach((k) => {
            const el = qs(`#seo_tw_${safeId(k)}`);
            data.twitter[k] = el ? el.value : (data.twitter[k] || '');
        });

        data.dc = data.dc || {};
        DC_FIELDS.forEach((k) => {
            const el = qs(`#seo_dc_${safeId(k)}`);
            data.dc[k] = el ? el.value : (data.dc[k] || '');
        });

        return data;
    }

    // -----------------------------
    // Open SEO for file
    // -----------------------------
    Seo.open = async function (path) {
        const lower = (path || '').toLowerCase();
        if (!lower.endsWith('.html') && !lower.endsWith('.htm')) {
            Admin.Toast.warn('SEO-редактор сейчас работает только для HTML файлов.');
            return;
        }

        const json = await fetchJson(apiUrl(`read.php?path=${encodeURIComponent(path)}`));
        if (!json.ok) throw new Error(json.error || 'Read failed');

        const html = json.content || '';
        const doc = parseHtml(html);
        const data = extractSeo(doc);

        const box = qs('#seoForm');
        if (!box) return;

        box.innerHTML = `
      <div class="mb-3 text-center text-xs text-slate-700 dark:text-slate-300">
        Editing SEO for: <span class="font-semibold">${escapeHtml(path)}</span>
      </div>
      ${buildForm(data)}
    `;

        const live = bindSeoFormLiveValidation();

        const btnSave = qs('#seoSave');
        const btnBack = qs('#seoBack');
        const btnAuto = qs('#seoAuto');

        if (btnBack) btnBack.addEventListener('click', () => Seo.setMode('editor'));

        if (btnAuto) {
            btnAuto.addEventListener('click', () => {
                const generated = genFromDoc(doc);

                const titleEl = qs('#seo_title');
                const descEl = qs('#seo_description');
                const kwEl = qs('#seo_keywords');

                if (titleEl && !titleEl.value.trim()) {
                    titleEl.value = (generated.mainTitle || '').slice(0, LIMITS.title || 60);
                }
                if (descEl && !descEl.value.trim()) {
                    descEl.value = (generated.desc || '').slice(0, LIMITS.description || 160);
                }

                // OG/Twitter из Base (если пустые)
                const ogTitle = qs(`#seo_og_${safeId('og:title')}`);
                const ogDesc = qs(`#seo_og_${safeId('og:description')}`);
                const twTitle = qs(`#seo_tw_${safeId('twitter:title')}`);
                const twDesc = qs(`#seo_tw_${safeId('twitter:description')}`);

                if (ogTitle && !ogTitle.value.trim() && titleEl) ogTitle.value = titleEl.value;
                if (ogDesc && !ogDesc.value.trim() && descEl) ogDesc.value = descEl.value;
                if (twTitle && !twTitle.value.trim() && titleEl) twTitle.value = titleEl.value;
                if (twDesc && !twDesc.value.trim() && descEl) twDesc.value = descEl.value;

                // Dublin Core из Base (если пустые)
                const dcTitle = qs(`#seo_dc_${safeId('DC.title')}`);
                const dcDesc = qs(`#seo_dc_${safeId('DC.description')}`);
                const dcSubj = qs(`#seo_dc_${safeId('DC.subject')}`);
                const dcLang = qs(`#seo_dc_${safeId('DC.language')}`);

                if (dcTitle && !dcTitle.value.trim() && titleEl) dcTitle.value = titleEl.value;
                if (dcDesc && !dcDesc.value.trim() && descEl) dcDesc.value = descEl.value;

                if (dcSubj && !dcSubj.value.trim() && kwEl && kwEl.value.trim()) {
                    dcSubj.value = kwEl.value.trim().slice(0, LIMITS['DC.subject'] || 255);
                }

                const docLang = doc.documentElement?.getAttribute('lang') || 'ru';
                if (dcLang && !dcLang.value.trim()) dcLang.value = docLang;

                // обновим все счётчики/валидацию
                qsa('#seoForm [data-seo="1"]').forEach((el) => {
                    updateCounterAndState(el);
                    validateField(el);
                });
            });
        }

        if (btnSave) {
            btnSave.addEventListener('click', async () => {
                if (!live.validateAll()) {
                    Admin.Toast.warn('Есть ошибки в SEO-полях. Проверь подсвеченные поля.');
                    return;
                }

                const nextData = readFormToData(data);
                applySeo(doc, nextData);

                const newHtml = replaceHeadInHtml(html, headToString(doc));

                const save = await fetchJson(apiUrl('write.php'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path, content: newHtml }),
                });

                if (!save.ok) {
                    Admin.Toast.error(save.error || 'Ошибка сохранения');
                    return;
                }

                // синхронизируем редактор, если открыт тот же файл
                if (State.currentPath === path) {
                    const editor = qs('#editor');
                    if (editor) {
                        editor.value = newHtml;
                        State.original = newHtml;
                        State.dirty = false;
                    }
                }

                Preview.reload();
                Admin.Toast.success('SEO сохранено');
            });
        }
    };

    // -----------------------------
    // Sidebar nav
    // -----------------------------
    function makeSeoNavItem(path) {
        const li = document.createElement('li');

        li.className =
            'px-2 py-1.5 rounded-md cursor-pointer text-sm ' +
            'bg-slate-200 hover:bg-slate-300 text-slate-700 ' +
            'dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200';

        li.textContent = `SEO: ${path}`;

        li.addEventListener('click', async () => {
            if (State.dirty) {
                const ok = confirm('Есть несохранённые изменения в редакторе. Переключиться на SEO?');
                if (!ok) return;
            }

            try { await window.Admin.Files.open(path); } catch {}
            await Seo.open(path);
            Seo.setMode('seo');
        });

        return li;
    }

    async function loadRootHtmlPages() {
        const box = qs('#seoPages');
        if (!box) return;
        box.innerHTML = '';

        try {
            const json = await fetchJson(apiUrl(`list.php?dir=${encodeURIComponent('')}`));
            if (json.ok && Array.isArray(json.files)) {
                const pages = json.files
                    .map((f) => f.path || f.name || '')
                    .filter(Boolean)
                    .filter((p) => /\.(html?|HTML?)$/.test(p));

                (pages.length ? pages : ['index.html']).forEach((p) => box.appendChild(makeSeoNavItem(p)));
                return;
            }
        } catch (e) {}

        box.appendChild(makeSeoNavItem('index.html'));
    }

    // -----------------------------
    // Init
    // -----------------------------
    Seo.init = function () {
        bindModeButtons();
        Seo.setMode('editor');
        loadRootHtmlPages();
    };

    window.Admin.Seo = Seo;
})();
