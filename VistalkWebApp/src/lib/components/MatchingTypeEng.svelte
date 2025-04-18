<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Content } from "../../routes/section/type";
  import type { QuestionMatchingTypeDto } from "$lib/api/componentType";
  import { save_questionMatch } from "$lib/api/componentRepo";

  export let modelOpen: boolean;
  export let choices: Content[];
  export let mainQuestion: QuestionMatchingTypeDto;
  export let leftQueries: string[];
  export let rightQueries: string[];
  export let selectedChoices: (Content | undefined)[];
  const dispatch = createEventDispatcher();

  let filteredChoices: Content[] = [];
  let dropdownVisibility = Array(leftQueries.length).fill(false);
  let isLoading: boolean = false;
  function closeModal() {
    dispatch("close");
  }

  function getFilteredChoices(query: string, side: "left" | "right") {
    return choices
      .filter((choice) => {
        if (side === "left") {
          return choice.englishTranslation
            .toLowerCase()
            .includes(query.toLowerCase());
        } else {
          return choice.contentText.toLowerCase().includes(query.toLowerCase());
        }
      })
      .slice(0, 5);
  }

  function selectChoice(choice: Content, index: number) {
    selectedChoices[index] = choice;
    if (index < leftQueries.length) {
      leftQueries[index] = choice.englishTranslation;
      rightQueries[index] = choice.contentText;
    } else {
      leftQueries[index - leftQueries.length] = choice.englishTranslation;
      rightQueries[index - leftQueries.length] = choice.contentText;
    }
    dropdownVisibility[index] = false;
  }

  async function saveContent() {
    isLoading = true;

    // Assign values, but don't default to 0
    const word1 = selectedChoices[0]?.contentID ?? null;
    const word2 = selectedChoices[1]?.contentID ?? null;
    const word3 = selectedChoices[2]?.contentID ?? null;
    const word4 = selectedChoices[3]?.contentID ?? null;

    // Check if any value is null
    if (
      word1 === null ||
      word2 === null ||
      word3 === null ||
      word4 === null ||
      word1 == 0 ||
      word2 == 0 ||
      word3 == 0 ||
      word4 == 0
    ) {
      alert("Please ensure all fields are filled before saving.");
      isLoading = false;
      return; // Exit function without saving
    }

    // Assign to mainQuestion only if validation passes
    mainQuestion.word1 = word1;
    mainQuestion.word2 = word2;
    mainQuestion.word3 = word3;
    mainQuestion.word4 = word4;
    mainQuestion.match1 = word1;
    mainQuestion.match2 = word2;
    mainQuestion.match3 = word3;
    mainQuestion.match4 = word4;

    // Save and close modal
    await save_questionMatch(mainQuestion);
    await closeModal();

    isLoading = false;
  }

  function handleInputChange(
    index: number,
    side: "left" | "right",
    event: Event,
  ) {
    const target = event.target as HTMLInputElement;
    if (side === "left") {
      leftQueries[index] = target.value;
    } else {
      rightQueries[index] = target.value;
    }
    filteredChoices = getFilteredChoices(target.value, side);
    dropdownVisibility[index] = true;
  }

  function closeAllDropdowns() {
    dropdownVisibility = dropdownVisibility.map(() => false);
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".relative")) {
      closeAllDropdowns();
    }
  }

  window.addEventListener("click", handleClickOutside);

  import { onDestroy } from "svelte";
  onDestroy(() => {
    window.removeEventListener("click", handleClickOutside);
  });
</script>

{#if modelOpen}
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
        class="inline-block w-full max-w-xl p-8 my-20 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl 2xl:max-w-2xl"
        style="opacity: {modelOpen ? 1 : 0}; transform: {modelOpen
          ? 'translateY(0)'
          : 'translateY(4rem)'};"
      >
        <div class="flex items-center justify-between space-x-4">
          <h1 class="text-xl font-medium text-gray-800">
            Matching Type (English Matches)
          </h1>
          <button
            on:click={closeModal}
            class="text-gray-600 focus:outline-none hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        <form class="mt-5">
          <div class="mt-5">
            <label
              for="question"
              class="block text-sm text-black capitalize dark:text-black"
              >Question</label
            >
            <textarea
              bind:value={mainQuestion.questionText}
              id="question"
              placeholder="Question"
              class="block w-full px-3 py-2 mt-2 text-gray-600 placeholder-gray-400 bg-white border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40"
            ></textarea>
          </div>

          {#each [1, 2, 3, 4] as i (i)}
            <div class="mt-4 relative flex items-center">
              <!-- Matching Question Inputs -->
              <div class="relative w-full flex items-center space-x-2">
                <input
                  id="choice-left-{i}"
                  type="text"
                  autocomplete="off"
                  placeholder={`Match ${i}`}
                  bind:value={leftQueries[i - 1]}
                  on:input={(event) => handleInputChange(i - 1, "left", event)}
                  class="block w-1/2 px-3 py-2 text-gray placeholder-gray bg-white border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40"
                />
                <span class="text-gray-600">=</span>
                <input
                  id="choice-right-{i}"
                  type="text"
                  autocomplete="off"
                  placeholder={`Answer ${i}`}
                  value={rightQueries[i - 1]}
                  readonly
                  class="block w-1/2 px-3 py-2 text-gray placeholder-gray bg-white border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40"
                />
              </div>

              {#if leftQueries[i - 1].length > 0 && dropdownVisibility[i - 1]}
                <ul
                  class="absolute left-2 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10 top-full list-none"
                >
                  {#each getFilteredChoices(leftQueries[i - 1], "left") as choice}
                    <li
                      class="px-3 py-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                      on:click={() => selectChoice(choice, i - 1)}
                    >
                      {choice.englishTranslation}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/each}

          <div class="flex justify-end mt-6">
            <button
              on:click={saveContent}
              type="button"
              disabled={isLoading || (mainQuestion.questionText == null && mainQuestion.word1 == null && mainQuestion.word2 == null && mainQuestion.word3 == null && mainQuestion.word4 == null)}
              style="border-image: linear-gradient(to right, #6addd0, #f7c188) 1; border-width: 2px;"
              class={"border-transparent bg-white text-black hover:bg-gradient-to-r from-[#6addd0] to-[#f7c188] hover:text-white px-4 py-2 text-sm tracking-wide capitalize transition-colors duration-200 transform rounded-md focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-50"}
            >
              {isLoading ? "Saving..." : "Save Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}
