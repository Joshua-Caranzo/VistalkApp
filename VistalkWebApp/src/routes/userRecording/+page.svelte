<script lang="ts">
    import { redirectIfLoggedIn } from "$lib/shortcuts";
    import { onMount } from "svelte";
    import type { Language, FileData } from "./types";
    import type { CallResultDto } from "../../types/types";
    import Pagination from "$lib/components/Pagination.svelte";
    import { getItemFileByFileName } from "../shop/repo";
    import Loader from "$lib/components/Loader.svelte";
    import {
        acceptFile,
        getFileContents,
        getLanguages,
        getRecordingByFileName,
        rejectFile,
    } from "./repo";

    let contentList: FileData[] = [];
    let pageNo: number = 1;
    let searchString: string | null = null;
    let isloading: boolean = false;
    let languages: Language[] = [];
    let languageId: number = 1;
    let contentsCallResult: CallResultDto<FileData[]> = {
        message: "",
        data: [],
        isSuccess: true,
        data2: [],
        totalCount: 0,
    };

    onMount(async () => {
        await redirectIfLoggedIn("");
        await refresh();
    });

    function handlePageChange(event: CustomEvent) {
        const selectElement = event.detail as HTMLSelectElement;
        pageNo = parseInt(selectElement.toString());
        refresh();
    }

    async function refresh() {
        isloading = true;
        const languageCallResult = await getLanguages();
        languages = languageCallResult.data;
        contentsCallResult = await getFileContents(
            pageNo,
            searchString,
            languageId,
        );
        contentList = contentsCallResult.data;

        for (const c of contentList) {
            if (c.fileName && c.fileName.toLowerCase().endsWith(".wav")) {
                const file = await getRecordingByFileName(
                    c.fileName,
                    languageId,
                    c.contentId,
                    c.contentText,
                );
                if (file) {
                    const url = URL.createObjectURL(file);
                    c.audio = new Audio(url);

                    c.audio.addEventListener("ended", () => {
                        c.isPlaying = false;
                        const index = contentList.findIndex(
                            (content) => content.id,
                        );
                        if (index !== -1) {
                            contentList[index] = {
                                ...contentList[index],
                                isPlaying: false,
                            };
                        }
                    });
                } else {
                    c.audio = null;
                }
            } else {
                console.warn(
                    `Skipping ${c.fileName}: Not a valid WAV file or audioPath is null.`,
                );
                c.audio = null;
            }
        }
        contentList = [...contentList];

        isloading = false;
    }

    $: {
        if (searchString != null) refresh();
    }

    function togglePlay(c: FileData) {
        if (c.audio) {
            if (c.audio.paused) {
                for (const content of contentList) {
                    if (content.audio && !content.audio.paused) {
                        content.audio.pause();
                        content.isPlaying = false;
                    }
                }
                c.audio.play();
                c.isPlaying = true;
            } else {
                c.audio.pause();
                c.isPlaying = false;
            }

            const index = contentList.findIndex(
                (content) => content.id === c.id,
            );
            if (index !== -1) {
                contentList[index] = {
                    ...contentList[index],
                    isPlaying: c.isPlaying,
                };
            }
        }
    }

    async function acceptData(id: number) {
        const isConfirmed = confirm(
            "Are you sure you want to accept this data?",
        );
        if (isConfirmed) {
            await acceptFile(id);
            await refresh();
        }
    }

    async function rejectData(id: number) {
        const isConfirmed = confirm(
            "Are you sure you want to reject this data?",
        );
        if (isConfirmed) {
            await rejectFile(id);
            await refresh();
        }
    }
</script>

<div
    class="gap-4 flex flex-col sm:flex-row justify-between items-center mt-1 bg-white rounded-xl py-4 px-4 shadow-lg"
>
    <p class="font-['Helvetica'] text-black text-xl font-bold">
        Recording List
    </p>
    <div class="flex-grow flex justify-center">
        <div
            class="flex items-center border border-black rounded-xl px-12 py-1 bg-white"
        >
            <input
                type="text"
                bind:value={searchString}
                placeholder="Search"
                class="outline-none text-gray-600 placeholder-gray"
            />
            <button>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="text-black"
                    width="1.5em"
                    height="1.5em"
                    viewBox="0 0 12 12"
                    fill="none"
                >
                    <path
                        d="M8.46342 8.52L10.2 10.2M5.69999 3.6C6.6941 3.6 7.49999 4.40589 7.49999 5.4M9.63999 5.72C9.63999 7.88496 7.88494 9.64 5.71999 9.64C3.55503 9.64 1.79999 7.88496 1.79999 5.72C1.79999 3.55505 3.55503 1.8 5.71999 1.8C7.88494 1.8 9.63999 3.55505 9.63999 5.72Z"
                        stroke="#000000"
                        stroke-linecap="round"
                    />
                </svg>
            </button>
        </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
        <!-- Language Select -->
        <select
            bind:value={languageId}
            on:change={refresh}
            class="w-full sm:w-auto font-['Helvetica'] bg-white text-black py-2 px-3 rounded-xl text-sm shadow-lg"
        >
            {#each languages as lang}
                <option class="py-2 hover:bg-[#f7c188]" value={lang.languageID}
                    >{lang.name}</option
                >
            {/each}
        </select>
    </div>
</div>

<div class="mt-6 overflow-x-auto">
    <table class="bg-white w-full shadow-lg rounded-xl min-w-[640px]">
        <thead
            class="font-['Cambria'] bg-gradient-to-r from-[#6addd0] to-[#f7c188] text-white text-center"
        >
            <tr class="first:rounded-t-xl last:rounded-b-xl">
                <th class="px-4 py-2 first:rounded-tl-xl last:rounded-tr-xl"
                    >Content</th
                >
                <th class="px-4 py-2">Audio</th>
                <th class="px-4 py-2 first:rounded-tl-xl last:rounded-tr-xl"
                    >Actions</th
                >
            </tr>
        </thead>
        <tbody class="text-center text-sm">
            {#if isloading}
                <Loader isVisible={isloading} message={"Loading..."} colspan={5}
                ></Loader>
            {:else if contentList.length != 0}
                {#each contentList as c}
                    <tr class="border-t-2 mx-4">
                        <td class="px-4 py-2">{c.contentText}</td>
                        <td class="py-3 px-4">
                            {#if c.audio}
                                <button
                                    on:click={() => togglePlay(c)}
                                    class="bg-gradient-to-r from-[#6addd0] to-[#f7c188] text-white py-1 px-2 rounded-xl"
                                >
                                    {#if c.isPlaying}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="1.2rem"
                                            height="1.2rem"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill="white"
                                                d="M6 19h4V5H6zm8-14v14h4V5z"
                                            />
                                        </svg>
                                    {:else}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="1.2rem"
                                            height="1.2rem"
                                            viewBox="0 0 256 256"
                                        >
                                            <g fill="white">
                                                <path
                                                    d="M228.23 134.69L84.15 222.81A8 8 0 0 1 72 216.12V39.88a8 8 0 0 1 12.15-6.69l144.08 88.12a7.82 7.82 0 0 1 0 13.38"
                                                    opacity="0.2"
                                                />
                                                <path
                                                    d="M232.4 114.49L88.32 26.35a16 16 0 0 0-16.2-.3A15.86 15.86 0 0 0 64 39.87v176.26A15.94 15.94 0 0 0 80 232a16.07 16.07 0 0 0 8.36-2.35l144.04-88.14a15.81 15.81 0 0 0 0-27ZM80 215.94V40l143.83 88Z"
                                                />
                                            </g>
                                        </svg>
                                    {/if}
                                </button>
                            {/if}
                        </td>
                        <td class="px-4 py-2">
                            <button on:click={() => acceptData(c.id)}> <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z"/></svg> </button>
                            <button on:click={() => rejectData(c.id)}> <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24"><path fill="currentColor" d="M7 11v2h10v-2zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8"/></svg> </button>
                        </td>
                    </tr>
                {/each}
            {:else}
                <tr
                    ><td colspan="5" class="text-gray-500 py-4"
                        >No data available</td
                    ></tr
                >
            {/if}
        </tbody>
    </table>
</div>
{#if contentsCallResult.totalCount}
    <Pagination
        totalCount={contentsCallResult.totalCount}
        {pageNo}
        on:handlePageChange={handlePageChange}
    ></Pagination>
{/if}
