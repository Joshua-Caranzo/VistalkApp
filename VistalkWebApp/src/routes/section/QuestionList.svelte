<script lang="ts">
    import { redirectIfLoggedIn } from "$lib/shortcuts";
    import { createEventDispatcher, onMount } from "svelte";
    import type {
        QuestionDto,
        QuestionType,
        Content,
        MultipleChoice,
    } from "./type";
    import {
        getQuesions,
        getQuestionTypes,
        getMultipleChoice,
        getChoices,
        getQuestionFile,
        questionInactive,
        getMatchingType,
    } from "./repo";
    import AddQuestionPopup from "./AddQuestionPopup.svelte";
    import type { Language } from "../type";
    import type { CallResultDto } from "../../types/types";
    import Pagination from "$lib/components/Pagination.svelte";
    import MatchingType from "$lib/components/MatchingType.svelte";
    import MatchingTypeEng from "$lib/components/MatchingTypeEng.svelte";
    import MultipleChoiceEng from "$lib/components/MultipleChoiceEng.svelte";
    import MultipleChoiceNat from "$lib/components/MultipleChoiceNat.svelte";
    import type {
        QuestionMatchingTypeDto,
        QuestionMultipleDto,
    } from "$lib/api/componentType";
    import MainLoader from "$lib/components/MainLoader.svelte";
    import Loader from "$lib/components/Loader.svelte";
    import { getLanguages } from "../user/repo";

    export let languageId: number;
    export let unitId: number;

    let languageType: Language[] = [];
    let questionTypes: QuestionType[] = [];
    let showModal: boolean = false;
    let isAdd: boolean = false;
    let pageNo: number = 1;
    let fileUrl: string = "";
    let question: QuestionDto;
    let searchString: string | null = null;
    let questionList: QuestionDto[] = [];
    let currentType: number = 0;
    let showNativeMultiple: boolean = false;
    let showEnglishMultiple: boolean = false;
    let showMatchingType: boolean = false;
    let showMatchingTypeEng: boolean = false;
    let contents: Content[] = [];
    let multiple: MultipleChoice;
    let searchQueries: string[] = ["", "", "", ""];
    let fileType: "audio" | "image" | null = null;
    let leftQueries = ["", "", "", ""];
    let rightQueries = ["", "", "", ""];
    let selectedChoices: (Content | undefined)[] = [];
    let mainQuestion: QuestionMultipleDto = {
        questionID: 0,
        imagePath: null,
        audioPath: null,
        questionText: "",
        file: null,
        questionTypeID: 0,
        unitId: unitId,
        choice1: 0,
        choice2: 0,
        choice3: 0,
        choice4: 0,
        correctChoice: 0,
    };
    let matchQuestion: QuestionMatchingTypeDto = {
        questionID: 0,
        questionText: "",
        questionTypeID: 0,
        unitId: unitId,
        word1: 0,
        word2: 0,
        word3: 0,
        word4: 0,
        match1: 0,
        match2: 0,
        match3: 0,
        match4: 0,
    };
    let questionCallResult: CallResultDto<QuestionDto[]> = {
        message: "",
        data: [],
        isSuccess: true,
        data2: [],
        totalCount: 0,
    };
    let isloading = false;
    const dispatch = createEventDispatcher();

    onMount(async () => {
        await redirectIfLoggedIn("");
        await refresh();
        const questionTypeCallResult = await getQuestionTypes();
        questionTypes = questionTypeCallResult.data;
        const languageCallResult = await getLanguages();
        languageType = languageCallResult.data;
    });

    async function refresh() {
        isloading = true;
        questionCallResult = await getQuesions(unitId, pageNo, searchString);
        questionList = questionCallResult.data;
        isloading = false;
    }

    function handlePageChange(event: CustomEvent) {
        const selectElement = event.detail as HTMLSelectElement;
        pageNo = parseInt(selectElement.toString());
        refresh();
    }

    function initalizeQuestion() {
        question = {
            questionID: 0,
            questionText: "",
            imagePath: "",
            audioPath: "",
            questionTypeID: 0,
            unitId: unitId,
            typeName: "",
        };
    }

    function openModal(check: boolean, quest: QuestionDto | null) {
        showModal = true;
        isAdd = check;

        if (quest) question = quest;
        else initalizeQuestion();
    }

    $: {
        if (searchString != null) refresh();
    }

    function closeModal() {
        showModal = false;
        showEnglishMultiple = false;
        showNativeMultiple = false;
        showMatchingType = false;
        showMatchingTypeEng = false;
        initalizeQuestion();
        refresh();
    }

    function goBackToUnit() {
        dispatch("back");
    }

    async function editQuestion(quest: QuestionDto) {
        currentType = quest.questionTypeID;
        const contentListCallResult = await getChoices(languageId);
        contents = contentListCallResult.data;
        if (currentType !== 0) {
            mainQuestion.questionID = quest.questionID;
            matchQuestion.questionID = quest.questionID;
            mainQuestion.questionTypeID = currentType;
            matchQuestion.questionTypeID = currentType;
            mainQuestion.audioPath = quest.audioPath;
            mainQuestion.imagePath = quest.imagePath;
            switch (currentType) {
                case 2:
                    const result = await getMultipleChoice(quest.questionID);
                    multiple = result.data;
                    mainQuestion.choice1 = multiple.choice1;
                    mainQuestion.choice2 = multiple.choice2;
                    mainQuestion.choice3 = multiple.choice3;
                    mainQuestion.choice4 = multiple.choice4;
                    mainQuestion.correctChoice = multiple.correctChoice;
                    mainQuestion.questionText = quest.questionText;
                    searchQueries = [
                        mapChoiceToContentText(mainQuestion.choice1),
                        mapChoiceToContentText(mainQuestion.choice2),
                        mapChoiceToContentText(mainQuestion.choice3),
                        mapChoiceToContentText(mainQuestion.choice4),
                    ];

                    if (mainQuestion.imagePath != null) {
                        fileUrl = mainQuestion.audioPath;
                        mainQuestion.file = new File(
                            [fileUrl],
                            mainQuestion.audioPath,
                            { type: "image/png" },
                        );

                        fileType = "image";
                    } else if (mainQuestion.audioPath != null) {
                        fileUrl = mainQuestion.audioPath;
                        mainQuestion.file = new File(
                            [fileUrl],
                            mainQuestion.audioPath,
                            { type: "audio/wav" },
                        );

                        fileType = "audio";
                    }

                    showNativeMultiple = true;
                    showEnglishMultiple = false;
                    showMatchingTypeEng = false;
                    showMatchingType = false;
                    break;
                case 1:
                    const Engresult = await getMultipleChoice(quest.questionID);
                    multiple = Engresult.data;
                    mainQuestion.choice1 = multiple.choice1;
                    mainQuestion.choice2 = multiple.choice2;
                    mainQuestion.choice3 = multiple.choice3;
                    mainQuestion.choice4 = multiple.choice4;
                    mainQuestion.correctChoice = multiple.correctChoice;
                    mainQuestion.questionText = quest.questionText;
                    searchQueries = [
                        mapChoiceToPronunciation(mainQuestion.choice1),
                        mapChoiceToPronunciation(mainQuestion.choice2),
                        mapChoiceToPronunciation(mainQuestion.choice3),
                        mapChoiceToPronunciation(mainQuestion.choice4),
                    ];

                    if (mainQuestion.imagePath != null) {
                        fileUrl = mainQuestion.audioPath;
                        mainQuestion.file = new File(
                            [fileUrl],
                            mainQuestion.audioPath,
                            { type: "image/png" },
                        );

                        fileType = "image";
                    } else if (mainQuestion.audioPath != null) {
                        fileUrl = mainQuestion.audioPath;
                        mainQuestion.file = new File(
                            [fileUrl],
                            mainQuestion.audioPath,
                            { type: "audio/wav" },
                        );

                        fileType = "audio";
                    }

                    showNativeMultiple = false;
                    showEnglishMultiple = true;
                    showMatchingTypeEng = false;
                    showMatchingType = false;
                    break;
                case 4:
                    const resultMatchEnglish = await getMatchingType(
                        quest.questionID,
                    );
                    matchQuestion = resultMatchEnglish.data;

                    rightQueries = [
                        mapChoiceToContentText(matchQuestion.word1),
                        mapChoiceToContentText(matchQuestion.word2),
                        mapChoiceToContentText(matchQuestion.word3),
                        mapChoiceToContentText(matchQuestion.word4),
                    ];
                    leftQueries = [
                        mapChoiceToPronunciation(matchQuestion.match1),
                        mapChoiceToPronunciation(matchQuestion.match2),
                        mapChoiceToPronunciation(matchQuestion.match3),
                        mapChoiceToPronunciation(matchQuestion.match4),
                    ];
                    selectedChoices = [
                        matchQuestion.word1
                            ? contents.find(
                                  (choice) =>
                                      choice.contentID === matchQuestion.word1,
                              )
                            : undefined,
                        matchQuestion.word2
                            ? contents.find(
                                  (choice) =>
                                      choice.contentID === matchQuestion.word2,
                              )
                            : undefined,
                        matchQuestion.word3
                            ? contents.find(
                                  (choice) =>
                                      choice.contentID === matchQuestion.word3,
                              )
                            : undefined,
                        matchQuestion.word4
                            ? contents.find(
                                  (choice) =>
                                      choice.contentID === matchQuestion.word4,
                              )
                            : undefined,
                    ];
                    matchQuestion.questionText = quest.questionText;

                    showNativeMultiple = false;
                    showEnglishMultiple = false;
                    showMatchingTypeEng = true;
                    showMatchingType = false;
                    break;
                case 3:
                    const resultMatch = await getMatchingType(quest.questionID);
                    matchQuestion = resultMatch.data;

                    leftQueries = [
                        mapChoiceToContentText(matchQuestion.word1),
                        mapChoiceToContentText(matchQuestion.word2),
                        mapChoiceToContentText(matchQuestion.word3),
                        mapChoiceToContentText(matchQuestion.word4),
                    ];
                    rightQueries = [
                        mapChoiceToPronunciation(matchQuestion.match1),
                        mapChoiceToPronunciation(matchQuestion.match2),
                        mapChoiceToPronunciation(matchQuestion.match3),
                        mapChoiceToPronunciation(matchQuestion.match4),
                    ];
                    selectedChoices = [
                        matchQuestion.word1
                            ? contents.find(
                                  (choice) =>
                                      choice.contentID === matchQuestion.word1,
                              )
                            : undefined,
                        matchQuestion.word2
                            ? contents.find(
                                  (choice) =>
                                      choice.contentID === matchQuestion.word2,
                              )
                            : undefined,
                        matchQuestion.word3
                            ? contents.find(
                                  (choice) =>
                                      choice.contentID === matchQuestion.word3,
                              )
                            : undefined,
                        matchQuestion.word4
                            ? contents.find(
                                  (choice) =>
                                      choice.contentID === matchQuestion.word4,
                              )
                            : undefined,
                    ];
                    matchQuestion.questionText = quest.questionText;
                    showNativeMultiple = false;
                    showEnglishMultiple = false;
                    showMatchingTypeEng = false;
                    showMatchingType = true;
                    break;
                default:
                    break;
            }
        }
    }

    function mapChoiceToContentText(choiceId: number): string {
        const content = contents.find((c) => c.contentID === choiceId);
        return content ? content.contentText : "";
    }

    function mapChoiceToPronunciation(choiceId: number): string {
        const content = contents.find((c) => c.contentID === choiceId);
        return content ? content.englishTranslation : "";
    }

    async function setInactive(questionID: number, unitID: number) {
        const userConfirmed = confirm(
            "Do you want to continue? You are about to delete this item. Yes or No?",
        );
        if (userConfirmed) {
            await questionInactive(questionID, unitID);
            refresh();
        } else {
            console.log("cancelled");
        }
    }
</script>

<svelte:head>
    <title>Questions</title>
</svelte:head>
{#if showModal}
    <AddQuestionPopup
        {languageId}
        {questionTypes}
        {unitId}
        {showModal}
        on:close={closeModal}
        on:refresh={refresh}
    ></AddQuestionPopup>
{/if}
{#if showEnglishMultiple === true}
    <MultipleChoiceEng
        modelOpen={showEnglishMultiple}
        choices={contents}
        {mainQuestion}
        {searchQueries}
        {fileType}
        {fileUrl}
        on:close={closeModal}
    ></MultipleChoiceEng>
{/if}
{#if showNativeMultiple === true}
    <MultipleChoiceNat
        modelOpen={showNativeMultiple}
        choices={contents}
        {mainQuestion}
        {searchQueries}
        {fileType}
        {fileUrl}
        on:close={closeModal}
    ></MultipleChoiceNat>
{/if}
{#if showMatchingType === true}
    <MatchingType
        modelOpen={showMatchingType}
        choices={contents}
        mainQuestion={matchQuestion}
        {leftQueries}
        {rightQueries}
        {selectedChoices}
        on:close={closeModal}
    ></MatchingType>
{/if}
{#if showMatchingTypeEng === true}
    <MatchingTypeEng
        modelOpen={showMatchingTypeEng}
        choices={contents}
        mainQuestion={matchQuestion}
        {leftQueries}
        {rightQueries}
        {selectedChoices}
        on:close={closeModal}
    ></MatchingTypeEng>
{/if}

<button class="bg-black rounded-lg p-1" on:click={goBackToUnit}
    ><svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.2em"
        height="1.2em"
        viewBox="0 0 512 512"
        ><path
            fill="none"
            stroke="white"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="48"
            d="M244 400L100 256l144-144M120 256h292"
        /></svg
    ></button
>
<div
    class="gap-6 flex flex-col sm:flex-row justify-between items-center mt-1 bg-white rounded-xl py-4 px-4 shadow-lg"
>
    <p class="font-['Helvetica'] text-black text-xl font-bold">Question List</p>
    <div class="flex-grow flex justify-center">
        <div
            class="flex items-center border border-[#B9B9B9] rounded-xl px-12 py-1 bg-white"
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
    <div class="flex gap-4">
        <button
            on:click={() => openModal(true, null)}
            class="flex items-center font-['Helvetica'] bg-white text-black py-2 px-3 rounded-xl text-sm shadow-lg hover:bg-[#6addd0] transform hover:scale-110 transition-transform duration-300"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="text-black mr-2"
                width="1.5em"
                height="1.5em"
                viewBox="0 0 24 24"
                ><path
                    fill="currentColor"
                    d="M13 6.5V11h4.5v2H13v4.5h-2V13H6.5v-2H11V6.5z"
                /></svg
            >
            Add Question
        </button>
    </div>
</div>

<div class="mt-6 overflow-x-auto">
    <table class="bg-white w-full shadow-lg rounded-xl min-w-[640px]">
        <thead
            class="font-['Cambria'] bg-gradient-to-r from-[#6addd0] to-[#f7c188] text-white text-center"
        >
            <tr class="first:rounded-t-xl last:rounded-b-xl">
                <th class="px-4 py-2 first:rounded-tl-xl last:rounded-tr-xl"
                    >Questions</th
                >
                <th class="px-4 py-2">Question Type</th>
                <th class="px-4 py-2 first:rounded-tl-xl last:rounded-tr-xl"
                    >Action</th
                >
            </tr>
        </thead>
        <tbody class="text-center text-sm">
            {#if isloading}
                <Loader isVisible={isloading} message={"Loading..."} colspan={4}
                ></Loader>
            {:else if questionCallResult.totalCount != null && questionCallResult.totalCount > 0}
                {#each questionList as q}
                    <tr class="border-t-2 mx-4">
                        <td class="px-4 py-2">{q.questionText}</td>
                        <td class="px-4 py-2">{q.typeName}</td>
                        <td
                            class="flex justify-center items-center px-4 py-2 gap-4"
                        >
                            <button on:click={() => editQuestion(q)}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1.5em"
                                    height="1.5em"
                                    viewBox="0 0 24 24"
                                    ><g
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        ><path
                                            d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                        /><path
                                            d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"
                                        /></g
                                    ></svg
                                >
                            </button>
                            <button
                                on:click={() =>
                                    setInactive(q.questionID, q.unitId)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1.5em"
                                    height="1.5em"
                                    viewBox="0 0 24 24"
                                    ><path
                                        fill="currentColor"
                                        d="M7 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h4a1 1 0 1 1 0 2h-1.069l-.867 12.142A2 2 0 0 1 17.069 22H6.93a2 2 0 0 1-1.995-1.858L4.07 8H3a1 1 0 0 1 0-2h4zm2 2h6V4H9zM6.074 8l.857 12H17.07l.857-12zM10 10a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1m4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1"
                                    /></svg
                                >
                            </button>
                        </td>
                    </tr>
                {/each}
            {:else}
                <tr class="border-t-2 mx-4">
                    <td class="px-4 py-2" colspan="6"
                        >No Questions Found on Units</td
                    >
                </tr>
            {/if}
        </tbody>
    </table>
</div>
{#if questionCallResult.totalCount}
    <Pagination
        totalCount={questionCallResult.totalCount}
        {pageNo}
        on:handlePageChange={handlePageChange}
    ></Pagination>
{/if}

<style>
    tbody tr:hover {
        background-color: #e0e0e0;
    }
</style>
