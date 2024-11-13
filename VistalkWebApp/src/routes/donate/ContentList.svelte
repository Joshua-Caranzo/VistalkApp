<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { Content } from "./types";
    import { getContents } from "./repo";

    export let contents: Content[] = [];
    export let currentLanguage: number;

    let searchString: string | null = "";
    let pageNo: number = 1;
    let totalPages: number = 1;
    const dispatch = createEventDispatcher();

    async function refresh() {
        const contentListCallResult = await getContents(
            currentLanguage,
            1,
            searchString,
            pageNo,
        );
        contents = contentListCallResult.data;
        if (contentListCallResult.totalCount)
            totalPages = Math.ceil(contentListCallResult.totalCount / 10);
    }

    function closeModal() {
        dispatch("close");
    }

    refresh();

    function handleSearchChange(event: Event) {
        searchString = (event.target as HTMLInputElement).value;
        pageNo = 1;
        refresh();
    }

    function goToPage(newPageNo: number) {
        if (newPageNo > 0 && newPageNo <= totalPages) {
            pageNo = newPageNo;
            refresh();
        }
    }

    async function selectContent(content: Content) {
        dispatch("select", content);
        closeModal();
    }
</script>

<div
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
>
    <div
        class="flex items-end justify-center min-h-screen px-4 text-center md:items-center sm:block sm:p-0"
    >
        <div
            on:click={closeModal}
            class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-40"
            aria-hidden="true"
        ></div>

        <div
            class="inline-block max-w-lg p-6 my-20 overflow-hidden text-left transition-all transform bg-white rounded-xl shadow-xl 2xl:max-w-6xl"
        >
            <div class="flex items-center justify-between space-x-4">
                <h1 class="text-xl font-medium text-gray-800">
                    Search For Words
                </h1>
                <div class="flex items-center border border-gray-300 rounded-xl p-2">
                    <input
                    type="text"
                    placeholder="Search..."
                    bind:value={searchString}
                    on:input={handleSearchChange}
                    class="outline-none text-gray-500 placeholder-gray"
                />
                <svg xmlns="http://www.w3.org/2000/svg" class="text-gray-300 h-6 w-6" viewBox="0 0 12 12" fill="none">
                    <path d="M8.46342 8.52L10.2 10.2M5.69999 3.6C6.6941 3.6 7.49999 4.40589 7.49999 5.4M9.63999 5.72C9.63999 7.88496 7.88494 9.64 5.71999 9.64C3.55503 9.64 1.79999 7.88496 1.79999 5.72C1.79999 3.55505 3.55503 1.8 5.71999 1.8C7.88494 1.8 9.63999 3.55505 9.63999 5.72Z" stroke="currentColor" stroke-linecap="round"/>
                </svg>
                </div> 
            </div>

            <div class="mt-4">
                <ul>
                    {#each contents as content}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <li
                            class="p-2 border-b border-gray-200 hover:cursor-pointer"
                            on:click={() => selectContent(content)}
                        >
                            {content.contentText}
                        </li>
                    {/each}
                </ul>
            </div>
            <div class="mt-4 flex justify-center items-center">
                <button
                    on:click={() => goToPage(pageNo - 1)}
                    disabled={pageNo <= 1}
                    class="p-2 rounded-full shadow-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                        bg-gradient-to-r from-[#6addd0] to-[#f7c188]
                        text-white hover:scale-110 transition-transform duration-300"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path fill="none" stroke="#fff" stroke-width="2" d="M17 2L7 12l10 10"/>
                </svg>
                </button>

                <span class="mx-4">Page {pageNo} of {totalPages}</span>

                <button
                    on:click={() => goToPage(pageNo + 1)}
                    disabled={pageNo >= totalPages}
                    class="p-2 rounded-full shadow-sm 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        bg-gradient-to-r from-[#6addd0] to-[#f7c188] 
                        text-white hover:scale-110 transition-transform duration-300"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path fill="none" stroke="#fff" stroke-width="2" d="m7 2l10 10L7 22"/>
                </svg>
                </button>
            </div>
        </div>
    </div>
</div>
