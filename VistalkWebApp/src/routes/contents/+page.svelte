<script lang="ts">
    import { redirectIfLoggedIn } from "$lib/shortcuts";
    import { onMount } from "svelte";
    import AddContent from "./AddContent.svelte";
    import type {
        Content,
        ContentDto,
        ContentType,
        DefinitionDto,
        ExampleDto,
        SyllableDto,
    } from "./type";
    import type { CallResultDto } from "../../types/types";
    import type { Language } from "../type";
    import { getLanguages } from "../user/repo";
    import {
        contentInactived,
        getContentById,
        getContents,
        getContentTypes,
        getDefinitionByContentId,
        getExamplesByContentId,
        getSyllablesByContentId,
    } from "./repo";
    import Pagination from "$lib/components/Pagination.svelte";
    import Loader from "$lib/components/Loader.svelte";
    import { tr } from "date-fns/locale";

    let isAdd: boolean = false;
    let modelOpen: boolean = false;
    let currentValue: number = 1;
    let content: ContentDto;
    let pageNo: number = 1;
    let searchString: string | null = null;
    let contentTypes: ContentType[] = [];
    let fileName: string = "";
    let isSyllable: boolean;
    let languageCallResult: CallResultDto<Language[]> = {
        message: "",
        data: [],
        isSuccess: true,
        data2: [],
        totalCount: 0,
    };
    let languages: Language[] = [];
    let contentListCallResult: CallResultDto<Content[]> = {
        message: "",
        data: [],
        isSuccess: true,
        data2: [],
        totalCount: 0,
    };
    let contents: Content[] = [];
    let currentType: number | null = null;
    let isloading: boolean = false;

    onMount(async () => {
        isloading = true;
        await redirectIfLoggedIn("");
        languageCallResult = await getLanguages();
        languages = languageCallResult.data;
        const contentTypeCallResult = await getContentTypes();
        contentTypes = contentTypeCallResult.data;
        await refresh();
        isloading = false;
    });

    function openAddSection() {
        modelOpen = true;
        isAdd = true;
        initializeContent();
    }

    async function refresh() {
        try {
            isloading = true;
            contentListCallResult = await getContents(
                currentValue,
                currentType,
                searchString,
                pageNo,
            );
            contents = contentListCallResult.data;
            for (const c of contents) {
                if (c.audioPath && c.audioPath.toLowerCase().endsWith(".wav")) {
                    const url = c.audioPath;
                    c.audio = new Audio(url);

                    c.audio.addEventListener("ended", () => {
                        c.isPlaying = false;
                        const index = contents.findIndex(
                            (content) => content.contentID === c.contentID,
                        );
                        if (index !== -1) {
                            contents[index] = {
                                ...contents[index],
                                isPlaying: false,
                            };
                        }
                    });
                } else {
                    console.warn(
                        `Skipping ${c.audioPath}: Not a valid WAV file or audioPath is null.`,
                    );
                    c.audio = null;
                }
            }
            contents = [...contents];
        } catch {
            console.log("Error");
        } finally {
            isloading = false;
        }
    }

    function closeModal() {
        modelOpen = false;
    }

    function initializeContent() {
        let contentMain: Content = {
            contentID: 0,
            languageID: currentValue,
            contentText: "",
            englishTranslation: "",
            audioPath: "",
            contentTypeId: 0,
            isInDictionary: false,
            forPronunciation: false,
            audio: null,
            file: null,
            isPlaying: false,
        };

        let syllables: SyllableDto[] = [];
        let definitions: DefinitionDto[] = [];
        let examples: ExampleDto[] = [];
        content = {
            content: contentMain,
            syllables,
            definitions,
            examples,
        };
    }

    function handlePageChange(event: CustomEvent) {
        const selectElement = event.detail as HTMLSelectElement;
        pageNo = parseInt(selectElement.toString());
        refresh();
    }

    async function clickEdit(id: number) {
        const contentMainCallResult = await getContentById(id);
        const syllableListCallResult = await getSyllablesByContentId(id);
        const definitionListCallResult = await getDefinitionByContentId(id);
        const exampleListCallResult = await getExamplesByContentId(id);
        let syllables = syllableListCallResult.data;
        let definitions = definitionListCallResult.data;
        let examples = exampleListCallResult.data;
        let contentMain = contentMainCallResult.data;

        if (
            contentMain.audioPath &&
            contentMain.audioPath.toLowerCase().endsWith(".wav")
        ) {
            const url = contentMain.audioPath;
            contentMain.audio = new Audio(url);

            // Setting up event listener for when audio ends
            contentMain.audio.addEventListener("ended", () => {
                contentMain.isPlaying = false;
            });
        } else {
            contentMain.audio = null; // Handle cases where the audioPath is invalid or null
        }
        for (const c of syllables) {
            if (c.audioPath && c.audioPath.toLowerCase().endsWith(".wav")) {
                try {
                    const url = c.audioPath;

                    c.file = new File([url], c.audioPath, {
                        type: "audio/wav",
                    });

                    c.audio = new Audio(url);

                    c.audio.addEventListener("ended", () => {
                        c.isPlaying = false;
                        const index = syllables.findIndex(
                            (syllable) => syllable.id === c.id,
                        );
                        if (index !== -1) {
                            contents[index] = {
                                ...contents[index],
                                isPlaying: false,
                            };
                        }
                    });
                } catch (error) {
                    console.error(
                        `Failed to fetch file for ${c.audioPath}:`,
                        error,
                    );
                    c.audio = null;
                }
            } else {
                console.warn(
                    `Skipping ${c.audioPath}: Not a valid WAV file or audioPath is null.`,
                );
                c.audio = null;
            }
        }
        syllables = [...syllables];
        content = {
            content: contentMain,
            syllables,
            definitions,
            examples,
        };
        modelOpen = true;
        isAdd = false;
    }

    $: {
        if (searchString != null) {
            refresh();
        }
    }

    function togglePlay(c: Content) {
        if (c.audio) {
            if (c.audio.paused) {
                for (const content of contents) {
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

            const index = contents.findIndex(
                (content) => content.contentID === c.contentID,
            );
            if (index !== -1) {
                contents[index] = {
                    ...contents[index],
                    isPlaying: c.isPlaying,
                };
            }
        }
    }

    async function setInactive(id: number) {
        const userConfirmed = confirm(
            "Do you want to continue? You are about to delete this item. Yes or No?",
        );
        if (userConfirmed) {
            await contentInactived(id);
            refresh();
        } else {
            console.log("Action canceled by the user.");
        }
    }
</script>

<svelte:head>
    <title>Contents</title>
</svelte:head>

{#if modelOpen}
    <AddContent
        {modelOpen}
        {isAdd}
        languageId={currentValue}
        {content}
        on:close={closeModal}
        on:refresh={refresh}
    ></AddContent>
{/if}

<div
    class="flex flex-col sm:flex-row justify-between items-center mt-1 bg-white rounded-xl py-4 px-4 shadow-lg"
>
    <p class="font-['Helvetica'] text-black text-xl sm:text-lg font-bold">
        Content List
    </p>
    <div class="flex gap-4 mt-4 sm:mt-0">
        <div
            class="flex items-center border border-black rounded-xl px-12 py-1 bg-white"
        >
            <input
                type="text"
                bind:value={searchString}
                placeholder="Search"
                class="outline-none text-gray-600 placeholder-gray text-sm sm:text-base"
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
                        stroke="black"
                        stroke-linecap="round"
                    />
                </svg>
            </button>
        </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
        <!-- Language Select -->
        <select
            bind:value={currentValue}
            on:change={refresh}
            class="w-full sm:w-auto font-['Helvetica'] bg-white text-black py-2 px-3 rounded-xl text-sm shadow-lg"
        >
            {#each languages as lang}
                <option class="py-2 hover:bg-[#f7c188]" value={lang.languageID}
                    >{lang.name}</option
                >
            {/each}
        </select>

        <!-- Content Type Select -->
        <select
            bind:value={currentType}
            on:change={refresh}
            class="w-full sm:w-auto font-['Helvetica'] bg-white text-black py-2 px-3 rounded-xl text-sm shadow-lg"
        >
            <option class="py-2" value={null}>Select Content Type</option>
            {#each contentTypes as conts}
                <option class="py-2" value={conts.contentTypeID}
                    >{conts.typeName}</option
                >
            {/each}
        </select>

        <div class="flex gap-4">
            <button
                on:click={openAddSection}
                class="flex items-center font-['Helvetica'] bg-white text-black py-2 px-3 rounded-xl text-sm shadow-lg hover:bg-[#6addd0] transform hover:scale-110 transition-transform duration-300"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="text-black mr-2"
                    width="1.5em"
                    height="1.5em"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="currentColor"
                        d="M13 6.5V11h4.5v2H13v4.5h-2V13H6.5v-2H11V6.5z"
                    />
                </svg>
                Add Content
            </button>
        </div>
    </div>
</div>

<div class="mt-6 overflow-x-auto">
    <table class="bg-white w-full shadow-lg rounded-xl min-w-[640px]">
        <thead
            class="font-['Cambria'] bg-gradient-to-r from-[#6addd0] to-[#f7c188] text-white text-center"
        >
            <tr class="first:rounded-tl-xl last:rounded-b-xl">
                <th class="py-3 px-4 first:rounded-tl-xl last:rounded-tr-xl"
                    >Content</th
                >
                <th class="py-3 px-4">English Translation</th>
                <th class="py-3 px-4">Audio</th>
                <th class="py-3 px-4 first:rounded-tl-xl last:rounded-tr-xl"
                    >Actions</th
                >
            </tr>
        </thead>
        <tbody class="text-center text-sm">
            {#if isloading}
                <Loader isVisible={isloading} message={"Loading..."} colspan={4}
                ></Loader>
            {:else if contents.length != 0}
                {#each contents as c}
                    <tr class="border-t-2 mx-4">
                        <td class="py-3 px-4">{c.contentText}</td>
                        <td class="py-3 px-4">{c.englishTranslation}</td>
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
                        <td class="px-1 py-1">
                            <button on:click={() => clickEdit(c.contentID)}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1.5em"
                                    height="1.5em"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fill="black"
                                        d="M15.49 7.3h-1.16v6.35H1.67V3.28H8V2H1.67A1.21 1.21 0 0 0 .5 3.28v10.37a1.21 1.21 0 0 0 1.17 1.25h12.66a1.21 1.21 0 0 0 1.17-1.25z"
                                    />
                                    <path
                                        fill="black"
                                        d="M10.56 2.87L6.22 7.22l-.44.44l-.08.08l-1.52 3.16a1.08 1.08 0 0 0 1.45 1.45l3.14-1.53l.53-.53l.43-.43l4.34-4.36l.45-.44l.25-.25a2.18 2.18 0 0 0 0-3.08a2.17 2.17 0 0 0-1.53-.63a2.2 2.2 0 0 0-1.54.63l-.7.69l-.45.44zM5.51 11l1.18-2.43l1.25 1.26zm2-3.36l3.9-3.91l1.3 1.31L8.85 9zm5.68-5.31a.9.9 0 0 1 .65.27a.93.93 0 0 1 0 1.31l-.25.24l-1.3-1.3l.25-.25a.88.88 0 0 1 .69-.25z"
                                    />
                                </svg>
                            </button>
                            <button on:click={() => setInactive(c.contentID)}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1.5em"
                                    height="1.5em"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M7 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h4a1 1 0 1 1 0 2h-1.069l-.867 12.142A2 2 0 0 1 17.069 22H6.93a2 2 0 0 1-1.995-1.858L4.07 8H3a1 1 0 0 1 0-2h4zm2 2h6V4H9zM6.074 8l.857 12H17.07l.857-12zM10 10a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1m4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1"
                                    />
                                </svg>
                            </button>
                        </td>
                    </tr>
                {/each}
            {:else}
                <tr class="border-t-2 mx-4">
                    <td class="px-4 py-2" colspan="4">No Contents Found</td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

{#if contentListCallResult.totalCount}
    <Pagination
        totalCount={contentListCallResult.totalCount}
        {pageNo}
        on:handlePageChange={handlePageChange}
    ></Pagination>
{/if}

<style>
    tbody tr:hover {
        background-color: #e0e0e0;
    }
</style>
