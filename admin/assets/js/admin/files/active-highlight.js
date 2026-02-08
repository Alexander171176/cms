/** -----------------------------------------------------------
     * Active highlight
     * ---------------------------------------------------------- */

    Files.setActive = function (path) {
        qsa('#projectTree li[data-path]').forEach((li) => {
            const active = li.dataset.path === path;

            li.classList.remove(
                'bg-slate-200',
                'dark:bg-slate-700',
                'text-red-500',
                'dark:text-red-200',
                'font-medium',
                'border',
                'border-red-500',
                'dark:border-red-400'
            );

            const bar = li.querySelector('.active-bar');
            if (bar) bar.remove();

            if (active) {
                li.classList.add(
                    'bg-slate-200',
                    'dark:bg-slate-700',
                    'text-red-500',
                    'dark:text-red-200',
                    'font-medium',
                    'border',
                    'border-red-500',
                    'dark:border-red-400'
                );

                const indicator = document.createElement('span');
                indicator.className = 'active-bar absolute left-0 top-1 bottom-1 w-0.5 bg-red-500';
                li.appendChild(indicator);
            }
        });
    };

    