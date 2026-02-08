<aside id="preview"
       data-state="open"
       class="
       hidden lg:flex
       w-[340px]
       border-l border-slate-400 dark:border-slate-200
       bg-slate-200 dark:bg-slate-800 backdrop-blur
       flex-col transition-all duration-200
  ">

    <div class="h-12 px-0.5 flex items-center justify-between
               border-b border-slate-400 dark:border-slate-200">

        <div class="flex items-center gap-1">

            <button id="previewReload"
                    class="px-1.5 py-1.5 rounded border border-slate-400 dark:border-slate-200
                           bg-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800
                           flex items-center justify-center gap-2 ml-2"
                    title="Перезагрузить окно просмотра">
                <svg class="w-4 h-4"
                     xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
                    <path class="fill-current text-amber-600 dark:text-amber-300"
                          d="M23.625,5.219l-5-4A1,1,0,0,0,17,2V5H4A3,3,0,0,0,1,8v3a1,1,0,0,0,2,0V8A1,1,0,0,1,4,7H17v3a1,1,0,0,0,1.625.781l5-4a1,1,0,0,0,0-1.562Z"></path>
                    <path class="fill-current text-amber-600 dark:text-amber-300"
                          d="M22,12a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H7V14a1,1,0,0,0-1.625-.781l-5,4a1,1,0,0,0,0,1.562l5,4A1,1,0,0,0,7,22V19H20a3,3,0,0,0,3-3V13A1,1,0,0,0,22,12Z"></path>
                </svg>
            </button>

            <a href="/index.html" title="На главную" class="ml-1.5">
                <svg class="w-4 h-4"
                     xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
                    <path class="fill-current text-blue-700 dark:text-blue-300"
                          d="M21.707,9.293L12.707,.293c-.391-.39-1.024-.39-1.414,0L2.293,9.293c-.187,.187-.293,.442-.293,.707v11c0,1.657,1.343,3,3,3h14c1.657,0,3-1.343,3-3V10c0-.265-.105-.519-.293-.707Zm-9.707-1.293c1.105,0,2,.895,2,2s-.895,2-2,2-2-.895-2-2,.895-2,2-2Zm4,10H8c-.552,0-1-.447-1-1s.448-1,1-1h8c.552,0,1,.447,1,1s-.448,1-1,1Z"></path>
                </svg>
            </a>

        </div>
        <div class="flex items-center gap-1">

            <button id="previewFull"
                    class="w-7 h-7 inline-flex items-center justify-center rounded
                           border border-slate-400 dark:border-slate-200 bg-white hover:bg-slate-50
                           dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    title="Fullscreen preview">
                ⛶
            </button>

            <button id="previewCollapse"
                    class="w-7 h-7 inline-flex items-center justify-center rounded
                           border border-slate-400 dark:border-slate-200 bg-white hover:bg-slate-50
                           dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    title="Collapse preview">
                ▶
            </button>
        </div>
    </div>

    <div class="preview-body flex-1 p-2">
        <iframe
                id="previewFrame"
                class="w-full h-full rounded border border-slate-400 dark:border-slate-200 bg-white"
                src="../index.html"
        ></iframe>
    </div>
</aside>
