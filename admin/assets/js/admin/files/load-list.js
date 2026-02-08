/** -----------------------------------------------------------
     * Load list (legacy folders root/css/js) — оставляем как было
     * ---------------------------------------------------------- */

    Files.loadList = async function (dir, box) {
        if (!box) return;

        const dirParam = (dir === undefined || dir === null) ? '' : String(dir);

        const json = await fetchJson(apiUrl(`list.php?dir=${encodeURIComponent(dirParam)}`));

        box.innerHTML = '';
        if (!json.ok || !Array.isArray(json.files)) return;

        json.files.forEach((f) => {
            const name = f.name || f.path || '';
            if (!name) return;

            const path = f.path ? f.path : (dirParam ? `${dirParam}/${name}` : name);
            Files.renderItem(box, path, name);
        });
    };

    