/**
 * marked.js (mini)
 * Очень лёгкий Markdown → HTML парсер без зависимостей.
 * Дает: headings, bold/italic, inline code, fenced code, links, images,
 * blockquote, hr, ul/ol lists, paragraphs, escaping.
 *
 * API: window.marked.parse(mdText)
 */
(function () {
    'use strict';

    function escapeHtml(s) {
        return String(s ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function escapeAttr(s) {
        return escapeHtml(s).replaceAll('`', '&#096;');
    }

    // inline markdown → html
    function inline(md) {
        let s = String(md ?? '');

        // inline code `code`
        s = s.replace(/`([^`]+)`/g, (_m, c) =>
            `<code>${escapeHtml(c)}</code>`
        );

        // images
        s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
            (_m, alt, url, title) =>
                `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}"${title ? ` title="${escapeAttr(title)}"` : ''}>`
        );

        // links
        s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
            (_m, text, url, title) =>
                `<a href="${escapeAttr(url)}"${title ? ` title="${escapeAttr(title)}"` : ''} target="_blank">${text}</a>`
        );

        // bold / italic
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

        return s;
    }

    function parse(mdText) {
        const src = String(mdText ?? '').replace(/\r\n?/g, '\n');
        const lines = src.split('\n');

        let out = '';
        let i = 0;

        let inCode = false;
        let codeLang = '';
        let codeBuf = [];

        let inUl = false;
        let inOl = false;

        function closeLists() {
            if (inUl) { out += '</ul>'; inUl = false; }
            if (inOl) { out += '</ol>'; inOl = false; }
        }

        function openUl() { if (!inUl) { closeLists(); out += '<ul>'; inUl = true; } }
        function openOl() { if (!inOl) { closeLists(); out += '<ol>'; inOl = true; } }

        function flushParagraph(buf) {
            const text = buf.join(' ').trim();
            if (text) out += `<p>${inline(text)}</p>`;
        }

        let pBuf = [];

        while (i < lines.length) {
            const line = lines[i];

            // fenced code start/end: ```lang
            const fence = line.match(/^```([\w-]+)?\s*$/);
            if (fence) {
                if (!inCode) {
                    // начать code block
                    closeLists();
                    flushParagraph(pBuf); pBuf = [];

                    inCode = true;
                    codeLang = fence[1] || '';
                    codeBuf = [];
                } else {
                    // закрыть code block
                    const code = escapeHtml(codeBuf.join('\n'));
                    const cls = codeLang ? ` class="language-${escapeAttr(codeLang)}"` : '';
                    out += `<pre><code${cls}>${code}</code></pre>`;
                    inCode = false;
                    codeLang = '';
                    codeBuf = [];
                }
                i++;
                continue;
            }

            if (inCode) {
                codeBuf.push(line);
                i++;
                continue;
            }

            // hr
            if (/^(\*\s*\*\s*\*|-{3,}|_{3,})\s*$/.test(line)) {
                closeLists();
                flushParagraph(pBuf); pBuf = [];
                out += '<hr>';
                i++;
                continue;
            }

            // headings #..######
            const h = line.match(/^(#{1,6})\s+(.+)\s*$/);
            if (h) {
                closeLists();
                flushParagraph(pBuf); pBuf = [];
                const level = h[1].length;
                out += `<h${level}>${inline(h[2])}</h${level}>`;
                i++;
                continue;
            }

            // blockquote >
            const bq = line.match(/^\s*>\s?(.*)$/);
            if (bq) {
                closeLists();
                flushParagraph(pBuf); pBuf = [];
                // собираем подряд идущие > строки в один blockquote
                let q = [];
                while (i < lines.length) {
                    const m = lines[i].match(/^\s*>\s?(.*)$/);
                    if (!m) break;
                    q.push(m[1]);
                    i++;
                }
                out += `<blockquote>${inline(q.join('\n'))}</blockquote>`;
                continue;
            }

            // ordered list: 1. item
            const ol = line.match(/^\s*\d+\.\s+(.+)$/);
            if (ol) {
                flushParagraph(pBuf); pBuf = [];
                openOl();
                out += `<li>${inline(ol[1])}</li>`;
                i++;
                continue;
            }

            // unordered list: - item / * item / + item
            const ul = line.match(/^\s*[-*+]\s+(.+)$/);
            if (ul) {
                flushParagraph(pBuf); pBuf = [];
                openUl();
                out += `<li>${inline(ul[1])}</li>`;
                i++;
                continue;
            }

            // пустая строка = конец параграфа/списка
            if (/^\s*$/.test(line)) {
                closeLists();
                flushParagraph(pBuf); pBuf = [];
                i++;
                continue;
            }

            // обычная строка → в буфер параграфа
            pBuf.push(line.trim());
            i++;
        }

        // финальные закрытия
        if (inCode) {
            // если файл внезапно закончился в code block
            const code = escapeHtml(codeBuf.join('\n'));
            const cls = codeLang ? ` class="language-${escapeAttr(codeLang)}"` : '';
            out += `<pre><code${cls}>${code}</code></pre>`;
        }
        closeLists();
        flushParagraph(pBuf);

        return out;
    }

    window.marked = { parse };
})();
