<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { redirectIfLoggedIn } from '$lib/shortcuts';
    import { type Section } from './type';
    import {saveSection} from './repo';
    
    export let modelOpen:boolean;
    export let isAdd:boolean;
    export let section:Section;
    export let languageID:number;

    let isLoading: boolean = false;

    const dispatch = createEventDispatcher();
    onMount(async () => {
      await redirectIfLoggedIn(''); 
    });
  
    function closeModal()
    {
        dispatch('close');
    }

    async function addSection()
    {
        isLoading = true;
        section.languageID = languageID;
        let response = await saveSection(section);
        if(response.isSuccess == true)
        {
            alert(response.message);
            closeModal();
            dispatch('refresh')
        }
        else
        {
            isLoading = false;
            alert(response.message);
        }
    }
  </script>
  
  {#if modelOpen}
    <div 
      class="fixed inset-0 z-50 overflow-y-auto" 
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true">
      
      <div class="flex items-end justify-center mt-20 px-4 text-center md:items-center sm:block sm:p-0">
        
        <div 
          on:click={closeModal}
          class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-40" 
          aria-hidden="true"
        ></div>
  
        <div 
          class="inline-block w-full max-w-xl p-8 my-20 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl 2xl:max-w-2xl"
          style="opacity: {modelOpen ? 1 : 0}; transform: {modelOpen ? 'translateY(0)' : 'translateY(4rem)'};"
        >
          <div class="flex items-center justify-between space-x-4">
            <h1 class="text-xl font-medium text-gray-800">{isAdd ? "Create Section" : "Edit Section"}</h1>
  
            <button 
              on:click={closeModal}
                class="text-gray-600 focus:outline-none hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
          </div>
  
          <form class="mt-5">
            <div>
                <label for="email" class="block text-sm text-black capitalize dark:text-black">Section Number</label>
                <input autocomplete="off" bind:value={section.sectionNumber} id="email" min = 1 type="number" class="block w-full px-3 py-2 mt-2 text-gray-600 placeholder-gray-400 bg-white border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40">

              </div>

              <div class="mt-4">
                <label for="username" class="block text-sm text-black capitalize dark:text-black">Title</label>
              <input autocomplete="off" bind:value={section.title} id="username" placeholder="Section Title" type="text" class="block w-full px-3 py-2 mt-2 text-gray-600 placeholder-gray-400 bg-white border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40">
            </div>
  
            <div class="mt-4">
              <label for="email" class="block text-sm text-black capitalize dark:text-black">Description</label>
              <textarea 
                id="email"
                autocomplete="off" 
                placeholder="This section is for..." 
                bind:value={section.description} 
                class="block w-full px-3 py-2 mt-2 text-gray-600 placeholder-gray-400 bg-white border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40"
            ></textarea>
            </div>
            
            <div class="mt-4">  
                <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" bind:checked={section.isPremium} class="sr-only peer">
                      <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 
                      peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                      peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                      after:start-[2px] after:bg-white after:border-gray-300 after:border 
                      after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                      peer-checked:bg-gradient-to-r peer-checked:from-[#6addd0] peer-checked:to-[#f7c188]">
                  </div>
                    <span class="ms-3 text-sm font-medium text-black dark:text-black">Premium Section</span>
                  </label>
            </div>
            
            <div class="flex justify-end mt-6">
              <button on:click={addSection} type="button" disabled={isLoading || (section.sectionNumber == 0 && section.description == null && section.title == null)} style="border-image: linear-gradient(to right, #6addd0, #f7c188) 1; border-width: 2px;"

              class={'border-transparent bg-white text-black hover:bg-gradient-to-r from-[#6addd0] to-[#f7c188] hover:text-white px-4 py-2 text-sm tracking-wide capitalize transition-colors duration-200 transform rounded-md focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-50'}>
                {isLoading ? "Saving..." : "Save Section"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}
  