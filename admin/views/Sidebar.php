<aside id="sidebar"
       data-state="open"
       class="
              fixed inset-y-0 left-0 z-50 w-80 md:w-80
              bg-slate-100 text-slate-800
              dark:bg-slate-900 dark:text-slate-200
              border-r border-slate-400 dark:border-slate-200
              transform -translate-x-full transition-all duration-200
              md:static md:translate-x-0 flex flex-col
  ">

    <div class="h-12 px-3 flex items-center justify-between font-semibold
                border-b border-slate-400 dark:border-slate-200 bg-slate-200 dark:bg-slate-800">

        <div class="flex items-center gap-2">
            <!-- collapse/expand (md+) -->
            <button id="sidebarCollapse"
                    class="hidden md:inline-flex w-7 h-7 items-center justify-center rounded
                           border border-slate-400 dark:border-slate-200
                           bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700"
                    title="Collapse sidebar">
                ◀
            </button>

            <!-- close (mobile) -->
            <button id="sidebarClose"
                    class="md:hidden w-7 h-7 inline-flex items-center justify-center rounded
                           border border-slate-400 dark:border-slate-200
                           bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700"
                    aria-label="Close sidebar">
                ✕
            </button>
        </div>

        <div class="sidebar-title text-teal-600 dark:text-teal-400">CMS Pulsar</div>

        <a href="/admin/auth/logout.php" title="Выйти" class="ml-1.5">
            <svg class="w-4 h-4"
                 xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
                <path class="fill-current text-blue-700 dark:text-blue-300"
                      d="M23.625,9.219l-5-4A1,1,0,0,0,17,6V9H11a1,1,0,0,0,0,2h6v3a1,1,0,0,0,1.625.781l5-4a1,1,0,0,0,0-1.562Z"></path>
                <path class="fill-current text-blue-700 dark:text-blue-300"
                      d="M13,7a1,1,0,0,0,1-1V1a1,1,0,0,0-1-1H1A1,1,0,0,0,0,1V18a1,1,0,0,0,.419.814l7,5A.988.988,0,0,0,8,24a1.019,1.019,0,0,0,.458-.11A1,1,0,0,0,9,23V19h4a1,1,0,0,0,1-1V14a1,1,0,0,0-2,0v3H9V6.016A1,1,0,0,0,8.583,5.2L4.112,2H12V6A1,1,0,0,0,13,7Z"></path>
            </svg>
        </a>
    </div>

    <div class="sidebar-body flex-1 overflow-y-auto p-3 space-y-4
                max-h-[calc(100vh-3rem)]">

        <div>
            <div class="text-center text-xs uppercase tracking-wider
                        text-blue-700 dark:text-blue-300 font-semibold mb-2">
                Project
            </div>
            <ul id="projectTree" class="space-y-1"></ul>
        </div>

    </div>
</aside>
