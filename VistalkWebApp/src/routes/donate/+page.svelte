<script lang="ts">
    let isRecording = false;
    let mediaRecorder: MediaRecorder | null = null;
    let audioChunks: Blob[] = [];
    let audioUrl: string | null = null;
    let audio: HTMLAudioElement | null = null;
  
    async function toggleRecording() {
      if (isRecording) {
        mediaRecorder?.stop();
        isRecording = false;
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          audioUrl = URL.createObjectURL(audioBlob);
          audio = new Audio(audioUrl);
          audio?.play();
          audioChunks = []; 
        };
        mediaRecorder.start();
        isRecording = true;
      }
    }
  </script>
  
  <div class="bg-gradient-to-r from-teal-400 to-amber-400 min-h-screen flex items-center justify-center flex-col">
    <div class="flex flex-col items-center gap-4">
      <!-- Logo Section -->
      <img class="w-48 h-auto mb-4" src="FinalLogo.png" alt="Logo">
      <h2 class="text-4xl font-bold text-white font-cursive mb-4">Vistalk</h2>
  
      <!-- "Speak Donate Your Voice" Section -->
      <p class="text-lg text-white mb-6">Speak Donate Your Voice</p>
  
      <!-- Microphone Icon Section -->
      <div class="relative flex flex-col items-center justify-center">
        <!-- Microphone Icon -->
        <button class="bg-transparent border-2 border-white rounded-full p-5 hover:scale-110 focus:outline-none transition-transform duration-200" aria-label="Click to record audio" on:click={toggleRecording}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20">
            <circle cx="12" cy="12" r="3"></circle>
            <line x1="12" y1="19" x2="12" y2="22"></line>
            <line x1="8" y1="22" x2="16" y2="22"></line>
          </svg>
        </button>
  
        <!-- Waveform Design -->
        <svg class={`waveform ${isRecording ? 'opacity-100 animate-waveform' : 'opacity-0'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #3a92a3; stop-opacity: 1" />
              <stop offset="100%" style="stop-color: #f7c188; stop-opacity: 1" />
            </linearGradient>
          </defs>
          <path class="waveform-path" fill="none" stroke="url(#gradient)" stroke-width="10" d="M0,150 C150,100 250,200 400,150 C550,100 650,200 800,150 C950,100 1050,200 1200,150 C1350,100 1450,200 1600,150 C1750,100 1850,200 2000,150 C2150,100 2250,200 2400,150" />
        </svg>
      </div>
    </div>
  </div>
  
  <style>
    /* Animating the waveform path */
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
  