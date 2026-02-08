/** -----------------------------------------------------------
     * Render file item (icon + text + delete action)
     * ---------------------------------------------------------- */

    Files.renderItem = function (box, path, label) {
        const li = document.createElement('li');

        li.className =
            'relative px-1.5 py-1 rounded-md cursor-pointer text-sm ' +
            'bg-slate-200 hover:bg-slate-300 text-slate-700 ' +
            'dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 ' +
            'border-2 border-gray-400 dark:border-gray-300 ' +
            'md:[.is-collapsed_&]:flex md:[.is-collapsed_&]:justify-center';

        li.dataset.path = path;

        const text = label || path;
        li.title = text;

        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 min-w-6';

        const ext = Files.getExt(path);
        const iconWrap = document.createElement('span');
        iconWrap.className = 'shrink-0';
        iconWrap.appendChild(Files.makeIcon(ext));

        const name = document.createElement('span');
        name.className = 'truncate md:[.is-collapsed_&]:hidden';
        name.textContent = text;

        row.appendChild(iconWrap);
        row.appendChild(name);

        // ✅ delete action (только когда не collapsed)
        const actions = document.createElement('span');
        actions.className = 'ml-auto flex items-center gap-1 md:[.is-collapsed_&]:hidden';

        const delBtn = Files.makeIconButton('trash', 'Удалить файл');
        delBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const ok = confirm(`Удалить файл\n\n${path}\n\nДействие необратимо.`);
            if (!ok) return;

            await Files.deleteFile(path);

            // если удалили открытый файл — чистим редактор/превью
            if (State.currentPath === path) {
                State.currentPath = '';
                State.original = '';
                State.dirty = false;

                window.Admin.CodeEditor?.setValue?.('');
                window.Admin.CodeEditor?.refresh?.();

                const editor = qs('#editor');
                if (editor) editor.value = '';

                const currentFile = qs('#currentFile');
                if (currentFile) currentFile.textContent = '';

                // если есть метод очистки — попробуем, иначе просто reload
                window.Admin.Preview?.clear?.();
                window.Admin.Preview?.reload?.();
            }

            await Files.loadTree(qs('#projectTree'));
        });

        actions.appendChild(delBtn);
        row.appendChild(actions);

        li.appendChild(row);

        li.addEventListener('click', async () => {
            if (State.dirty) {
                const ok = confirm('Есть несохранённые изменения. Переключиться?');
                if (!ok) return;
            }
            await Files.open(path);
        });

        box.appendChild(li);
    };

    