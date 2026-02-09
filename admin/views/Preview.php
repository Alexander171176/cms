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

            <a id="home" href="/index.html" title="На главную" class="ml-1.5">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                    <path class="fill-current text-blue-700 dark:text-blue-300"
                          d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z"/>
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
