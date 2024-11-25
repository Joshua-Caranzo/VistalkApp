<script lang="ts">
    import LineChart from "$lib/components/LineChart.svelte";
    import Piechart from "$lib/components/Piechart.svelte";
    import { onMount } from "svelte";
    import type { LeaderBoardDto, SalesDto, StatusDto, UserLanguage } from "./types";
    import { getLeaderBoards, getRatingData, getStatusVista, getSubscriptionData, getTotalSales, getUserLanguage, salesReport, salesReportCoinBags, salesReportSusbcription } from "./repo";
    import LineChartRating from "$lib/components/LineChartRating.svelte";

    let leaderboardData: LeaderBoardDto[] = [];
    let inActiveData: StatusDto | undefined;
    let activeInactiveData: { name: string; y: number }[] = [];
    let userLanguage: UserLanguage[] = []; 
    let languageUsageData: { name: string; y: number }[] = [];
    const subscriptionCategories = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const subscriptionData: { name: string; data: number[] }[] = [];
    const ratingData: { name: string; data: number[] }[] = [];
    let totalAmountPaid: number = 0;
    let granularOptions = ["Daily", "Weekly", "Monthly", "Yearly", "All Time"];
    let selectedGranular = granularOptions[0];
    let selectedGranularLeaderBoard = granularOptions[0];
    let selectedGranularCoinBag = granularOptions[0];
    let selectedGranularSubscription = granularOptions[0];
    let subscriptionSalesTotal:number = 0;
    let coinBagSales:number = 0;
    let types = ["Coin bag", "Subscription", "All Items"];
    let selectedType = types[2];
    let selectedTableGranular = granularOptions[0];
    let isOpen = false;
    let totalSales:SalesDto[]=[];
    const ratingCategories = ['1', '2', '3', '4', '5'];


    onMount(loadData);

    async function loadData() {
        const leaderboardResult = await getLeaderBoards(selectedGranularLeaderBoard);
        leaderboardData = leaderboardResult.data || [];  

        const statusResult = await getStatusVista();
        inActiveData = statusResult.data;
        activeInactiveData = inActiveData ? [
            { name: 'Active Users', y: inActiveData.active },
            { name: 'Inactive Users', y: inActiveData.inactive },
        ] : [];

        const languageResult = await getUserLanguage();
        userLanguage = languageResult.data || [];
        languageUsageData = userLanguage.map(language => ({
            name: language.languageName,
            y: language.userCount,
        }));

        const subscriptionResults = await getSubscriptionData();
        subscriptionData.length = 0;

        subscriptionResults.data.forEach(row => {
            const monthIndex = row.month - 1;
            const typeName = row.type;

            let typeEntry = subscriptionData.find(item => item.name === typeName);
            if (!typeEntry) {
                typeEntry = { name: typeName, data: Array(12).fill(0) };
                subscriptionData.push(typeEntry);
            }
            typeEntry.data[monthIndex] = row.subscriptionCount || 0;
        });

        const ratingResults = await getRatingData();
        ratingData.length = 0;

        const vistasCount = Array(5).fill(0); 

            ratingResults.data.forEach(row => {
                const ratingValue =  Number(row.type); 
                const count = row.ratingCount || 0; 

                if (ratingValue >= 1 && ratingValue <= 5) {
                    vistasCount[ratingValue - 1] += count; 
                }
            });

            ratingData.push({
                name: 'Number of Vistas',
                data: vistasCount 
            });

        const totalPaidResult = await salesReport(selectedGranular);
        totalAmountPaid = totalPaidResult.data;

        const coinBagResult = await salesReportCoinBags(selectedGranularCoinBag);
        coinBagSales = coinBagResult.data;

        const subscriptionResult = await salesReportSusbcription(selectedGranularSubscription);
        subscriptionSalesTotal = subscriptionResult.data;

        const totalSalesResult = await getTotalSales(selectedTableGranular, selectedType);
        totalSales = totalSalesResult.data;
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12; 
        hours = hours ? hours : 12; 
        
        return `${month}-${day}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }

</script>
<svelte:head>
  <title>Dashboard</title>
</svelte:head>
<div>
    <div class="gap-4 flex flex-col sm:flex-row justify-between items-center mt-1 bg-white rounded-xl py-4 px-4 shadow-lg">
        <p class="font-['Helvetica'] text-black text-xl font-bold">Dashboard</p>
    </div>

    <div class="flex flex-col lg:flex-row mt-4">
        <div class="flex-1 pr-4 space-y-4">
            <div class="flex flex-col sm:flex-row justify-between gap-4">
                <div class="bg-white rounded-lg p-4 shadow-lg flex-1">
                    {#if activeInactiveData.length > 0} 
                    <Piechart chartTitle="Active vs Inactive Users" data={activeInactiveData} />
                    {/if}
                </div>
                <div class="bg-white rounded-lg p-4 shadow-lg flex-1">
                    {#if languageUsageData.length > 0} 
                    <Piechart chartTitle="Language Usage" data={languageUsageData} />
                    {/if}
                </div>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-lg mt-6">
                {#if subscriptionData.length > 0 && subscriptionCategories.length > 0 }
                <LineChart 
                    chartTitle="Monthly Subscription Types" 
                    categories={subscriptionCategories} 
                    seriesData={subscriptionData}
                />
                {/if}
            </div>

            <div class="bg-white rounded-lg p-4 shadow-lg mt-6">
                {#if ratingData.length > 0 && ratingCategories.length > 0}
                    <LineChartRating 
                        chartTitle="Ratings" 
                        categories={ratingCategories} 
                        seriesData={ratingData}
                    />
                {/if}
            </div>
        </div>

        <div class="w-full lg:w-[35%] bg-gradient-to-r from-[#6addd0] to-[#f7c188] rounded-xl py-4 px-4 shadow-lg mt-4 lg:mt-0"> 
            <div class="flex justify-between items-center mb-4"> 
                <div class="flex-grow">
                    <p class="text-xl font-bold">Leaderboard</p>
                </div>
                <select id="granular" bind:value={selectedGranularLeaderBoard} on:change={loadData} class="select bg-transparent">
                    {#each granularOptions as option}
                        <option value={option}>{option}</option>
                    {/each}
                </select>
            </div>
            <ul class="space-y-2">
                {#each leaderboardData as user, index} 
                    <li class={`flex justify-between items-center rounded-lg p-2 transition duration-200 
                        ${index === 0 ? 'bg-gradient-to-r from-[#FFD43B] to-[#FF8800]' : 
                          index === 1 ? 'bg-gradient-to-r from-[#F8F6F4] to-[#4B4C4B]' : 
                          index === 2 ? 'bg-gradient-to-r from-[#F9931F] to-[#AE5129]' : 
                          'bg-white'}`}>
                        <span class="font-semibold text-black">{index + 1}. {user.name}</span>
                        <span class="text-black font-bold">{user.totalScore || 0}</span>
                    </li>
                {/each}
            </ul>
        </div>        
    </div>

    <div class="flex flex-col sm:flex-row flex-wrap mt-4 gap-4">
        <div class="w-full sm:w-[33%] pr-4">
            <div class="bg-white rounded-lg p-4 shadow-lg flex flex-col">
                <div class="flex justify-between items-center mb-4"> 
                    <div class="flex-grow">
                        <p class="text-xl font-bold"> 
                            Total Sales
                        </p>
                    </div>
                    <select id="granular" bind:value={selectedGranular} on:change={loadData} class="select">
                        {#each granularOptions as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>
                <p class="mt-4 text-xl font-bold text-center"> 
                   <span>₱ {totalAmountPaid}</span>
                </p>
            </div>
        </div>

        <div class="w-full sm:w-[33%] pr-4">
            <div class="bg-white rounded-lg p-4 shadow-lg flex flex-col">
                <div class="flex justify-between items-center mb-4"> 
                    <div class="flex-grow">
                        <p class="text-xl font-bold"> 
                            Total Coin Bag Sales
                        </p>
                    </div>
                    <select id="granular" bind:value={selectedGranularCoinBag} on:change={loadData} class="select">
                        {#each granularOptions as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>
                <p class="mt-4 text-xl font-bold text-center"> 
                   <span>₱ {coinBagSales}</span>
                </p>
            </div>
        </div>
        <div class="w-full sm:w-[32%] pr-4">
            <div class="bg-white rounded-lg p-4 shadow-lg flex flex-col">
                <div class="flex justify-between items-center mb-4"> 
                    <div class="flex-grow">
                        <p class="text-xl font-bold"> 
                            Total Subscription Sales
                        </p>
                    </div>
                    <select id="granular" bind:value={selectedGranularSubscription} on:change={loadData} class="select">
                        {#each granularOptions as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>
                <p class="mt-4 text-xl font-bold text-center"> 
                   <span>₱ {subscriptionSalesTotal}</span>
                </p>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-lg p-4 shadow-lg mt-4">
        <div class="flex justify-between items-center">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <p class="text-xl font-bold cursor-pointer" on:click={() => isOpen = !isOpen}>
                {#if isOpen} ▼ Transactions {:else} ▲ Transactions {/if}
            </p>
            {#if isOpen}
                <div class="flex gap-2">
                    <select bind:value={selectedType} on:change={loadData} class="select">
                        {#each types as type}
                            <option value={type}>{type}</option>
                        {/each}
                    </select>
                    <select bind:value={selectedTableGranular} on:change={loadData} class="select">
                        {#each granularOptions as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>
            {/if}
        </div>
        {#if isOpen}
        <div class="overflow-x-auto mt-4">
            <table class="w-full shadow-lg rounded-xl min-w-[640px]">
                <thead class="font-['Cambria'] bg-gradient-to-r from-[#6addd0] to-[#f7c188] text-white text-center">
                    <tr>
                        <th class="px-4 py-2 first:rounded-tl-xl last:rounded-tr-xl">Vista</th>
                        <th class="px-4 py-2">Amount Paid</th>
                        <th class="px-4 py-2">Item Name</th>
                        <th class="px-4 py-2">Item Type</th>
                        <th class="px-4 py-2 first:rounded-tl-xl last:rounded-tr-xl">Transaction Date</th>
                    </tr>
                </thead>
                <tbody class="text-center text-sm">
                    {#if totalSales.length}
                        {#each totalSales as u}
                            <tr class="border-t-2">
                                <td class="px-4 py-2">{u.name}</td>
                                <td class="px-4 py-2">₱ {u.amountPaid}</td>
                                <td class="px-4 py-2">{u.itemName}</td>
                                <td class="px-4 py-2">{u.itemType}</td>
                                <td class="px-4 py-2">{formatDate(u.transactionDate)}</td>
                            </tr>
                        {/each}
                    {:else}
                        <tr><td colspan="5" class="text-gray-500 py-4">No data available</td></tr>
                    {/if}
                </tbody>
            </table>
        </div>
        {/if}
    </div>
</div>

