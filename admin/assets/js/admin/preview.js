/**
 * preview.js
 * Правая колонка: iframe preview (HTML/MD/PDF/IMG/SVG)
 *
 * Требует:
 *  - #previewFrame (iframe)
 *  - #previewReload (кнопка Reload)
 *
 * Дополнительно для Markdown:
 *  - window.marked (marked.js) — желательно подключить в админке
 */
(function () {
    'use strict';

    window.Admin = window.Admin || {};

    const { qs } = window.Admin.Core;
    const State = window.Admin.State;

    const Preview = {};
    const PREVIEWABLE_EXT = new Set([
        'html','htm','md','pdf','svg','webp','jpg','jpeg','gif','png','bmp','ico',
        'mp4','webm','ogg','mov','avi','mkv',
        'woff2','woff','ttf','otf','eot',
    ]);


    function getExt(path) {
        const p = String(path || '');
        const name = p.split('/').pop() || '';
        const m = name.match(/\.([a-z0-9]+)$/i);
        return m ? m[1].toLowerCase() : '';
    }

    function getDir(path) {
        const p = String(path || '');
        const i = p.lastIndexOf('/');
        return i >= 0 ? p.slice(0, i) : '';
    }

    function bustUrl(path) {
        return `../${path}?t=${Date.now()}`;
    }

    function setFrameSrc(frame, path) {
        frame.removeAttribute('srcdoc');
        frame.src = bustUrl(path);
    }

    function setFrameDoc(frame, html) {
        frame.removeAttribute('src');
        frame.srcdoc = html;
    }

    function escapeHtml(s) {
        return String(s || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function buildMarkdownDoc(mdText, path) {
        const dir = getDir(path);
        const baseHref = `../${dir ? dir + '/' : ''}`;

        // если marked не подключён — покажем подсказку + исходник
        const hasMarked = typeof window.marked?.parse === 'function';

        const body = hasMarked
            ? window.marked.parse(mdText || '')
            : `<div style="padding:12px;border:1px solid #f59e0b;
                           background:#fffbeb;color:#92400e;
                           border-radius:10px;margin-bottom:12px;">
           <b>marked.js не подключён</b><br>
                Подключи marked.js в админке (window.marked), чтобы Markdown рендерился красиво.
         </div>
         <pre style="white-space:pre-wrap;word-break:break-word;
                     background:#0b1220;color:#e2e8f0;padding:12px;
                     border-radius:12px;overflow:auto;">
            ${escapeHtml(mdText)}
         </pre>`;

        // лёгкий “github-like” стиль + поддержка dark
        return `<!doctype html>
                <html>
                <head>
                  <meta charset="utf-8" />
                  <base href="${baseHref}">
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <style>
                    :root{
                      --bg:#ffffff; --fg:#0f172a; --muted:#475569; --border:#e2e8f0;
                      --codebg:#0b1220; --codefg:#e2e8f0; --link:#2563eb;
                    }
                    @media (prefers-color-scheme: dark){
                      :root{
                        --bg:#0b1220; --fg:#e2e8f0; --muted:#94a3b8; --border:#1f2937;
                        --codebg:#020617; --codefg:#e2e8f0; --link:#60a5fa;
                      }
                    }
                    html,body{height:100%;}
                    body{
                      margin:0; padding:18px;
                      font: 14px/1.6 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
                      background:var(--bg); color:var(--fg);
                    }
                    .wrap{max-width: 980px; margin:0 auto;}
                    h1,h2,h3{line-height:1.25;margin:18px 0 10px;}
                    p{margin: 10px 0;}
                    a{color:var(--link);text-decoration:none;}
                    a:hover{text-decoration:underline;}
                    hr{border:none;border-top:1px solid var(--border);margin:18px 0;}
                    blockquote{margin:12px 0;padding:8px 12px;border-left:4px solid var(--border);color:var(--muted);}
                    ul,ol{padding-left:22px;}
                    code{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;}
                    pre{background:var(--codebg);color:var(--codefg);padding:12px;border-radius:12px;overflow:auto;}
                    pre code{color:inherit;}
                    table{border-collapse:collapse;width:100%;margin:12px 0;border:1px solid var(--border);}
                    th,td{border:1px solid var(--border);padding:8px;vertical-align:top;}
                    img{max-width:100%;height:auto;border-radius:10px;}
                  </style>
                </head>
                <body>
                  <div class="wrap">${body}</div>
                </body>
                </html>`;
    }

    function buildImageDoc(path, title) {
        const url = bustUrl(path);

        // аккуратный “viewer” (центр, фон, скролл, зум колесом)
        return `<!doctype html>
                <html>
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <title>${escapeHtml(title || path)}</title>
                  <style>
                    html,body{height:100%;margin:0;}
                    body{
                      background:#FFFFFF;
                      color:#e2e8f0;
                      display:flex;
                      flex-direction:column;
                    }
                    .top{
                      padding:10px 12px;
                      font: 12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
                      color:#CCCCCC;
                      text-align:center;
                      border-bottom:1px solid rgba(148,163,184,.2);
                      background:rgba(2,6,23,.55);
                      backdrop-filter: blur(6px);
                    }
                    .stage{
                      overflow:auto;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      padding:18px;
                    }
                    img{
                      max-width:100%;
                      height:auto;
                      transform-origin:center center;
                      image-rendering:auto;
                      border-radius:12px;
                      box-shadow: 0 10px 30px rgba(0,0,0,.35);
                      background:transparent;
                    }
                  </style>
                </head>
                <body>
                  <div class="top">${escapeHtml(path)} — колесо мыши: zoom</div>
                  <div class="stage">
                    <img id="img" src="${url}" alt="${escapeHtml(title || path)}">
                  </div>
                  <script>
                    (function(){
                      const img = document.getElementById('img');
                      let scale = 1;
                      document.addEventListener('wheel', (e) => {
                        if (!e.ctrlKey && !e.metaKey) {
                          e.preventDefault();
                          const delta = Math.sign(e.deltaY);
                          scale += (delta > 0 ? -0.1 : 0.1);
                          scale = Math.min(6, Math.max(0.2, scale));
                          img.style.transform = 'scale(' + scale.toFixed(2) + ')';
                        }
                      }, {passive:false});
                    })();
                  </script>
                </body>
                </html>`;
    }

    function buildVideoDoc(path, title) {
        const url = bustUrl(path);

        return `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title || path)}</title>
      <style>
        html,body{height:100%;margin:0;}
        body{background:#000;display:flex;flex-direction:column;}
        .top{
          padding:10px 12px;
          font: 12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          color:#cbd5e1;text-align:center;
          border-bottom:1px solid rgba(148,163,184,.2);
          background:rgba(2,6,23,.55);
          backdrop-filter: blur(6px);
        }
        .stage{
          flex:1;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:12px;
        }
        video{
          width:100%;
          height:100%;
          max-width:1200px;
          max-height:calc(100vh - 54px);
          background:#000;
          border-radius:12px;
          box-shadow:0 10px 30px rgba(0,0,0,.35);
        }
        .btn{
          position:fixed; right:14px; top:14px;
          padding:8px 10px; border-radius:10px;
          background:rgba(15,23,42,.8); color:#e2e8f0;
          border:1px solid rgba(148,163,184,.25);
          cursor:pointer; font:12px/1 system-ui;
        }
      </style>
    </head>
    <body>
      <div class="top">${escapeHtml(path)} — двойной клик по видео: fullscreen</div>
      <button class="btn" id="fsBtn">Fullscreen</button>
      <div class="stage">
        <video id="v" src="${url}" controls preload="metadata"></video>
      </div>
      <script>
        (function(){
          const v = document.getElementById('v');
          const b = document.getElementById('fsBtn');
          function requestAnyFullscreen(el){
            try{
              if (el.requestFullscreen) return el.requestFullscreen();
              if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
              if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
              if (el.msRequestFullscreen) return el.msRequestFullscreen();
            }catch(e){}
          }
          v.addEventListener('dblclick', () => requestAnyFullscreen(v));
          b.addEventListener('click', () => requestAnyFullscreen(v));
        })();
      </script>
    </body>
    </html>`;
    }

    function buildFontDoc(path, title) {
        const url = bustUrl(path);
        const family = 'font_' + Math.random().toString(16).slice(2);

        const SAMPLE_RU_UP = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
        const SAMPLE_RU_LO = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
        const SAMPLE_KZ    = 'Ә ә Ғ ғ Қ қ Ң ң Ө ө Ұ ұ Ү ү Һ һ І і';
        const SAMPLE_EN    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ / abcdefghijklmnopqrstuvwxyz';
        const SAMPLE_NUM   = '0123456789';
        const SAMPLE_SYM   = '.,:;!?—–()[]{}<>@#$%^&*+=/\\\\"\\';

        return `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title || path)}</title>
      <style>
        :root{--bg:#ffffff;--fg:#0f172a;--muted:#475569;--border:#e2e8f0;}
        @media (prefers-color-scheme: dark){
          :root{--bg:#0b1220;--fg:#e2e8f0;--muted:#94a3b8;--border:#1f2937;}
        }
        body{margin:0;padding:16px;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--fg);}
        .top{font-size:12px;color:var(--muted);border:1px solid var(--border);padding:10px 12px;border-radius:12px;margin-bottom:12px;}
        .sample{border:1px solid var(--border);border-radius:12px;padding:14px;}
        .line{font-size:26px;line-height:1.25;margin:10px 0;word-break:break-word;}
        .hint{font-size:12px;color:var(--muted);margin-top:10px;}
      </style>
      <style>
        @font-face {
          font-family: "${family}";
          src: url("${url}");
          font-display: swap;
        }
      </style>
    </head>
    <body>
      <div class="top"><b>${escapeHtml(path)}</b></div>
      <div class="sample" style="font-family:${family}, system-ui, sans-serif;">
        <div class="line">${SAMPLE_RU_UP}</div>
        <div class="line">${SAMPLE_RU_LO}</div>
        <div class="line">${SAMPLE_KZ}</div>
        <div class="line">${SAMPLE_EN}</div>
        <div class="line">${SAMPLE_NUM}</div>
        <div class="line">${SAMPLE_SYM}</div>
        <div class="hint">Если шрифт не отображается — файл может быть недоступен по публичному URL или MIME-тип не отдан сервером.</div>
      </div>
    </body>
    </html>`;
    }

    function isPreviewable(path) {
        const ext = getExt(path);
        return PREVIEWABLE_EXT.has(ext);
    }

    // Берём контент MD прямо из редактора (если открыт и редактируется)
    function getEditorValue() {
        return window.Admin.CodeEditor?.getValue?.()
            ?? (qs('#editor') ? qs('#editor').value : '');
    }

    Preview.set = function (path) {
        const frame = qs('#previewFrame');
        if (!frame) return;

        frame.dataset.path = path || '';

        if (!path || !isPreviewable(path)) {
            // если не превьюшится — ничего не делаем (можно оставить прошлое)
            return;
        }

        const ext = getExt(path);

        // Видео → srcdoc viewer
        if (['mp4','webm','ogg','mov','avi','mkv'].includes(ext)) {
            setFrameDoc(frame, buildVideoDoc(path, path));
            return;
        }

        // Шрифты → srcdoc viewer
        if (['woff','woff2','ttf','otf','eot'].includes(ext)) {
            setFrameDoc(frame, buildFontDoc(path, path));
            return;
        }

        // Markdown → HTML (srcdoc)
        if (ext === 'md') {
            const md = getEditorValue();
            setFrameDoc(frame, buildMarkdownDoc(md, path));
            return;
        }

        // Images (включая svg/ico/bmp) — красивый viewer через srcdoc
        if (['svg','webp','jpg','jpeg','gif','png','bmp','ico'].includes(ext)) {
            setFrameDoc(frame, buildImageDoc(path, path));
            return;
        }

        // PDF/HTML — можно напрямую грузить файл
        setFrameSrc(frame, path);
    };

    Preview.reload = function () {
        const frame = qs('#previewFrame');
        if (!frame) return;

        // приоритет: текущий открытый файл
        const p = (State.currentPath && isPreviewable(State.currentPath))
            ? State.currentPath
            : (frame.dataset.path || '');

        if (!p) return;

        frame.dataset.path = p;
        Preview.set(p);
    };

    Preview.init = function () {
        const frame = qs('#previewFrame');
        if (!frame) return;

        const btn = qs('#previewReload');
        if (btn) btn.addEventListener('click', () => Preview.reload());

        // Live preview для Markdown (когда печатаешь) — аккуратно и без ломания архитектуры
        // Работает и для textarea, и для CodeMirror
        let t = null;
        const schedule = () => {
            if (!(State.currentPath && getExt(State.currentPath) === 'md')) return;
            clearTimeout(t);
            t = setTimeout(() => Preview.reload(), 150);
        };

        // textarea
        const ta = qs('#editor');
        if (ta) ta.addEventListener('input', schedule);

        // CodeMirror (если включён)
        const hookCM = () => {
            const cm = window.Admin.CodeEditor?.cm;
            if (cm && !cm.__previewHooked) {
                cm.__previewHooked = true;
                cm.on('change', schedule);
            }
        };
        hookCM();

        // если включат CodeMirror позже — подцепим
        const obs = new MutationObserver(hookCM);
        obs.observe(document.body, { childList: true, subtree: true });
    };

    window.Admin.Preview = Preview;
})();
