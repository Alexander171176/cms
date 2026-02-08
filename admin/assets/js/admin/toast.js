(function () {
    'use strict';

    window.Admin = window.Admin || {};

    const root = () => document.getElementById('toastRoot');

    function show({ message, type = 'info', timeout = 3000 }) {
        const box = root();
        if (!box) return;

        const el = document.createElement('div');

        const colors = {
            success: 'bg-emerald-600 text-white',
            error: 'bg-red-600 text-white',
            info: 'bg-slate-800 text-white',
            warn: 'bg-amber-500 text-black',
        };

        el.className = `
            px-4 py-3 rounded-md shadow-lg text-sm
            ${colors[type] || colors.info}
            animate-toast-in
            pointer-events-auto
            cursor-pointer
        `;

        el.textContent = message;

        el.addEventListener('click', () => remove(el));
        box.appendChild(el);

        if (timeout) {
            setTimeout(() => remove(el), timeout);
        }
    }

    function remove(el) {
        el.classList.add('animate-toast-out');
        setTimeout(() => el.remove(), 300);
    }

    window.Admin.Toast = {
        success(msg, t) { show({ message: msg, type: 'success', timeout: t }); },
        error(msg, t) { show({ message: msg, type: 'error', timeout: t || 5000 }); },
        info(msg, t) { show({ message: msg, type: 'info', timeout: t }); },
        warn(msg, t) { show({ message: msg, type: 'warn', timeout: t }); },
    };
})();
