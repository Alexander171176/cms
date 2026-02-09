/** -----------------------------------------------------------
     * Open / Save  ✅ (старый просмотр изображений + новый функционал)
     * ---------------------------------------------------------- */

    Files.open = async function (path) {
        const editor = qs('#editor');
        const currentFile = qs('#currentFile');

        // ✅ Бинарные файлы (картинки/pdf/svg/webp и т.д.) — открываем в preview и НЕ читаем как текст
        const BIN_EXT = /\.(pdf|svg|webp|jpe?g|gif|png|bmp|ico|mp4|webm|ogg|mov|avi|mkv|woff2?|ttf|otf|eot)$/i;

        if (BIN_EXT.test(path)) {
            State.currentPath = path;
            State.original = '';
            State.dirty = false;

            // если есть редактор — очищаем (чтобы не было ощущения, что это текст)
            window.Admin.CodeEditor?.setValue?.('');
            window.Admin.CodeEditor?.refresh?.();
            if (editor) editor.value = '';

            // ✅ главное: показываем справа
            window.Admin.Preview?.set?.(path);

            if (currentFile) currentFile.textContent = path;
            Files.setActive(path);
            return;
        }

        const json = await fetchJson(apiUrl(`read.php?path=${encodeURIComponent(path)}`));
        if (!json.ok) throw new Error(json.error || 'Read failed');

        window.Admin.CodeEditor?.setValue?.(json.content || '');
        window.Admin.CodeEditor?.setModeByPath?.(path);
        window.Admin.CodeEditor?.refresh?.();

        State.currentPath = path;
        State.original = window.Admin.CodeEditor?.getValue?.() ?? (editor ? editor.value : '');
        State.dirty = false;

        // режимы/хуки
        window.Admin.Mode?.onFileChanged?.(path);

        // ✅ HTML/HTM/MD — обновляем превью текущим файлом (как в старой версии)
        if (/\.(html?|htm|md)$/i.test(path)) {
            window.Admin.Preview?.set?.(path);
        }

        if (currentFile) currentFile.textContent = path;
        Files.setActive(path);
    };

    Files.save = async function () {
        const editor = qs('#editor');
        if (!State.currentPath || !editor) return;

        // если открыт бинарный файл — не сохраняем текстом
        const BIN_EXT = /\.(pdf|svg|webp|jpe?g|gif|png|bmp|ico|mp4|webm|ogg|mov|avi|mkv|woff2?|ttf|otf|eot)$/i;
        if (BIN_EXT.test(State.currentPath)) {
            Admin.Toast?.error?.('Нельзя сохранять бинарный файл как текст');
            return;
        }

        const json = await fetchJson(apiUrl('write.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: State.currentPath,
                content: window.Admin.CodeEditor?.getValue?.() ?? editor.value,
            }),
        });

        if (!json.ok) {
            Admin.Toast?.error?.(json.error || 'Ошибка сохранения');
            return;
        }

        State.original = window.Admin.CodeEditor?.getValue?.() ?? (editor ? editor.value : '');
        State.dirty = false;

        Preview?.reload?.();
        Admin.Toast?.success?.('Сохранено');
    };

    