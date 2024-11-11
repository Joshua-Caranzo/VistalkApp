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

    async function selectContent(content:Content)
    {
        dispatch('select', content);
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
            class="inline-block max-w-lg p-6 my-20 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl 2xl:max-w-6xl"
        >
            <div class="flex items-center justify-between space-x-4">
                <h1 class="text-xl font-medium text-gray-800">
                    Search For Words
                </h1>
                <input
                    type="text"
                    placeholder="Search..."
                    bind:value={searchString}
                    on:input={handleSearchChange}
                    class="border border-gray-300 rounded p-2"
                />
            </div>

            <div class="mt-4">
                <ul >
                    {#each contents as content}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <li class="p-2 border-b border-gray-200" on:click={() => selectContent(content)}>
                            {content.contentText}
                        </li>
                    {/each}
                </ul>
            </div>
            <div class="mt-4 flex justify-between">
                <button
                    on:click={() => goToPage(pageNo - 1)}
                    disabled={pageNo <= 1}
                    class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Previous
                </button>

                <span>Page {pageNo} of {totalPages}</span>

                <button
                    on:click={() => goToPage(pageNo + 1)}
                    disabled={pageNo >= totalPages}
                    class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
</div>
