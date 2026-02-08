/** -----------------------------------------------------------
     * Project tree (recursive folders) + upload buttons
     * ---------------------------------------------------------- */

    Files.loadTree = async function (box) {
        if (!box) return;

        const json = await fetchJson(apiUrl('tree.php'));

        box.innerHTML = '';
        if (!json.ok || !Array.isArray(json.tree)) return;

        Files.renderTree(box, json.tree);
    };

    Files.renderTree = function (box, tree) {
        (tree || []).forEach((node) => Files.renderTreeNode(box, node));
    };

    Files.renderTreeNode = function (box, node) {
        if (!node || !node.type) return;

        if (node.type === 'dir') {
            const details = document.createElement('details');
            details.className = 'group';

            const summary = document.createElement('summary');
            summary.className =
                'cursor-pointer list-none flex items-center gap-2 px-2 py-1 rounded ' +
                'hover:bg-slate-200 dark:hover:bg-slate-800 ' +
                'md:[.is-collapsed_&]:justify-center md:[.is-collapsed_&]:px-1';

            const caret = document.createElement('span');
            caret.className = 'w-3 text-slate-400 group-open:rotate-90 transition-transform select-none';
            caret.textContent = '▸';

            const folder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            folder.setAttribute('viewBox', '0 0 24 24');
            folder.setAttribute('width', '18');
            folder.setAttribute('height', '18');
            folder.classList.add('text-slate-400');
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('fill', 'currentColor');
            p.setAttribute('d', 'M10 4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6z');
            folder.appendChild(p);

            const label = document.createElement('span');
            label.textContent = node.name || '';
            label.className = 'truncate md:[.is-collapsed_&]:hidden';

            summary.appendChild(caret);
            summary.appendChild(folder);
            summary.appendChild(label);

            // ✅ upload action (только когда не collapsed)
            const actions = document.createElement('span');
            actions.className = 'ml-auto flex items-center gap-1 md:[.is-collapsed_&]:hidden';

            const upBtn = Files.makeIconButton('plus', 'Загрузить файл');
            upBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // node.path должен быть путём папки относительно корня
                Files.uploadToDir(node.path || '');
            });

            actions.appendChild(upBtn);
            summary.appendChild(actions);

            const ul = document.createElement('ul');
            ul.className =
                'ml-5 mt-1 space-y-1 ' +
                'md:[.is-collapsed_&]:ml-0 md:[.is-collapsed_&]:mt-0';

            details.appendChild(summary);
            details.appendChild(ul);
            box.appendChild(details);

            (node.children || []).forEach((child) => Files.renderTreeNode(ul, child));
            return;
        }

        if (node.type === 'file') {
            Files.renderItem(box, node.path, node.name);
        }
    };

    