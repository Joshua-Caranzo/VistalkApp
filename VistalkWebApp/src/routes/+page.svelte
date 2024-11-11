<script lang="ts">
    import { getLoggedInUser } from '$lib/auth/oidcService';
    import { onMount } from 'svelte';
    import type { LoggedInUser } from '../types/types';
    import { loggedInUser } from '$lib/store';
    import { initAuth } from '$lib/auth/auth';
    import { goto } from '$app/navigation';
    import { sendEmailToUs } from './repo';
    
    let user: LoggedInUser | null = null;
    let isLoading = true;
    let flipped1 = false;
    let flipped2 = false;
    let flipped3 = false;
    let flipped4 = false;
    let flipped5 = false;
    let emailMessage:string = "";
    let userEmail:string = "";

    async function getUser() {
        user = await getLoggedInUser();
        loggedInUser.set(user);
        isLoading = false;
    }

    function scrollToSection(sectionId: string) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    onMount(async () => {
        await initAuth();
        await getUser(); 
        if (user) {
            goto('/dashboard');
        }
    });

    function toggleFlip(index: number) {
        console.log(index)
        switch(index) {
            case 1:
                flipped1 = !flipped1;
                break;
            case 2:
                flipped2 = !flipped2;
                break;
            case 3:
                flipped3 = !flipped3;
                break;
            case 4:
                flipped4 = !flipped4;
                break;
            case 5:
                flipped5 = !flipped5;
                break;
            default:
                return;
            }
    }

    async function sendEmail()
    {
        if((userEmail != "" || userEmail != null) && (emailMessage != "" || emailMessage != null)){
            let result = await sendEmailToUs(userEmail, emailMessage);
            if(result.isSuccess){
                userEmail = "";
                emailMessage = "";
                alert("Thank you for sharing your insights with us! Our team is committed to utilizing your feedback to enhance the Vistalk experience.");
            }
        }
    }

    function donate(){
        goto('/donate')
    }
</script>

{#if isLoading}
    <div></div>
{:else if $loggedInUser}
    <p>Welcome, {$loggedInUser.name}!</p>
{:else}
<header class="fixed top-0 w-full z-50 bg-gradient-to-r from-[#6addd0] to-[#f7c188]">
    <nav class="text-black py-4 w-[85%] px-4 md:px-20 flex justify-between items-center max-w-8xl mx-auto">
        <div class="flex justify-center items-center">
            <img src="FinalLogo.png" alt="Logo" class="h-12 md:h-12 rounded-full">
            <h2 class="text-3xl ml-2 font-bold" style="color: #ffffff; font-family: 'Dancing Script', cursive;">Vistalk</h2>
        </div>
        <div class="flex justify-center items-center">
            <ul class="flex">
                <li class="mr-4">
                    <span class="hover:underline font-bold cursor-pointer text-white text-xl" on:click={() => scrollToSection('about-us')}>About Us</span>
                </li>
            </ul>
            <ul class="flex">
                <li class="ml-4">
                    <span class="hover:underline font-bold cursor-pointer text-white text-xl" on:click={() => scrollToSection('the-developers')}>The Developers</span>
                </li>
            </ul>
        </div>
        <div class="flex justify-center items-center">
            <button on:click={() => goto('/login')} class="bg-white hover:text-[#f7c188] font-bold py-2 px-4 rounded-full">Log In</button>
        </div>
    </nav>
</header>

<section class="bg-gradient-to-r from-[#6addd0] to-[#f7c188] h-90 md:h-120 px-4 pt-32 relative">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center h-full md:py-24">
        <div class="text-center md:text-left">
            <h2 class="text-4xl md:text-3xl font-bold mb-4">ALL-IN-ONE GATEWAY TO MASTERING VISAYAN COMMUNICATION</h2>
            <p class="text-xl md:text-xl w-[70%] mb-4">
                Vistalk is a language learning app designed to break down language barriers, making communication easier and more enjoyable for everyone.
            </p>
                    </div>
        <div class="mt-8 md:mt-0">
            <img src="Group 1.png" alt="Image" class="w-full h-auto max-w-lg md:max-w-xl">
        </div>
    </div>
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center h-full gap-2">
        <button
            class="bg-white font-bold py-2 px-4 rounded-full mt-4 flex items-center justify-center relative overflow-hidden group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 512 512" class="mr-2">
                <path fill="none" class="stroke-black transition duration-300 ease-in-out group-hover:stroke-[#99BC85]" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M336 176h40a40 40 0 0 1 40 40v208a40 40 0 0 1-40 40H136a40 40 0 0 1-40-40V216a40 40 0 0 1 40-40h40"/>
                <path fill="none" class="stroke-black transition duration-300 ease-in-out group-hover:stroke-[#99BC85]" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m176 272l80 80l80-80M256 48v288"/>
            </svg>
            <span class="text-black transition duration-300 ease-in-out hover:text-transparent bg-clip-text bg-gradient-to-r from-[#99BC85] to-[#f7c188]">
                Download Mobile App
            </span>
        </button>

        <button
            on:click={donate}
            class="bg-white font-bold py-2 px-4 rounded-full mt-4 flex items-center justify-center relative overflow-hidden group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24"><path fill="currentColor" d="M4 21h9.62a4 4 0 0 0 3.037-1.397l5.102-5.952a1 1 0 0 0-.442-1.6l-1.968-.656a3.04 3.04 0 0 0-2.823.503l-3.185 2.547l-.617-1.235A3.98 3.98 0 0 0 9.146 11H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2m0-8h5.146c.763 0 1.448.423 1.789 1.105l.447.895H7v2h6.014a1 1 0 0 0 .442-.11l.003-.001l.004-.002h.003l.002-.001h.004l.001-.001c.009.003.003-.001.003-.001c.01 0 .002-.001.002-.001h.001l.002-.001l.003-.001l.002-.001l.002-.001l.003-.001l.002-.001c.003 0 .001-.001.002-.001l.003-.002l.002-.001l.002-.001l.003-.001l.002-.001h.001l.002-.001h.001l.002-.001l.002-.001c.009-.001.003-.001.003-.001l.002-.001a1 1 0 0 0 .11-.078l4.146-3.317c.262-.208.623-.273.94-.167l.557.186l-4.133 4.823a2.03 2.03 0 0 1-1.52.688H4zM16 2h-.017c-.163.002-1.006.039-1.983.705c-.951-.648-1.774-.7-1.968-.704L12.002 2h-.004c-.801 0-1.555.313-2.119.878C9.313 3.445 9 4.198 9 5s.313 1.555.861 2.104l3.414 3.586a1.006 1.006 0 0 0 1.45-.001l3.396-3.568C18.688 6.555 19 5.802 19 5s-.313-1.555-.878-2.121A2.98 2.98 0 0 0 16.002 2zm1 3c0 .267-.104.518-.311.725L14 8.55l-2.707-2.843C11.104 5.518 11 5.267 11 5s.104-.518.294-.708A.98.98 0 0 1 11.979 4c.025.001.502.032 1.067.485q.121.098.247.222l.707.707l.707-.707q.126-.124.247-.222c.529-.425.976-.478 1.052-.484a1 1 0 0 1 .701.292c.189.189.293.44.293.707"/></svg>
            <span class="text-black transition duration-300 ease-in-out hover:text-transparent bg-clip-text bg-gradient-to-r from-[#99BC85] to-[#f7c188]">
                Donate Voice Now
            </span>
        </button>
    </div>    
</section>


<section id="about-us" class="bg-gradient-to-r from-[#6addd0] to-[#f7c188] py-32 px-4">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-start bg-gray-200 bg-opacity-40 rounded-lg p-6">
        <div class="relative">
            <div class="bg-[#E1F0DA] h-40 w-40 md:h-72 md:w-72 rounded-lg absolute top-32 -translate-y-1/2 right-4 mt-8"></div>
            <img src="3.jpg" alt="Team working together" class="relative w-full max-w-lg md:max-w-2xl h-auto mt-8 md:mt-8 right-12 top-8">
        </div>
        <div class="ml-0 md:ml-9 mt-8 md:mt-0 text-center md:text-center">
            <h2 class="text-2xl md:text-3xl font-bold mb-4">ABOUT US</h2>
            <p class="mb-4 text-justify">
                We are a team of Information Technology students from the University of Cebu, passionate about bridging communication gaps and enhancing language learning experiences.
            </p>
            <p class="mb-4 text-justify">
                At Vistalk, we believe that language learning is more than just acquiring words and phrases; it's about embracing a new world of understanding and connection.
            </p>
            <p class="mb-4 text-justify">
                Driven by a passion for linguistic diversity, we developed Vistalk —a comprehensive language learning app tailored specifically for Visayan language learners. Our goal is to create a user-friendly platform that simplifies the learning process while fostering a sense of community among learners.
            </p>
            <p class="text-justify">
                Our team combines our technical skills and enthusiasm for language to build a tool that helps people connect, communicate, and grow through learning Visayan language.
            </p>
        </div>
    </div>
</section>

<section id="why-vistalk" class="bg-gradient-to-r from-[#6addd0] to-[#f7c188] py-8 px-4">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-start bg-gray-200 bg-opacity-40 rounded-lg p-6">
        <div class="ml-0 md:ml-9 mt-8 md:mt-0 text-center md:text-center">
            <h2 class="text-2xl md:text-3xl font-bold mb-4">WHY VISTALK</h2>
            <p class="mb-4 text-justify">
                At Vistalk, we are committed to making language learning engaging and accessible. Our platform provides interactive lessons and real-life scenarios that help learners develop practical communication skills.
            </p>
            <p class="mb-4 text-justify">
                We utilize advanced technology to deliver personalized learning experiences, allowing users to learn at their own pace and revisit materials as needed. Our app offers features such as quizzes, games, and a vibrant community for learners to practice together.
            </p>
            <p class="mb-4 text-justify">
                Our focus on cultural context and linguistic nuances makes our approach unique. We aim to immerse users in the Visayan culture, enhancing their language skills through meaningful content and interactions.
            </p>
            <p class="text-justify">
                Join us at Vistalk to embark on a transformative journey that empowers you to connect deeply with the Visayan language and culture.
            </p>
        </div>
        <div class="relative">
            <div class="bg-[#E1F0DA] h-40 w-40 md:h-72 md:w-72 rounded-lg absolute top-40 -translate-y-1/2 left-10 mt-8"></div>
            <img  src="5.jpg" alt="Team working together" class="relative w-full max-w-lg md:max-w-2xl h-auto mt-8 md:mt-8 left-14 top-12">
        </div>
    </div>
</section>

<section class="bg-gradient-to-r from-[#6addd0] to-[#f7c188] py-16 px-4">
    <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
            <ul class="list-none">
                <li class="text-2xl md:text-3xl font-bold mb-4">Adventurous Gameplay</li>
                    <ul class="list-disc pl-4">
                        <li>Explore various sections and complete engaging lessons.</li>
                        <li>Purchase power-ups from the shop and use them strategically to enhance gameplay.</li>
                        <li>Earn rewards as you progress.</li>
                    </ul>
                <li class="text-2xl md:text-3xl font-bold mt-8 mb-4">Pronunciation Practice</li>
                    <ul class="list-disc pl-4">
                        <li>Practice pronunciation for specific words and phrases.</li>
                        <li>Record your voice and receive instant feedback on accuracy.</li>
                        <li>Review your practice history for targeted content.</li>
                    </ul>
                <li class="text-2xl md:text-3xl font-bold mt-8 mb-4">Comprehensive Dictionary</li>
                <ul class="list-disc pl-4">
                    <li>Quick search for translations or word meanings.</li>
                    <li>An accessible tool for on-the-go language reference.</li>
                </ul>
                <li class="text-2xl md:text-3xl font-bold mt-8 mb-4">Subscription Benefits</li>
                <ul class="list-disc pl-4">
                    <li>Unlock additional sections for expanded learning.</li>
                    <li>Receive exclusive rewards for language journeys.</li>
                </ul>
            </ul>
        </div>
        <div class="relative">
            <div class="bg-[#E1F0DA] h-40 w-40 md:h-80 md:w-80 rounded-lg absolute top-16 md:top-32 left-16"></div>
            <img src="8 (1).png" alt="Image" class="relative w-full h-auto max-w-xs md:max-w-lg">
        </div>
    </div>
</section>

<section id="the-developers" class="bg-gradient-to-r from-[#6addd0] to-[#f7c188] py-16 px-4">
    <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-8">The Developers</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div class="group perspective">
                <div class="w-36 mx-auto">
                    <div class="relative w-36 h-36 transition-transform transform duration-500" tabindex="0" on:click={() => toggleFlip(1)} on:blur={() => flipped1 = false}>
                        {#if flipped1}
                        <div class="absolute inset-0 bg-white rounded-full flex items-center justify-center transform rotate-y-180 cursor-pointer z-10 p-4 text-center">
                            <p class="text-lg italic">Project Manager / Lead Developer</p>
                            </div>
                        {:else}
                            <div class="absolute inset-0">
                                <img src="caranzo.jpg" alt="Joshua Caranzo" class="h-36 w-36 rounded-full object-cover cursor-pointer">
                            </div>
                        {/if}
                    </div>
                    <p class="mt-2 text-lg italic text-center">Joshua Caranzo</p>
                </div>     
            </div>
             <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div class="group perspective">
                <div class="w-36 mx-auto">
                    <div class="relative w-36 h-36 transition-transform transform duration-500" tabindex="0" on:click={() => toggleFlip(2)} on:blur={() => flipped2 = false}>
                        {#if flipped2}
                        <div class="absolute inset-0 bg-white rounded-full flex items-center justify-center transform rotate-y-180 cursor-pointer z-10 p-4 text-center">
                            <p class="text-lg italic">Technical Writer / Front-End Developer</p>
                            </div>
                        {:else}
                            <div class="absolute inset-0">
                                <img src="aby.jpg" alt="aby" class="h-36 w-36 rounded-full object-cover cursor-pointer">
                            </div>
                        {/if}
                    </div>
                    <p class="mt-2 text-lg italic text-center">Beatrice Abigail Alindao</p>
                </div>     
            </div>
               <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div class="group perspective">
                <div class="w-36 mx-auto">
                    <div class="relative w-36 h-36 transition-transform transform duration-500" tabindex="0" on:click={() => toggleFlip(3)} on:focus={() => toggleFlip(3)} on:blur={() => flipped3 = false}>
                        {#if flipped3}
                        <div class="absolute inset-0 bg-white rounded-full flex items-center justify-center transform rotate-y-180 cursor-pointer z-10 p-4 text-center">
                            <p class="text-lg italic">QA Analyst / Back-End Developer</p>
                            </div>
                        {:else}
                            <div class="absolute inset-0">
                                <img src="aldrich.jpg" alt="drich" class="h-36 w-36 rounded-full object-cover cursor-pointer">
                            </div>
                        {/if}
                    </div>
                    <p class="mt-2 text-lg italic text-center">Aldrich Batisla-on</p>
                </div>     
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div class="group perspective">
                <div class="w-36 mx-auto">
                    <div class="relative w-36 h-36 transition-transform transform duration-500" tabindex="0" on:click={() => toggleFlip(4)} on:focus={() => toggleFlip(4)} on:blur={() => flipped4 = false}>
                        {#if flipped4}
                        <div class="absolute inset-0 bg-white rounded-full flex items-center justify-center transform rotate-y-180 cursor-pointer z-10 p-4 text-center">
                            <p class="text-lg italic">UI/UX Designer / Front-End Developer</p>
                            </div>
                        {:else}
                            <div class="absolute inset-0">
                                <img src="canada.jpg" alt="justin" class="h-36 w-36 rounded-full object-cover cursor-pointer">
                            </div>
                        {/if}
                    </div>
                    <p class="mt-2 text-lg italic text-center">Justin Louise Cañada</p>
                </div>     
            </div>
               <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div class="group perspective">
                <div class="w-36 mx-auto">
                    <div class="relative w-36 h-36 transition-transform transform duration-500" tabindex="0" on:click={() => toggleFlip(5)} on:focus={() => toggleFlip(5)} on:blur={() => flipped5 = false}>
                        {#if flipped5}
                        <div class="absolute inset-0 bg-white rounded-full flex items-center justify-center transform rotate-y-180 cursor-pointer z-10 p-4 text-center">
                            <p class="text-lg italic">Database Manager / Front-End Developer</p>
                            </div>
                        {:else}
                            <div class="absolute inset-0">
                                <img src="sacare.jpg" alt="sacare" class="h-36 w-36 rounded-full object-cover cursor-pointer">
                            </div>
                        {/if}
                    </div>
                    <p class="mt-2 text-lg italic text-center">Cesar Ian Sacare</p>
                </div>     
            </div>
        </div>
    </div>
</section>

<section class="bg-white py-8 px-4">
    <div class="max-w-4xl mx-auto text-center">
        <h3 class="text-lg font-semibold mb-2">Stay Connected</h3>
        <p class="text-gray-600 mb-4">Have any questions or feedback? Reach out—we’d love to hear from you!</p>
            <input bind:value={userEmail} type="email" placeholder="Your Email" class="mb-2 border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md" required>
            <textarea bind:value={emailMessage} placeholder="Your Message" class="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md h-24 mb-2" required></textarea>
            <button on:click={sendEmail} class="bg-[#6addd0] text-white font-semibold rounded-lg px-4 py-2 w-full max-w-md">Send Message</button>
        <p class="mt-4 text-gray-500 text-sm">&copy; 2024 Vistalk. All rights reserved.</p>
    </div>
</section>
{/if}



