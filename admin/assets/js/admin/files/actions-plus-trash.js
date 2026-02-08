/** -----------------------------------------------------------
     * UI icons for actions (plus/trash)
     * ---------------------------------------------------------- */

    Files.makeIconButton = function (type, title) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = title;
        btn.className =
            'inline-flex items-center justify-center w-7 h-7 rounded ' +
            'border-2 border-gray-400 dark:border-gray-500 ' +
            'hover:border-red-400 dark:hover:border-red-500 ' +
            'hover:bg-gray-100 dark:hover:bg-gray-900 ' +
            'text-gray-600 dark:text-gray-300';
        btn.appendChild(Files.uiIcon(type));
        return btn;
    };

    Files.uiIcon = function (type) {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');

        const path = document.createElementNS(ns, 'path');

        if (type === 'trash') {
            path.setAttribute('d', 'M3.87,21.214A3.01,3.01,0,0,0,6.862,24H17.138a3.01,3.01,0,0,0,2.992-2.786L21.074,8H2.926Z');
            svg.appendChild(path);
            const l1 = document.createElementNS(ns, 'path');
            l1.setAttribute('d', 'M23,4H17V1a1,1,0,0,0-1-1H8A1,1,0,0,0,7,1V4H1A1,1,0,0,0,1,6H23a1,1,0,0,0,0-2ZM9,2h6V4H9Z');
            svg.appendChild(l1);
            return svg;
        }

        if (type === 'plus') {
            path.setAttribute('d', 'M12 5v14M5 12h14');
            svg.appendChild(path);
            return svg;
        }

        // fallback
        path.setAttribute('d', 'M12 5v14M5 12h14');
        svg.appendChild(path);
        return svg;
    };

    