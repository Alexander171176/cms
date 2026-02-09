/** -----------------------------------------------------------
 * Gallery Mode (all images in project tree)
 * ---------------------------------------------------------- */

// какие расширения считаем изображениями
Files.IMAGE_EXTS = new Set(['png','jpg','jpeg','gif','webp','svg','bmp','ico']);

// какие расширения считаем шрифтами
Files.FONT_EXTS = new Set(['woff2','woff','ttf','otf','eot']);

// какие расширения считаем видео
Files.VIDEO_EXTS = new Set(['mp4','webm','ogg','mov','avi','mkv']);

/** ----------------------------------------------------------- */
// собираем пути шрифтов из дерева
Files.collectFontsFromTree = function (tree) {
    const files = Files.collectFilesFromTree(tree, []);
    return files
        .filter((p) => Files.FONT_EXTS.has(Files.getExt(p)))
        .sort((a,b) => a.localeCompare(b));
};

Files.fontFamilyFromPath = function (path) {
    const safe = String(path || '').replace(/[^a-z0-9]+/gi, '_');
    return `font_${safe}`;
};

// загрузка шрифта через FontFace API
Files.loadFontFace = async function (path) {
    const family = Files.fontFamilyFromPath(path);

    // кэш: чтобы не грузить повторно
    Files._fontCache = Files._fontCache || new Map();
    if (Files._fontCache.has(path)) return { family, ok: true };

    const url = Files.publicUrl(path);

    try {
        // FontFace сам загрузит URL (если доступен публично)
        const ff = new FontFace(family, `url("${url}")`);
        await ff.load();
        document.fonts.add(ff);

        Files._fontCache.set(path, true);
        return { family, ok: true };
    } catch (e) {
        return { family, ok: false, error: (e && e.message) ? e.message : 'load failed' };
    }
};

/** ----------------------------------------------------------- */
// путь -> публичный URL для <img>
Files.publicUrl = function (path) {
    const base = (window.Admin?.Core?.publicBase ?? '/');
    const b = base.endsWith('/') ? base.slice(0, -1) : base;
    const p = String(path || '').replace(/^\/+/, '');
    return `${b}/${encodeURI(p)}`;
};

// рекурсивно вытаскиваем файлы из tree.php
Files.collectFilesFromTree = function (nodes, out = []) {
    (nodes || []).forEach((n) => {
        if (!n) return;
        if (n.type === 'file' && n.path) out.push(n.path);
        if (n.type === 'dir' && Array.isArray(n.children)) Files.collectFilesFromTree(n.children, out);
    });
    return out;
};

Files.collectImagesFromTree = function (tree) {
    const files = Files.collectFilesFromTree(tree, []);
    return files
        .filter((p) => Files.IMAGE_EXTS.has(Files.getExt(p)))
        .sort((a,b) => a.localeCompare(b));
};

/** ----------------------------------------------------------- */
Files.collectVideosFromTree = function (tree) {
    const files = Files.collectFilesFromTree(tree, []);
    return files
        .filter((p) => Files.VIDEO_EXTS.has(Files.getExt(p)))
        .sort((a,b) => a.localeCompare(b));
};

/** ----------------------------------------------------------- */
// контейнер центральной области, куда рисуем галерею
Files.getMainPanel = function () {
    // поменяй на свой контейнер, если нужно
    return qs('#mainPanel') || qs('#centerPanel') || qs('#workspace') || qs('#content') || document.body;
};

// переключение UI: показать галерею / вернуть редактор
Files.showGallery = function () {
    const panel = Files.getMainPanel();
    if (!panel) return;

    // прячем редактор/код, если есть такие блоки
    const editorWrap = qs('#editorWrap') || qs('#editorPanel') || qs('#codePanel');
    if (editorWrap) editorWrap.classList.add('hidden');

    // создаём контейнер галереи один раз
    let wrap = qs('#imagesGallery');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'imagesGallery';
        wrap.className = 'p-4';
        panel.prepend(wrap);
    } else {
        wrap.classList.remove('hidden');
    }

    Files.renderGalleryInto(wrap);
};

Files.hideGallery = function () {
    const wrap = qs('#imagesGallery');
    if (wrap) wrap.classList.add('hidden');

    const editorWrap = qs('#editorWrap') || qs('#editorPanel') || qs('#codePanel');
    if (editorWrap) editorWrap.classList.remove('hidden');
};

// рисуем галерею
Files.renderGalleryInto = async function (wrap) {
    wrap.innerHTML = `
    <div class="flex items-center justify-between gap-3 mb-3">
      <div class="text-sm text-indigo-600 dark:text-indigo-200">
        <span class="font-medium">Галерея изображений</span>
        <span id="galleryCount" class="ml-2 text-amber-600 dark:text-amber-200"></span>
      </div>
      <div class="flex items-center gap-2">
        <button id="galleryRefresh" type="button" title="Обновить"
          class="px-1.5 py-1.5 rounded border border-slate-400 dark:border-slate-200
                 bg-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700
                 flex items-center justify-center">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
            <path class="fill-current text-amber-600 dark:text-amber-300" d="M23.625,5.219l-5-4A1,1,0,0,0,17,2V5H4A3,3,0,0,0,1,8v3a1,1,0,0,0,2,0V8A1,1,0,0,1,4,7H17v3a1,1,0,0,0,1.625.781l5-4a1,1,0,0,0,0-1.562Z"></path>
            <path class="fill-current text-amber-600 dark:text-amber-300" d="M22,12a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H7V14a1,1,0,0,0-1.625-.781l-5,4a1,1,0,0,0,0,1.562l5,4A1,1,0,0,0,7,22V19H20a3,3,0,0,0,3-3V13A1,1,0,0,0,22,12Z"></path>
          </svg>
        </button>
        <button id="galleryClose" type="button" title="Закрыть"
          class="px-1.5 py-1.5 rounded border border-slate-400 dark:border-slate-200
                 bg-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700
                 flex items-center justify-center">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
           <path class="fill-current text-gray-700 dark:text-gray-300" 
                d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="mb-3 flex items-center gap-2">
      <input id="galleryFilter" type="text" placeholder="Фильтр по пути/имени..."
        class="w-full px-3 py-2 rounded border border-slate-400 dark:border-slate-200
               bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm" />
    </div>

    <div id="galleryGrid"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      <div class="text-sm text-slate-500">Загрузка...</div>
    </div>
      `;

    const btnClose = qs('#galleryClose');
    const btnRefresh = qs('#galleryRefresh');
    if (btnClose) btnClose.addEventListener('click', Files.hideGallery);
    if (btnRefresh) btnRefresh.addEventListener('click', () => Files.renderGalleryInto(wrap));

    // получаем дерево
    const json = await fetchJson(apiUrl('tree.php'));
    if (!json?.ok || !Array.isArray(json.tree)) {
        qs('#galleryGrid').innerHTML = `<div class="text-sm text-red-500">Не удалось загрузить дерево проекта</div>`;
        return;
    }

    const images = Files.collectImagesFromTree(json.tree);
    const countEl = qs('#galleryCount');
    if (countEl) countEl.textContent = `(${images.length})`;

    const grid = qs('#galleryGrid');
    if (!images.length) {
        grid.innerHTML = `<div class="text-sm text-slate-500">В проекте нет изображений.</div>`;
        return;
    }
    const renderCards = (list) => {
        grid.innerHTML = '';

        list.forEach((path) => {
            const card = document.createElement('div');
            card.className =
                'group border rounded-lg overflow-hidden bg-white dark:bg-slate-800 ' +
                'border-slate-400 dark:border-slate-300 hover:shadow';

            const meta = document.createElement('div');
            meta.className = 'p-3 border-b border-slate-400 dark:border-slate-300 text-xs';

            const pathRow = document.createElement('div');
            pathRow.className = 'flex flex-col items-center gap-2';

            const pathText = document.createElement('div');
            pathText.className = 'flex-1 word-break font-semibold text-xs text-slate-700 dark:text-slate-200';
            pathText.title = path;
            pathText.textContent = path;

            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className =
                'shrink-0 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 ' +
                'border border-gray-400 text-white font-semibold';
            copyBtn.textContent = 'Скопировать путь';
            copyBtn.title = 'Скопировать путь';
            copyBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    await navigator.clipboard.writeText(path);
                    window.Admin?.Toast?.success?.('Путь скопирован');
                } catch {
                    prompt('Скопируй путь:', path);
                }
            });

            pathRow.appendChild(pathText);
            pathRow.appendChild(copyBtn);
            meta.appendChild(pathRow);

            const thumb = document.createElement('div');
            thumb.className = 'aspect-square bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden';

            const img = document.createElement('img');
            img.className = 'w-full h-full object-contain';
            img.loading = 'lazy';
            img.alt = path;
            img.src = Files.publicUrl(path);

            img.onerror = () => {
                thumb.innerHTML = `<div class="text-xs text-slate-500 p-2 text-center">Не удалось загрузить</div>`;
            };

            thumb.appendChild(img);

            card.appendChild(meta);
            card.appendChild(thumb);

            card.addEventListener('click', async () => {
                if (State.dirty) {
                    const ok = confirm('Есть несохранённые изменения. Переключиться?');
                    if (!ok) return;
                }
                await Files.open(path);
                Files.setActive(path);
            });

            grid.appendChild(card);
        });
    };

    // первичный рендер
    renderCards(images);

    // фильтр
    Files.attachClearableFilter('#galleryFilter', () => {
        const input = qs('#galleryFilter');
        const q = String(input?.value || '').trim().toLowerCase();
        const filtered = !q ? images : images.filter((p) => p.toLowerCase().includes(q));

        renderCards(filtered);

        const countEl = qs('#galleryCount');
        if (countEl) countEl.textContent = `(${filtered.length})`;
    });

};

/** ----------------------------------------------------------- */
Files.showFonts = function () {
    const panel = Files.getMainPanel();
    if (!panel) return;

    const editorWrap = qs('#editorWrap') || qs('#editorPanel') || qs('#codePanel');
    if (editorWrap) editorWrap.classList.add('hidden');

    // прячем галерею картинок (если открыта)
    const imgWrap = qs('#imagesGallery');
    if (imgWrap) imgWrap.classList.add('hidden');

    let wrap = qs('#fontsGallery');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'fontsGallery';
        wrap.className = 'p-4';
        panel.prepend(wrap);
    } else {
        wrap.classList.remove('hidden');
    }

    Files.renderFontsInto(wrap);
};

Files.hideFonts = function () {
    const wrap = qs('#fontsGallery');
    if (wrap) wrap.classList.add('hidden');

    const editorWrap = qs('#editorWrap') || qs('#editorPanel') || qs('#codePanel');
    if (editorWrap) editorWrap.classList.remove('hidden');
};

Files.renderFontsInto = async function (wrap) {
    wrap.innerHTML = `
    <div class="flex items-center justify-between gap-3 mb-3">
      <div class="text-sm text-indigo-600 dark:text-indigo-200">
        <span class="font-medium">Галерея шрифтов</span>
        <span id="fontsCount" class="ml-2 text-amber-600 dark:text-amber-200"></span>
      </div>
      <div class="flex items-center gap-2">
        <button id="fontsRefresh" type="button" title="Обновить"
          class="px-1.5 py-1.5 rounded border border-slate-400 dark:border-slate-200
                 bg-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
            <path class="fill-current text-amber-600 dark:text-amber-300" d="M23.625,5.219l-5-4A1,1,0,0,0,17,2V5H4A3,3,0,0,0,1,8v3a1,1,0,0,0,2,0V8A1,1,0,0,1,4,7H17v3a1,1,0,0,0,1.625.781l5-4a1,1,0,0,0,0-1.562Z"></path>
            <path class="fill-current text-amber-600 dark:text-amber-300" d="M22,12a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H7V14a1,1,0,0,0-1.625-.781l-5,4a1,1,0,0,0,0,1.562l5,4A1,1,0,0,0,7,22V19H20a3,3,0,0,0,3-3V13A1,1,0,0,0,22,12Z"></path>
          </svg>
        </button>
        <button id="fontsClose" type="button" title="Закрыть"
          class="px-1.5 py-1.5 rounded border border-slate-400 dark:border-slate-200
                 bg-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
           <path class="fill-current text-gray-700 dark:text-gray-300" d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="mb-3 flex items-center gap-2">
      <input id="fontsFilter" type="text" placeholder="Фильтр по пути/имени..."
        class="w-full px-3 py-2 rounded border border-slate-400 dark:border-slate-200
               bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm" />
    </div>

    <div id="fontsGrid" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      <div class="text-sm text-slate-500">Загрузка...</div>
    </div>
  `;

    qs('#fontsClose')?.addEventListener('click', Files.hideFonts);
    qs('#fontsRefresh')?.addEventListener('click', () => Files.renderFontsInto(wrap));

    const json = await fetchJson(apiUrl('tree.php'));
    if (!json?.ok || !Array.isArray(json.tree)) {
        qs('#fontsGrid').innerHTML = `<div class="text-sm text-red-500">Не удалось загрузить дерево проекта</div>`;
        return;
    }

    const fonts = Files.collectFontsFromTree(json.tree);
    qs('#fontsCount').textContent = `(${fonts.length})`;

    const grid = qs('#fontsGrid');
    if (!fonts.length) {
        grid.innerHTML = `<div class="text-sm text-slate-500">В проекте нет шрифтов (.woff2/.woff/.ttf/.otf).</div>`;
        return;
    }

    // тексты для “полного алфавита”
    const SAMPLE_RU_UP = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
    const SAMPLE_RU_LO = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const SAMPLE_KZ    = 'Ә ә Ғ ғ Қ қ Ң ң Ө ө Ұ ұ Ү ү Һ һ І і';
    const SAMPLE_EN    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ / abcdefghijklmnopqrstuvwxyz';
    const SAMPLE_NUM   = '0123456789';
    const SAMPLE_SYM   = '.,:;!?—–()[]{}<>@#$%^&*+=/\\\"\'';

    // рендер карточек с фильтром
    const renderCards = async (list) => {
        grid.innerHTML = '';
        for (const path of list) {
            const card = document.createElement('div');
            card.className =
                'border rounded-lg overflow-hidden bg-white dark:bg-slate-800 ' +
                'border-slate-400 dark:border-slate-300 hover:shadow';

            const head = document.createElement('div');
            head.className = 'p-3 border-b border-slate-400 dark:border-slate-300';

            const title = document.createElement('div');
            title.className = 'text-center text-xs font-semibold text-slate-700 dark:text-slate-200 break-all';
            title.textContent = path;

            const btnRow = document.createElement('div');
            btnRow.className = 'mt-2 flex items-center justify-center gap-2';

            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className =
                'px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 ' +
                'border border-gray-400 text-white text-xs font-semibold';
            copyBtn.textContent = 'Скопировать путь';
            copyBtn.addEventListener('click', async (e) => {
                e.preventDefault(); e.stopPropagation();
                try { await navigator.clipboard.writeText(path); window.Admin?.Toast?.success?.('Путь скопирован'); }
                catch { prompt('Скопируй путь:', path); }
            });

            btnRow.appendChild(copyBtn);

            head.appendChild(title);
            head.appendChild(btnRow);

            const body = document.createElement('div');
            body.className = 'p-3';

            // грузим шрифт
            const res = await Files.loadFontFace(path);

            const info = document.createElement('div');
            info.className = 'font-semibold text-center text-xs mb-2 '
                + (res.ok ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300');
            info.textContent = res.ok ? 'Шрифт загружен'
                : 'Не удалось загрузить (возможно, файл не доступен по публичному URL)';

            const sample = document.createElement('div');
            sample.className = 'space-y-2';

            const mkLine = (txt) => {
                const d = document.createElement('div');
                d.className = 'text-xl text-slate-800 dark:text-slate-100 break-words';
                if (res.ok) d.style.fontFamily = res.family;
                d.textContent = txt;
                return d;
            };

            sample.appendChild(mkLine(SAMPLE_RU_UP));
            sample.appendChild(mkLine(SAMPLE_RU_LO));
            sample.appendChild(mkLine(SAMPLE_KZ));
            sample.appendChild(mkLine(SAMPLE_EN));
            sample.appendChild(mkLine(SAMPLE_NUM));
            sample.appendChild(mkLine(SAMPLE_SYM));

            body.appendChild(info);
            body.appendChild(sample);

            card.appendChild(head);
            card.appendChild(body);

            grid.appendChild(card);
        }
    };

    await renderCards(fonts);

    Files.attachClearableFilter('#fontsFilter', async () => {
        const filter = qs('#fontsFilter');
        const q = String(filter?.value || '').trim().toLowerCase();
        const filtered = !q ? fonts : fonts.filter(p => p.toLowerCase().includes(q));
        await renderCards(filtered);
        qs('#fontsCount').textContent = `(${filtered.length})`;
    });
};

/** ----------------------------------------------------------- */
// добавляем кнопку в нижнюю часть сайдбара

Files.showVideos = function () {
    const panel = Files.getMainPanel();
    if (!panel) return;

    const editorWrap = qs('#editorWrap') || qs('#editorPanel') || qs('#codePanel');
    if (editorWrap) editorWrap.classList.add('hidden');

    // прячем другие галереи
    qs('#imagesGallery')?.classList.add('hidden');
    qs('#fontsGallery')?.classList.add('hidden');

    let wrap = qs('#videosGallery');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'videosGallery';
        wrap.className = 'p-4';
        panel.prepend(wrap);
    } else {
        wrap.classList.remove('hidden');
    }

    Files.renderVideosInto(wrap);
};

Files.hideVideos = function () {
    qs('#videosGallery')?.classList.add('hidden');
    const editorWrap = qs('#editorWrap') || qs('#editorPanel') || qs('#codePanel');
    if (editorWrap) editorWrap.classList.remove('hidden');
};

Files.renderVideosInto = async function (wrap) {
    wrap.innerHTML = `
    <div class="flex items-center justify-between gap-3 mb-3">
      <div class="text-sm text-indigo-600 dark:text-indigo-200">
        <span class="font-medium">Галерея видео</span>
        <span id="videosCount" class="ml-2 text-amber-600 dark:text-amber-200"></span>
      </div>
      <div class="flex items-center gap-2">
        <button id="videosRefresh" type="button" title="Обновить"
          class="px-1.5 py-1.5 rounded border border-slate-400 dark:border-slate-200
                 bg-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700
                 flex items-center justify-center">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
            <path class="fill-current text-amber-600 dark:text-amber-300" d="M23.625,5.219l-5-4A1,1,0,0,0,17,2V5H4A3,3,0,0,0,1,8v3a1,1,0,0,0,2,0V8A1,1,0,0,1,4,7H17v3a1,1,0,0,0,1.625.781l5-4a1,1,0,0,0,0-1.562Z"></path>
            <path class="fill-current text-amber-600 dark:text-amber-300" d="M22,12a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H7V14a1,1,0,0,0-1.625-.781l-5,4a1,1,0,0,0,0,1.562l5,4A1,1,0,0,0,7,22V19H20a3,3,0,0,0,3-3V13A1,1,0,0,0,22,12Z"></path>
          </svg>
        </button>
        <button id="videosClose" type="button" title="Закрыть"
          class="px-1.5 py-1.5 rounded border border-slate-400 dark:border-slate-200
                 bg-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700
                 flex items-center justify-center">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
           <path class="fill-current text-gray-700 dark:text-gray-300" 
                d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="mb-3 flex items-center gap-2">
      <input id="videosFilter" type="text" placeholder="Фильтр по пути/имени..."
        class="w-full px-3 py-2 rounded border border-slate-400 dark:border-slate-200
               bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm" />
    </div>

    <div id="videosGrid"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div class="text-sm text-slate-500">Загрузка...</div>
    </div>
    `;

    qs('#videosClose')?.addEventListener('click', Files.hideVideos);
    qs('#videosRefresh')?.addEventListener('click', () => Files.renderVideosInto(wrap));

    const json = await fetchJson(apiUrl('tree.php'));
    if (!json?.ok || !Array.isArray(json.tree)) {
        qs('#videosGrid').innerHTML = `<div class="text-sm text-red-500">Не удалось загрузить дерево проекта</div>`;
        return;
    }

    const videos = Files.collectVideosFromTree(json.tree);
    qs('#videosCount').textContent = `(${videos.length})`;

    const grid = qs('#videosGrid');
    if (!videos.length) {
        grid.innerHTML = `<div class="text-sm text-slate-500">В проекте нет видео файлов.</div>`;
        return;
    }

    const renderCards = (list) => {
        grid.innerHTML = '';
        list.forEach((path) => {
            const url = Files.publicUrl(path);

            const card = document.createElement('div');
            card.className =
                'border rounded-lg overflow-hidden bg-white dark:bg-slate-800 ' +
                'border-slate-400 dark:border-slate-300 hover:shadow';

            const meta = document.createElement('div');
            meta.className = 'p-3 border-b border-slate-400 dark:border-slate-300 text-xs';

            const title = document.createElement('div');
            title.className = 'font-semibold text-xs text-slate-700 dark:text-slate-200 break-all text-center';
            title.textContent = path;

            const btnRow = document.createElement('div');
            btnRow.className = 'mt-2 flex items-center justify-center gap-2 flex-wrap';

            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className =
                'px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 ' +
                'border border-gray-400 text-white text-xs font-semibold';
            copyBtn.textContent = 'Скопировать путь';
            copyBtn.addEventListener('click', async (e) => {
                e.preventDefault(); e.stopPropagation();
                try { await navigator.clipboard.writeText(path); window.Admin?.Toast?.success?.('Путь скопирован'); }
                catch { prompt('Скопируй путь:', path); }
            });

            meta.appendChild(title);
            btnRow.appendChild(copyBtn);
            meta.appendChild(btnRow);

            const body = document.createElement('div');
            body.className = 'p-3';

            const player = document.createElement('video');
            player.src = url;
            player.controls = true;
            player.preload = 'metadata';
            player.className = 'w-full rounded-md bg-black';

            player.addEventListener('dblclick', () => requestAnyFullscreen(player));

            const fsBtn = document.createElement('button');
            fsBtn.type = 'button';
            fsBtn.className =
                'mt-2 px-3 py-1.5 rounded border border-slate-400 dark:border-slate-200 ' +
                'bg-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700 ' +
                'text-xs font-semibold';
            fsBtn.textContent = 'На весь экран';
            fsBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); requestAnyFullscreen(player); });

            body.appendChild(player);
            body.appendChild(fsBtn);

            card.appendChild(meta);
            card.appendChild(body);

            // клик по карточке = открыть файл (как в галерее картинок)
            card.addEventListener('click', async () => {
                if (State.dirty) {
                    const ok = confirm('Есть несохранённые изменения. Переключиться?');
                    if (!ok) return;
                }
                await Files.open(path);
                Files.setActive(path);
            });

            grid.appendChild(card);
        });
    };

    renderCards(videos);

    Files.attachClearableFilter('#videosFilter', () => {
        const input = qs('#videosFilter');
        const q = String(input?.value || '').trim().toLowerCase();
        const filtered = !q ? videos : videos.filter((p) => p.toLowerCase().includes(q));
        renderCards(filtered);
        qs('#videosCount').textContent = `(${filtered.length})`;
    });
};

/** ----------------------------------------------------------- */
function requestAnyFullscreen(el) {
    try {
        if (el.requestFullscreen) return el.requestFullscreen();
        if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
        if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
        if (el.msRequestFullscreen) return el.msRequestFullscreen();
    } catch (e) {}
}

Files.mountGalleryButton = function () {
    const host = qs('#sidebarBottom') || qs('#sidebarFooter') || qs('#sidebar') || null;
    if (!host) return;

    // чтобы не продублировать
    if (qs('#btnGallery')) return;

    const btn = document.createElement('button');
    btn.id = 'btnGallery';
    btn.type = 'button';
    btn.className =
        'w-full mt-2 px-3 py-2 text-sm ' +
        'border-y border-slate-400 dark:border-slate-200 ' +
        'bg-slate-200 hover:bg-slate-300 text-slate-700 ' +
        'dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 ' +
        'flex items-center gap-2 justify-center md:[.is-collapsed_&]:px-2';
    btn.innerHTML = `
            <span class="inline-flex items-center justify-center w-6 h-6">${Files.makeIcon('png').outerHTML}</span>
            <span class="font-semibold md:[.is-collapsed_&]:hidden">Галерея</span>
          `;

    btn.addEventListener('click', () => {
        // toggle
        const wrap = qs('#imagesGallery');
        if (wrap && !wrap.classList.contains('hidden')) Files.hideGallery();
        else Files.showGallery();
    });

    host.appendChild(btn);
};

Files.mountFontsButton = function () {
    const host = qs('#sidebarBottom') || qs('#sidebarFooter') || qs('#sidebar') || null;
    if (!host) return;
    if (qs('#btnFonts')) return;

    const btn = document.createElement('button');
    btn.id = 'btnFonts';
    btn.type = 'button';
    btn.className =
        'w-full mt-2 px-3 py-2 text-sm ' +
        'border-y border-slate-400 dark:border-slate-200 ' +
        'bg-slate-200 hover:bg-slate-300 text-slate-700 ' +
        'dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 ' +
        'flex items-center gap-2 justify-center md:[.is-collapsed_&]:px-2';

    btn.innerHTML = `
    <span class="inline-flex items-center justify-center w-6 h-6">Aa</span>
    <span class="font-semibold md:[.is-collapsed_&]:hidden">Шрифты</span>
  `;

    btn.addEventListener('click', () => {
        const wrap = qs('#fontsGallery');
        if (wrap && !wrap.classList.contains('hidden')) Files.hideFonts();
        else Files.showFonts();
    });

    host.appendChild(btn);
};

Files.mountVideosButton = function () {
    const host = qs('#sidebarBottom') || qs('#sidebarFooter') || qs('#sidebar');
    if (!host) return;
    if (qs('#btnVideos')) return;

    const btn = document.createElement('button');
    btn.id = 'btnVideos';
    btn.className =
        'w-full mt-2 px-3 py-2 text-sm ' +
        'border-y border-slate-400 dark:border-slate-200 ' +
        'bg-slate-200 hover:bg-slate-300 text-slate-700 ' +
        'dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 ' +
        'flex items-center gap-2 justify-center md:[.is-collapsed_&]:px-2';

    btn.innerHTML = `
        <span class="flex items-center justify-center gap-3">
         <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path fill="currentColor" 
          d="M488 64h-8v20c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12V64H96v20c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12V64h-8C10.7 64 0 74.7 0 88v336c0 13.3 10.7 24 24 24h8v-20c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v20h320v-20c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v20h8c13.3 0 24-10.7 24-24V88c0-13.3-10.7-24-24-24zM96 372c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm272 208c0 6.6-5.4 12-12 12H156c-6.6 0-12-5.4-12-12v-96c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v96zm0-168c0 6.6-5.4 12-12 12H156c-6.6 0-12-5.4-12-12v-96c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v96zm112 152c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40z"/>
         </svg>
        <span class="md:[.is-collapsed_&]:hidden font-semibold">Видео</span>
    `;

    btn.addEventListener('click', () => {
        const wrap = qs('#videosGallery');
        if (wrap && !wrap.classList.contains('hidden')) Files.hideVideos();
        else Files.showVideos();
    });

    host.appendChild(btn);
};

/** ----------------------------------------------------------- */
setTimeout(() => {
    Files.mountGalleryButton();
    Files.mountFontsButton();
    Files.mountVideosButton();
}, 0);

window.Admin.Files = Files;
