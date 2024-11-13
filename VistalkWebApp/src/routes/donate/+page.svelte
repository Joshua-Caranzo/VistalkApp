<script lang="ts">
  import { onMount } from "svelte";
  import type { CallResultDto } from "../../types/types";
  import { getContents, getContentsAll, getLanguages, saveAudio } from "./repo";
  import type { Content, Language } from "./types";
  import ContentList from "./ContentList.svelte";
    import { goto } from "$app/navigation";

  let isRecording = false;
  let isPlaying = false;
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let audioUrl: string | null = null;
  let audio: HTMLAudioElement | null = null;
  let currentValue: number = 1;
  let languageCallResult: CallResultDto<Language[]> = {
    message: "",
    data: [],
    isSuccess: true,
    data2: [],
    totalCount: 0,
  };
  let isloading = false;
  let languages: Language[] = [];
  let contentListCallResult: CallResultDto<Content[]> = {
    message: "",
    data: [],
    isSuccess: true,
    data2: [],
    totalCount: 0,
  };
  let contents: Content[] = [];
  let contentsList: Content[] = [];
  let currentType: number = 1;
  let searchString: string | null = null;
  let pageNo = 1;
  let randomContent: Content;
  let showSearch = false;
  let currentAudio: HTMLAudioElement | null = null;
  let messageString: string | null = null;
  let currentAudioBlob: Blob;
  let resultString: string | null = null;

  onMount(async () => {
    await refresh();
  });

  async function refresh() {
    try {
      isloading = true;
      languageCallResult = await getLanguages();
      languages = languageCallResult.data;
      contentListCallResult = await getContents(
        currentValue,
        currentType,
        searchString,
        pageNo,
      );
      contents = contentListCallResult.data;
      const result = await getContentsAll(currentValue);
      contentsList = result.data;
      resultString = null;
      messageString = null;
    } catch {
      console.log("Error");
    } finally {
      isloading = false;
    }
  }

  async function toggleRecording() {
    messageString = "";
    if (isRecording) {
      mediaRecorder?.stop();
      isRecording = false;
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        currentAudioBlob = new Blob(audioChunks, { type: "audio/wav" });
        audioUrl = URL.createObjectURL(currentAudioBlob);
        currentAudio = new Audio(audioUrl);

        const isSilent = await checkIfSilent(currentAudioBlob);
        if (isSilent) {
          messageString = "Recording is too silent. Please try again.";
          audioChunks = [];
        } else {
          messageString = null;
        }
      };

      mediaRecorder.start();
      isRecording = true;
    }
  }

  async function checkIfSilent(audioBlob: Blob): Promise<boolean> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new OfflineAudioContext(
      1,
      arrayBuffer.byteLength,
      44100,
    );
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const dataArray = new Float32Array(analyser.frequencyBinCount);

    source.start();
    await audioContext.startRendering();

    analyser.getFloatFrequencyData(dataArray);

    const silenceThreshold = -120;
    const isSilent = dataArray.every((value) => value < silenceThreshold);

    return isSilent;
  }

  function playAudio() {
    if (currentAudio) {
      isPlaying = true;
      currentAudio.play();
      currentAudio.onended = () => {
        isPlaying = false;
      };
      audioChunks = [];
    }
  }

  async function random() {
    const rand = contentsList[Math.floor(Math.random() * contentsList.length)];

    randomContent = rand;
    resultString = null;
    messageString = null;
  }

  function showModal() {
    showSearch = true;
  }

  function closeModal() {
    showSearch = false;
  }

  async function selectContent(event: CustomEvent<Content>) {
    const contentData = event.detail;
    randomContent = contentData;
    resultString = null;
    messageString = null;
  }

  async function submit() {
    const result = await saveAudio(
      randomContent.contentID,
      randomContent.contentText,
      currentAudioBlob,
    );
    resultString = result.message;
    messageString = null;
    currentAudio = null;
  }
  function home(){
        goto('/')
    }
</script>

{#if showSearch}
  <ContentList
    contents={contentsList}
    currentLanguage={currentValue}
    on:close={closeModal}
    on:select={selectContent}
  ></ContentList>
{/if}
<div
  class="bg-gradient-to-r from-[#6addd0] to-[#f7c188] min-h-screen flex items-center justify-center flex-col"
>
  <button
  on:click={home}
    class="absolute top-5 left-5 bg-white rounded-full py-2 px-4 overflow-hidden group"
  >
    <div class="flex items-center justify-center gap-x-2">
      <svg
      width="1.2rem" height="1.2rem"
        class="stroke-black transition duration-300 ease-in-out group-hover:stroke-[#99BC85]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          d="M16.88 2.88a1.25 1.25 0 0 0-1.77 0L6.7 11.29a.996.996 0 0 0 0 1.41l8.41 8.41c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.54 12l7.35-7.35c.48-.49.48-1.28-.01-1.77"
        />
      </svg>
      <span
        class="text-black text-lg transition duration-300 ease-in-out group-hover:text-transparent bg-clip-text bg-gradient-to-r from-[#6addd0] to-[#f7c188]"
        >Home</span
      >
    </div>
  </button>

  <div class="flex flex-col items-center gap-4">
    <img class="w-48 h-auto mb-4" src="FinalLogo.png" alt="Logo" />
    <h2 class="text-4xl font-bold text-white font-cursive mb-4">Vistalk</h2>

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
    <button
      class="bg-white font-bold text-black rounded-full py-2 px-4 hover:scale-110 focus:outline-none transition-transform duration-200"
      on:click={random}
      ><span
        class="hover:text-transparent bg-clip-text bg-gradient-to-r from-[#6addd0] to-[#f7c188]"
        >Random</span
      >
    </button>

    <button
      class="bg-white font-bold text-black rounded-full py-2 px-4 hover:scale-110 focus:outline-none transition-transform duration-200"
      on:click={showModal}
      ><span
        class="hover:text-transparent bg-clip-text bg-gradient-to-r from-[#6addd0] to-[#f7c188]"
        >Search</span
      >
    </button>

    <div class="flex items-center justify-center space-x-2 mb-2">
      {#if randomContent}
        <p class="text-lg font-bold text-white">Try to Speak this:</p>
        <p class="text-lg text-white">
          "{randomContent.contentText}"
        </p>
      {/if}
    </div>

    <p class="text-lg font-bold text-white mb-6">Speak Donate Your Voice</p>

    <div class="relative flex flex-col items-center justify-center">
      <button
        disabled={randomContent == undefined}
        class=" rounded-full p-4 hover:scale-110 focus:outline-none transition-transform duration-200 cursor-pointer"
        style="background-color: rgba(240, 240, 240, 0.4);"
        aria-label="Click to record audio"
        on:click={toggleRecording}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-white"
          viewBox="0 0 17 24"
          ><path
            fill="currentColor"
            d="M8.4 16.8a4.805 4.805 0 0 0 4.8-4.8V4.8a4.8 4.8 0 1 0-9.6 0V12a4.805 4.805 0 0 0 4.8 4.8"
          /><path
            fill="currentColor"
            d="M16.8 12V9.6a1.2 1.2 0 1 0-2.4 0V12a6 6 0 1 1-12 0V9.6a1.2 1.2 0 1 0-2.4 0V12a8.406 8.406 0 0 0 7.154 8.298l.046.006V21.6H3.6a1.2 1.2 0 1 0 0 2.4h9.6a1.2 1.2 0 1 0 0-2.4H9.6v-1.296c4.09-.609 7.193-4.093 7.2-8.303z"
          /></svg
        >
      </button>

      <div class="sound-wave" class:isRecording class:isPlaying>
        <span class="bar bar-1"></span>
        <span class="bar bar-2"></span>
        <span class="bar bar-3"></span>
        <span class="bar bar-4"></span>
        <span class="bar bar-5"></span>
        <span class="bar bar-6"></span>
        <span class="bar bar-5"></span>
        <span class="bar bar-4"></span>
        <span class="bar bar-3"></span>
        <span class="bar bar-2"></span>
        <span class="bar bar-1"></span>
      </div>
    </div>
    {#if messageString}
      <p class="text-lg text-white mb-6">{messageString}</p>
    {/if}

    {#if resultString}
      <p class="text-lg text-white mb-6">{resultString}</p>
    {/if}

    {#if currentAudio && messageString == null}
      <div class="flex items-center justify-center space-x-4 mb-12">
        <button
          class="bg-white font-bold text-black rounded-full py-2 px-4 hover:scale-110 focus:outline-none transition-transform duration-200"
          on:click={playAudio}
          disabled={messageString != null}
          ><span
            class="hover:text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-400"
            >Play</span
          >
        </button>
        <button
          class="bg-white font-bold text-black rounded-full py-2 px-4 hover:scale-110 focus:outline-none transition-transform duration-200"
          on:click={submit}
          disabled={messageString != null}
          ><span
            class="hover:text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-400"
            >Submit</span
          >
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .sound-wave {
    display: flex;
    gap: 4px;
    margin-top: 30px;
    visibility: hidden; /* Initially hidden */
  }

  .sound-wave.isRecording,
  .sound-wave.isPlaying {
    visibility: visible; /* Show when recording or playing */
  }

  .bar {
    width: 4px;
    border-radius: 20%;
    background-color: white;
    animation: sound-wave 0.5s ease infinite alternate;
  }

  .bar-1 {
    height: 8px;
  }
  .bar-2 {
    height: 12px;
  }
  .bar-3 {
    height: 16px;
  }
  .bar-4 {
    height: 20px;
  }
  .bar-5 {
    height: 24px;
  }
  .bar-6 {
    height: 28px;
  }

  .bar-1 {
    animation-delay: 0.1s;
  }
  .bar-2 {
    animation-delay: 0.2s;
  }
  .bar-3 {
    animation-delay: 0.3s;
  }
  .bar-4 {
    animation-delay: 0.4s;
  }
  .bar-5 {
    animation-delay: 0.5s;
  }
  .bar-6 {
    animation-delay: 0.6s;
  }

  @keyframes sound-wave {
    0% {
      transform: scaleY(1);
    }
    100% {
      transform: scaleY(2);
    }
  }
</style>
