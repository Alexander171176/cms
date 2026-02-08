/** -----------------------------------------------------------
     * Delete / Upload
     * ---------------------------------------------------------- */

    Files.deleteFile = async function (path) {
        const res = await fetchJson(apiUrl('delete.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path }),
        });

        if (!res || res.ok !== true) {
            throw new Error(res?.error || 'Не удалось удалить файл');
        }
    };

    Files.uploadToDir = function (dir) {
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.addEventListener(
            'change',
            async () => {
                try {
                    const file = input.files && input.files[0];
                    if (!file) return;

                    const fd = new FormData();
                    fd.append('dir', dir || '');
                    fd.append('file', file);

                    const resp = await fetch(apiUrl('upload.php'), {
                        method: 'POST',
                        body: fd,
                    });

                    const json = await resp.json().catch(() => ({}));
                    if (!resp.ok || json.ok !== true) {
                        throw new Error(json?.error || 'Не удалось загрузить файл');
                    }

                    // обновляем дерево
                    const treeBox = qs('#projectTree');
                    if (treeBox) await Files.loadTree(treeBox);
                } catch (err) {
                    alert(err?.message || 'Не удалось загрузить файл');
                } finally {
                    input.remove();
                }
            },
            { once: true }
        );

        input.click();
    };

    