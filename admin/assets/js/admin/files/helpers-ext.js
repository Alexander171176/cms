/** -----------------------------------------------------------
     * Helpers: ext + svg icon
     * ---------------------------------------------------------- */

    // "css/app.min.css" -> "css"
    Files.getExt = function (path) {
        const p = String(path || '');
        const filename = p.split('/').pop() || '';
        const m = filename.match(/\.([a-z0-9]+)$/i);
        return m ? m[1].toLowerCase() : '';
    };

    // SVG-иконка (на currentColor) из реестра window.Admin.FilesIcons
    Files.makeIcon = function (ext) {
        const ns = 'http://www.w3.org/2000/svg';

        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('aria-hidden', 'true');
        svg.classList.add('w-6', 'h-6');

        // универсальный shape-конструктор (path/polygon/rect/circle/line/polyline)
        const mkShape = (item) => {
            const type = (item && item.type) ? String(item.type).toLowerCase() : 'path';

            const applyStyle = (el, mode = 'fill') => {
                if (mode === 'stroke') {
                    el.setAttribute('fill', 'none');
                    el.setAttribute('stroke', 'currentColor');
                    el.setAttribute('stroke-width', '1.6');
                    el.setAttribute('stroke-linecap', 'round');
                    el.setAttribute('stroke-linejoin', 'round');
                } else {
                    el.setAttribute('fill', 'currentColor');
                }
            };

            if (type === 'path') {
                const d = item?.d ?? item?.path ?? '';
                const mode = item?.mode ?? 'fill';
                const p = document.createElementNS(ns, 'path');
                applyStyle(p, mode);
                p.setAttribute('d', d);
                return p;
            }

            if (type === 'polygon') {
                const mode = item?.mode ?? 'fill';
                const pl = document.createElementNS(ns, 'polygon');
                applyStyle(pl, mode);
                pl.setAttribute('points', item?.points ?? '');
                return pl;
            }

            if (type === 'polyline') {
                const mode = item?.mode ?? 'stroke';
                const pl = document.createElementNS(ns, 'polyline');
                applyStyle(pl, mode);
                pl.setAttribute('points', item?.points ?? '');
                return pl;
            }

            if (type === 'line') {
                const mode = item?.mode ?? 'stroke';
                const ln = document.createElementNS(ns, 'line');
                applyStyle(ln, mode);
                ln.setAttribute('x1', String(item?.x1 ?? 0));
                ln.setAttribute('y1', String(item?.y1 ?? 0));
                ln.setAttribute('x2', String(item?.x2 ?? 0));
                ln.setAttribute('y2', String(item?.y2 ?? 0));
                return ln;
            }

            if (type === 'rect') {
                const mode = item?.mode ?? 'stroke';
                const r = document.createElementNS(ns, 'rect');
                applyStyle(r, mode);
                r.setAttribute('x', String(item?.x ?? 0));
                r.setAttribute('y', String(item?.y ?? 0));
                r.setAttribute('width', String(item?.width ?? 0));
                r.setAttribute('height', String(item?.height ?? 0));
                if (item?.rx != null) r.setAttribute('rx', String(item.rx));
                if (item?.ry != null) r.setAttribute('ry', String(item.ry));
                return r;
            }

            if (type === 'circle') {
                const mode = item?.mode ?? 'stroke';
                const c = document.createElementNS(ns, 'circle');
                applyStyle(c, mode);
                c.setAttribute('cx', String(item?.cx ?? 0));
                c.setAttribute('cy', String(item?.cy ?? 0));
                c.setAttribute('r', String(item?.r ?? 0));
                return c;
            }

            const fallback = document.createElementNS(ns, 'path');
            fallback.setAttribute('fill', 'currentColor');
            fallback.setAttribute('d', '');
            return fallback;
        };

        const e = String(ext || '').toLowerCase();

        const { ICONS, mapExtToKey } = window.Admin.FilesIcons || {};
        if (!ICONS || !mapExtToKey) {
            // fallback: пустая иконка
            svg.setAttribute('viewBox', '0 0 24 24');
            const p = document.createElementNS(ns, 'path');
            p.setAttribute('fill', 'currentColor');
            p.setAttribute('d', 'M6 2h9l3 3v17H6z');
            svg.appendChild(p);
            return svg;
        }

        const key = mapExtToKey(e);
        const icon = ICONS[key] || ICONS.file;

        svg.setAttribute('viewBox', icon.viewBox);
        (icon.paths || []).forEach((item) => {
            svg.appendChild(mkShape(item));
        });

        return svg;
    };

    