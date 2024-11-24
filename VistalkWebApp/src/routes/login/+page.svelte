<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { login } from "./repo";
  import type { CallResultDto, LoggedInUser } from "../../types/types";
  import {
    saveTokenToLocalStorage,
    saveUserToLocalStorage,
  } from "$lib/auth/oidcService";
  import MessageBox from "$lib/components/MessageBox.svelte";
  import { loggedInUser } from "$lib/store";
  import { goto } from "$app/navigation";

  let userName: string = "";
  let password: string = "";
  let userCallResult: CallResultDto<LoggedInUser>;
  let user: LoggedInUser;
  let showMessage: boolean = false;

  async function clickLogIn() {
    showMessage = false;
    try {
      userCallResult = await login(userName, password);
      user = userCallResult.data;
      showMessage = !userCallResult.isSuccess;
      if (userCallResult.isSuccess == true) {
        goto("/dashboard");
        saveTokenToLocalStorage(user.token);
        saveUserToLocalStorage(user);
        handleLogin(user);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      clickLogIn();
    }
  }

  async function handleLogin(user: LoggedInUser) {
    loggedInUser.set(user);
  }
  function home() {
    goto("/");
  }
</script>

<svelte:head>
  <title>LogIn</title>
</svelte:head>

<div class="gradient-bg min-h-screen flex items-center justify-center">
  <button
    on:click={home}
    class="absolute top-5 left-5 bg-white rounded-full py-2 px-4 overflow-hidden group"
  >
    <div class="flex items-center justify-center gap-x-2">
      <div class="group">
        <svg
        class="transition duration-300 ease-in-out fill-black group-hover:fill-[#6addd0]"
          xmlns="http://www.w3.org/2000/svg"
          width="1.2em"
          height="1.2em"
          viewBox="0 0 24 24"
          ><path
            d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"
          /></svg
        >
      </div>
      <span
        class="text-black text-lg transition duration-300 ease-in-out group-hover:text-transparent bg-clip-text bg-gradient-to-r from-[#6addd0] to-[#f7c188]"
        >Home</span
      >
    </div>
  </button>
  <div class="flex flex-col items-center gap-4">
    <img class="w-48 h-auto" src="FinalLogo.png" alt="Logo" />
    <h2
      class="text-4xl ml-2 font-bold"
      style="color: #ffffff; font-family: 'Dancing Script', cursive;"
    >
      Vistalk
    </h2>

    {#if showMessage}
      <MessageBox
        isDanger={!userCallResult.isSuccess}
        message={userCallResult.message}
        title={"Error"}
      />
    {/if}
    <div
      class="flex items-center border border-white rounded-lg px-4 py-2 gap-2 w-full"
    >
      <input
        class="bg-transparent outline-none text-black placeholder-white placeholder-opacity-100 pr-2 w-full"
        type="text"
        placeholder="Enter Username"
        bind:value={userName}
        on:keydown={handleKeyDown}
      />
    </div>
    <div
      class="flex items-center border border-white rounded-lg px-4 py-2 gap-2 w-full"
    >
      <input
        class="bg-transparent outline-none text-black placeholder-white placeholder-opacity-100 pr-2 w-full"
        type="password"
        placeholder="Enter Password"
        bind:value={password}
        on:keydown={handleKeyDown}
      />
    </div>

    <button
      type="submit"
      class="bg-white font-bold py-2 px-4 rounded-full mt-4 flex items-center justify-center relative overflow-hidden group transition duration-300 ease-in-out"
      on:click={clickLogIn}
    >
      <span
        class="text-black transition duration-300 ease-in-out group-hover:text-transparent bg-gradient-to-r from-[#99BC85] to-[#f7c188] bg-clip-text"
        >Log In</span
      >
    </button>
  </div>
</div>

<style>
  .gradient-bg {
    background: linear-gradient(to right, #6addd0, #f7c188);
  }

  .logo {
    width: 120px;
    height: 120px;
  }
</style>
