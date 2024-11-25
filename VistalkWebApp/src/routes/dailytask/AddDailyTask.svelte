<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import type { DailyTaskDto, DailyTaskType, PowerUp } from "./type";
    import { getDailyTaskTypes, saveDailyTask } from "./repo";

    export let modalOpen: boolean;
    export let isAdd: boolean;
    export let dailyTask: DailyTaskDto;
    export let powerUps: PowerUp[];

    let dailyTaskTypes: DailyTaskType[] = [];
    let isLoading: boolean = false;
    const today = new Date().toISOString().split('T')[0];

    const dispatch = createEventDispatcher();

    onMount(async () => {
        const dailyTaskTypeCallResult = await getDailyTaskTypes();
        dailyTaskTypes = dailyTaskTypeCallResult.data;
    });
    async function saveTask() {
        if (dailyTask.taskDate == null) {
            alert("Please input date");
            return;
        }

        if (dailyTask.rewardCoins >= 1 && dailyTask.quantity >= 1) {
            isLoading = true;
            await saveDailyTask(dailyTask);
            isLoading = false;
            closeModal();
        } else {
            alert("Reward Coins and Quantity should have a minimum value of 1");
            return;
        }
    }
    function closeModal() {
        dispatch("close");
    }
</script>

{#if modalOpen}
    <div
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
    >
        <div
            class="flex items-end justify-center mt-20 px-4 text-center md:items-center sm:block sm:p-0"
        >
            <div
                on:click={closeModal}
                class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-40"
                aria-hidden="true"
            ></div>
            <div
                class="inline-block w-full max-w-xl p-8 my-20 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl 2xl:max-w-2xl"
                style="opacity: {modalOpen ? 1 : 0}; transform: {modalOpen
                    ? 'translateY(0)'
                    : 'translateY(4rem)'};"
            >
                <div class="flex items-center justify-between space-x-4">
                    <h1 class="text-xl font-medium text-gray-800">
                        {isAdd ? "Create Daily Task" : "Edit Daily Task"}
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
                    <div class="mt-2">
                        <label
                            for="email"
                            class="block text-sm text-black capitalize dark:text-black"
                            >Daily Task Type</label
                        >
                        <select
                            bind:value={dailyTask.taskTypeId}
                            class="w-full text-center p-2 border border-gray-300 rounded-md mt-2"
                        >
                            <option value={0} class="text-left"
                                >--SELECT--</option
                            >
                            {#each dailyTaskTypes as taskType}
                                <option class="text-left" value={taskType.id}
                                    >{taskType.typeName}</option
                                >
                            {/each}
                        </select>
                    </div>
                    {#if dailyTask.taskTypeId == 2}
                        <div class="mt-2">
                            <label
                                for="email"
                                class="block text-sm text-black capitalize dark:text-black"
                                >Specify Power Up</label
                            >
                            <select
                                bind:value={dailyTask.powerUpId}
                                class="w-full text-center p-2 border border-gray-300 rounded-md mt-2"
                            >
                                <option value={0} class="text-left"
                                    >--SELECT--</option
                                >
                                {#each powerUps as p}
                                    <option class="text-left" value={p.itemID}
                                        >{p.name}</option
                                    >
                                {/each}
                            </select>
                        </div>
                    {/if}
                    <div class="mt-2">
                        <label
                            for="email"
                            class="block text-sm text-black capitalize dark:text-black"
                            >Reward Coins</label
                        >
                        <input
                            autocomplete="off"
                            bind:value={dailyTask.rewardCoins}
                            min="1"
                            id="email"
                            type="number"
                            placeholder="Reward Coins"
                            class="block w-full px-3 py-2 mt-2 text-gray-600 placeholder-gray-400 bg-white border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40"
                        />
                    </div>
                    <div class="mt-2">
                        <label
                            for="taskDate"
                            class="block text-sm text-black capitalize dark:text-black"
                            >Task Date</label
                        >
                        <input
                            autocomplete="off"
                            disabled={!isAdd}
                            bind:value={dailyTask.taskDate}
                            id="email"
                            type="date"
                            min={today}
                            placeholder="Task Date"
                            class="block w-full px-3 py-2 mt-2 text-gray-600 placeholder-gray-400 bg-white border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40"
                        />
                    </div>
                    <div class="mt-2">
                        <label
                            for="email"
                            class="block text-sm text-black capitalize dark:text-black"
                            >Goal Number</label
                        >
                        <input
                            autocomplete="off"
                            bind:value={dailyTask.quantity}
                            min="1"
                            id="email"
                            type="number"
                            placeholder="Goal Number"
                            class="block w-full px-3 py-2 mt-2 text-gray-600 placeholder-gray-400 bg-white border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40"
                        />
                    </div>
                    <div class="flex justify-end mt-6">
                        <button
                            on:click={saveTask}
                            type="button"
                            disabled={isLoading}
                            style="border-image: linear-gradient(to right, #6addd0, #f7c188) 1; border-width: 2px;"
                            class={"border-transparent bg-white text-black hover:bg-gradient-to-r from-[#6addd0] to-[#f7c188] hover:text-white px-4 py-2 text-sm tracking-wide capitalize transition-colors duration-200 transform rounded-md focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-50"}
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}
