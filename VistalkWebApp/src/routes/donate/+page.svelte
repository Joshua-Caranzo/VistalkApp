<script lang="ts">
  import { onMount } from "svelte";
  import type { CallResultDto } from "../../types/types";
  import { getContents, getContentsAll, getLanguages, saveAudio } from "./repo";
  import type { Content, Language } from "./types";
  import ContentList from "./ContentList.svelte";

  let isRecording = false;
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
  let messageString: string | null = null 
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
      messageString= null;
    } catch {
      console.log("Error");
    } finally {
      isloading = false;
    }
  }

  async function toggleRecording() {
    messageString="";
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
    const audioContext = new OfflineAudioContext(1, arrayBuffer.byteLength, 44100);
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
      currentAudio?.play();
      audioChunks = [];
    }
  }

  async function random() {
    const rand = contentsList[Math.floor(Math.random() * contentsList.length)];

    randomContent = rand;
    resultString = null;
    messageString= null;
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
    messageString= null;
  }

  async function submit()
  {
    const result = await saveAudio(randomContent.contentID, randomContent.contentText, currentAudioBlob);
    resultString = result.message;
    messageString= null;
    currentAudio = null;
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
  class="bg-gradient-to-r from-teal-400 to-amber-400 min-h-screen flex items-center justify-center flex-col"
>
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
      class="bg-transparent border-2 border-white rounded-full p-5 hover:scale-110 focus:outline-none transition-transform duration-200"
      on:click={random}
      >Random
    </button>

    <button
      class="bg-transparent border-2 border-white rounded-full p-5 hover:scale-110 focus:outline-none transition-transform duration-200"
      on:click={showModal}
      >Search
    </button>

    {#if randomContent}
      <p class="text-lg text-white mb-6">
        Try to Speak this: {randomContent.contentText}
      </p>
    {/if}

    <p class="text-lg text-white mb-6">Speak Donate Your Voice</p>

    <div class="relative flex flex-col items-center justify-center">
      <button
        disabled = {randomContent == undefined}
        class="bg-transparent border-2 border-white rounded-full p-5 hover:scale-110 focus:outline-none transition-transform duration-200"
        aria-label="Click to record audio"
        on:click={toggleRecording}
      >
        <i class="fas fa-microphone"></i>
      </button>

      <svg
        class={`waveform ${isRecording ? "opacity-100 animate-waveform" : "opacity-0"}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 300"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #3a92a3; stop-opacity: 1" />
            <stop offset="100%" style="stop-color: #f7c188; stop-opacity: 1" />
          </linearGradient>
        </defs>
        <path
          class="waveform-path"
          fill="none"
          stroke="url(#gradient)"
          stroke-width="10"
          d="M0,150 C150,100 250,200 400,150 C550,100 650,200 800,150 C950,100 1050,200 1200,150 C1350,100 1450,200 1600,150 C1750,100 1850,200 2000,150 C2150,100 2250,200 2400,150"
        />
      </svg>
    </div>
    {#if messageString}
    <p class="text-lg text-white mb-6">{messageString}</p>
    {/if}

    {#if resultString}
    <p class="text-lg text-white mb-6">{resultString}</p>
    {/if}
    {#if currentAudio && messageString == null}
    <button
      class="bg-transparent border-2 border-white rounded-full p-5 hover:scale-110 focus:outline-none transition-transform duration-200"
      on:click={playAudio}
      disabled={messageString != null}
      >Play
    </button>
    <button
      class="bg-transparent border-2 border-white rounded-full p-5 hover:scale-110 focus:outline-none transition-transform duration-200"
      on:click={submit}
      disabled={messageString != null}
      >Submit
    </button>
    {/if}
  </div>
</div>

<style>
  @keyframes waveformAnimation {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(10px);
    }
    50% {
      transform: translateX(-10px);
    }
    75% {
      transform: translateX(10px);
    }
    100% {
      transform: translateX(0);
    }
  }
</style>
