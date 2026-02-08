/** -----------------------------------------------------------
     * Editor bindings (hotkeys + dirty)
     * ---------------------------------------------------------- */

    Files.bindEditor = function () {
        const btnSave = qs('#save');
        const editor = qs('#editor');

        if (btnSave) btnSave.addEventListener('click', Files.save);

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                Files.save();
            }
        });

        // dirty state: ориентируемся на CodeEditor если он есть
        const onChange = () => {
            if (!State.currentPath) return;

            const val = window.Admin.CodeEditor?.getValue?.() ?? (editor ? editor.value : '');
            State.dirty = val !== (State.original ?? '');
        };

        if (window.Admin.CodeEditor?.onChange) {
            window.Admin.CodeEditor.onChange(onChange);
        } else if (editor) {
            editor.addEventListener('input', onChange);
        }
    };

    // ✅ input + крестик сброса (без зависимостей)
    Files.attachClearableFilter = function (inputSel, onChange) {
        const input = qs(inputSel);
        if (!input) return;

        // обёртка, чтобы позиционировать крестик
        const wrap = document.createElement('div');
        wrap.className = 'relative w-full';

        // сохраняем классы инпута как есть, только добавим padding справа под крестик
        input.classList.add('pr-10');

        // вставляем wrap на место input
        const parent = input.parentNode;
        parent.insertBefore(wrap, input);
        wrap.appendChild(input);

        // кнопка-крестик
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = 'Очистить';
        btn.className =
            'absolute right-2 top-1/2 -translate-y-1/2 ' +
            'w-7 h-7 rounded border border-slate-400 dark:border-slate-200 ' +
            'bg-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700 ' +
            'flex items-center justify-center text-slate-600 dark:text-slate-200 ' +
            'hidden';

        btn.innerHTML = `
      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill="currentColor" d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4z"/>
      </svg>
    `;
        wrap.appendChild(btn);

        const sync = () => {
            const has = String(input.value || '').length > 0;
            btn.classList.toggle('hidden', !has);
        };

        input.addEventListener('input', () => {
            sync();
            onChange?.();
        });

        // ESC очищает тоже
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                input.value = '';
                sync();
                onChange?.();
                input.focus();
            }
        });

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            input.value = '';
            sync();
            onChange?.();
            input.focus();
        });

        // первичная синхронизация
        sync();
    };

    