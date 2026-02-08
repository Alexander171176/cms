<main class="flex-1 flex flex-col min-w-0">

    <div class="h-12 px-3 sm:px-4 flex items-center gap-2 justify-between
                border-b border-slate-400 dark:border-slate-200
                bg-white/60 dark:bg-slate-950/40 backdrop-blur">

        <!-- Лево: меню (мобилка) + Theme + переключатель режима -->
        <div class="flex items-center gap-2 min-w-0">

            <button id="sidebarOpen"
                    class="md:hidden inline-flex items-center justify-center
                           w-7 h-7 rounded border border-slate-400 dark:border-slate-200
                           bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                    aria-label="Open sidebar">
                ☰
            </button>

            <button id="themeToggle"
                    class="inline-flex items-center justify-center gap-2
                           w-7 h-7 rounded border border-slate-400 dark:border-slate-200
                           bg-white hover:bg-slate-50 dark:bg-slate-900
                           dark:hover:bg-slate-800"
                    title="Светлый/Тёмный режим">

                <!-- ☀️ Light -->
                <svg class="w-4 h-4 dark:hidden"
                     width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path class="fill-current text-amber-400"
                          d="M7 0h2v2H7V0Zm5.88 1.637 1.414 1.415-1.415 1.413-1.414-1.414 1.415-1.414ZM14 7h2v2h-2V7Zm-1.05 7.433-1.415-1.414 1.414-1.414 1.415 1.413-1.414 1.415ZM7 14h2v2H7v-2Zm-4.02.363L1.566 12.95l1.415-1.414 1.414 1.415-1.415 1.413ZM0 7h2v2H0V7Zm3.05-5.293L4.465 3.12 3.05 4.535 1.636 3.121 3.05 1.707Z"/>
                    <path class="fill-current text-amber-500"
                          d="M8 4C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z"/>
                </svg>

                <!-- 🌙 Dark -->
                <svg class="w-4 h-4 hidden dark:block"
                     width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path class="fill-current text-slate-300"
                          d="M6.2 2C3.2 2.8 1 5.6 1 8.9 1 12.8 4.2 16 8.1 16c3.3 0 6-2.2 6.9-5.2C9.7 12.2 4.8 7.3 6.2 2Z"/>
                    <path class="fill-current text-slate-200"
                          d="M12.5 6a.625.625 0 0 1-.625-.625 1.252 1.252 0 0 0-1.25-1.25.625.625 0 1 1 0-1.25 1.252 1.252 0 0 0 1.25-1.25.625.625 0 1 1 1.25 0c.001.69.56 1.249 1.25 1.25a.625.625 0 1 1 0 1.25c-.69.001-1.249.56-1.25 1.25A.625.625 0 0 1 12.5 6Z"/>
                </svg>
            </button>

            <!-- Переключатель режима: Editor / SEO -->
            <div class="hidden sm:flex items-center rounded border border-slate-400 dark:border-slate-200 overflow-hidden">
                <button id="modeEditor"
                        class="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-100
                               dark:bg-slate-800 dark:hover:bg-slate-700 border-r border-slate-400"
                        title="Режим редактор страницы">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24"
                         class="w-4 h-4">
                        <path class="fill-current text-blue-700 dark:text-blue-100"
                              d="M17,23H4c-1.654,0-3-1.346-3-3V7c0-1.654,1.346-3,3-3h5c.552,0,1,.448,1,1s-.448,1-1,1H4c-.551,0-1,.449-1,1v13c0,.551,.449,1,1,1h13c.551,0,1-.449,1-1v-5c0-.552,.448-1,1-1s1,.448,1,1v5c0,1.654-1.346,3-3,3Z"></path>
                        <path class="fill-current text-blue-700 dark:text-blue-100"
                              d="M20.414,8l1.585-1.585c.378-.377,.587-.879,.587-1.414,0-.535-.208-1.037-.586-1.416l-1.585-1.585c-.377-.378-.879-.587-1.414-.587h0c-.534,0-1.037,.208-1.415,.586l-1.586,1.586,4.414,4.414Z"></path>
                        <path class="fill-current text-blue-700 dark:text-blue-100"
                              d="M14.586,5l-6.293,6.293c-.096,.096-.171,.21-.222,.335l-2,5c-.148,.372-.061,.796,.222,1.079,.191,.191,.447,.293,.707,.293,.125,0,.251-.023,.372-.071l5-2c.125-.05,.24-.126,.335-.222l6.293-6.293-4.414-4.414Z"></path>
                    </svg>
                </button>
                <button id="modeSeo"
                        class="px-2 py-1 font-semibold text-xs bg-white text-blue-900 hover:bg-slate-50
                               dark:bg-slate-900 dark:text-blue-100 dark:hover:bg-slate-800"
                        title="Режим редактирования SEO">
                    SEO
                </button>
            </div>
        </div>

        <!-- Центр: текущий файл -->
        <span id="currentFile"
              class="font-semibold text-xs sm:text-sm text-pink-700 dark:text-pink-300
                     truncate max-w-[24vw] sm:max-w-[18vw]">
            —
        </span>

        <div class="flex flex-row items-center gap-2">
            <!-- Кнопка включения/выключения редактора -->
            <div class="flex items-center gap-2">
            <span class="hidden md:block text-xs text-slate-500 dark:text-slate-300 select-none">
                Code
            </span>

                <button
                        id="toggleCodeEditor"
                        type="button"
                        role="switch"
                        aria-checked="false"
                        class="relative inline-flex h-5 w-11 items-center rounded-full
                           bg-slate-300 dark:bg-slate-600 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                           dark:focus:ring-offset-slate-900"
                        title="Включение редактора кода"
                >
            <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow
                         transition-transform translate-x-0.5" data-knob></span>
                </button>

                <span id="codeEditorState"
                      class="text-xs text-slate-500 dark:text-slate-300 select-none">
                OFF
            </span>
            </div>

            <!-- Право: Save -->
            <button id="save"
                    class="bg-teal-600 hover:bg-teal-500 text-white text-xs
                           px-1.5 py-1.5 rounded whitespace-nowrap flex items-center justify-center gap-2"
                    title="Сохранить">
                <svg class="w-4 h-4"
                     xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
                    <path class="fill-current text-slate-100"
                          d="M22.707,6.707,17.293,1.293A1,1,0,0,0,16.586,1H4A3,3,0,0,0,1,4V20a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V7.414A1,1,0,0,0,22.707,6.707ZM14.5,4h1a.5.5,0,0,1,.5.5v4a.5.5,0,0,1-.5.5h-1a.5.5,0,0,1-.5-.5v-4A.5.5,0,0,1,14.5,4ZM19,12.5v6a.5.5,0,0,1-.5.5H5.5a.5.5,0,0,1-.5-.5v-6a.5.5,0,0,1,.5-.5h13A.5.5,0,0,1,19,12.5Z"></path>
                </svg>
            </button>
        </div>
    </div>

    <!-- PANEL: Editor -->
    <div id="panelEditor" class="flex-1 min-h-0 flex">
        <textarea
                id="editor"
                class="flex-1 w-full p-3 sm:p-4 font-mono text-xs sm:text-sm outline-none resize-none
                       bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Выберите файл слева..."></textarea>
    </div>

    <!-- PANEL: SEO (сюда seo.js рендерит форму) -->
    <div id="panelSeo" class="flex-1 min-h-0 hidden overflow-auto p-3 sm:p-4">
        <div id="seoForm"></div>
    </div>

</main>
