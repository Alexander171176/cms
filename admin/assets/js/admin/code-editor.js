/**
 * code-editor.js
 * Переключаемый CodeMirror поверх textarea#editor
 * OFF = обычный textarea (как сейчас)
 * ON  = CodeMirror + синхронизация с Files.open/save и State.dirty
 */
(function () {
    'use strict';

    window.Admin = window.Admin || {};

    const { qs } = window.Admin.Core;
    const State = window.Admin.State;

    window.Admin.CodeEditor = {
        cm: null,
        enabled: false,

        init() {
            const btn = qs('#toggleCodeEditor');
            if (!btn) return;

            // запоминаем выбор
            this.enabled = localStorage.getItem('useCodeMirror') === '1';
            this.renderButton();

            btn.addEventListener('click', () => this.toggle());

            this.observeTheme();

            // если включено — поднимем сразу
            if (this.enabled) this.enable();
        },

        toggle() {
            this.enabled = !this.enabled;
            localStorage.setItem('useCodeMirror', this.enabled ? '1' : '0');

            if (this.enabled) this.enable();
            else this.disable();

            this.renderButton();
        },

        renderButton() {
            const btn = qs('#toggleCodeEditor');
            if (!btn) return;

            const knob = btn.querySelector('[data-knob]');
            const label = qs('#codeEditorState');

            btn.setAttribute('aria-checked', this.enabled ? 'true' : 'false');

            // фон свитча
            btn.classList.remove('bg-slate-300', 'dark:bg-slate-600', 'bg-blue-500');
            if (this.enabled) {
                btn.classList.add('bg-blue-500');
            } else {
                btn.classList.add('bg-slate-300', 'dark:bg-slate-600');
            }

            // положение "кнопки"
            if (knob) {
                knob.classList.remove('translate-x-0.5', 'translate-x-5');
                knob.classList.add(this.enabled ? 'translate-x-5' : 'translate-x-0.5');
            }

            if (label) label.textContent = this.enabled ? 'ON' : 'OFF';
        },

        applyTheme() {
            if (!this.cm) return;

            const isDark = document.documentElement.classList.contains('dark');
            this.cm.setOption('theme', isDark ? 'dracula' : 'default');
            this.cm.refresh(); // важно
        },

        observeTheme() {
            // чтобы не создавать 2 наблюдателя
            if (this._themeObserver) return;

            this._themeObserver = new MutationObserver(() => {
                this.applyTheme();
            });

            this._themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            });
        },

        enable() {
            const ta = qs('#editor');
            if (!ta || this.cm || !window.CodeMirror) return;

            const isDark = document.documentElement.classList.contains('dark');

            this.cm = window.CodeMirror.fromTextArea(ta, {
                lineNumbers: true,
                indentUnit: 2,
                tabSize: 2,
                viewportMargin: Infinity,
                mode: this.modeFromPath(State.currentPath),
                theme: 'default', // базово
            });

            this.applyTheme(); // 👈 сразу применит dracula если html.dark

            // если в textarea уже есть текст — CodeMirror сам его подхватит
            this.cm.on('change', () => {
                if (!State.currentPath) return;
                State.dirty = this.getValue() !== State.original;
            });

            // на всякий случай обновим режим по текущему файлу
            this.setModeByPath(State.currentPath);
            this.refresh();
        },

        disable() {
            if (!this.cm) return;

            // переносим текущее значение назад в textarea
            const val = this.cm.getValue();
            this.cm.toTextArea(); // вернёт textarea обратно
            this.cm = null;

            const ta = qs('#editor');
            if (ta) ta.value = val;
        },

        isEnabled() {
            return !!this.cm;
        },

        getValue() {
            const ta = qs('#editor');
            if (this.cm) return this.cm.getValue();
            return ta ? ta.value : '';
        },

        setValue(v) {
            const ta = qs('#editor');
            if (this.cm) this.cm.setValue(v || '');
            else if (ta) ta.value = v || '';
        },

        refresh() {
            if (this.cm) this.cm.refresh();
        },

        setModeByPath(path) {
            if (!this.cm) return;
            this.cm.setOption('mode', this.modeFromPath(path));
        },

        modeFromPath(path) {
            const p = String(path || '').toLowerCase();
            if (p.endsWith('.html') || p.endsWith('.htm')) return 'htmlmixed';
            if (p.endsWith('.css')) return 'css';
            if (p.endsWith('.scss')) return 'sass';
            if (p.endsWith('.js')) return 'javascript';
            if (p.endsWith('.json')) return {name: 'javascript', json: true};
            if (p.endsWith('.xml') || p.endsWith('.svg')) return 'xml';
            if (p.endsWith('.php')) return 'php';
            if (p.endsWith('.sql')) return 'sql';
            if (p.endsWith('.md')) return 'markdown';
            return null; // plain text
        },
    };
})();
