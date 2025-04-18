<script lang="ts">
    import { goto } from "$app/navigation";
    import { createEventDispatcher } from "svelte";
    import { page } from "$app/stores";
    import { loggedInUser } from "$lib/store";

    $: activePage = $page.url.pathname;

    let isExpanded = true;
    const dispatch = createEventDispatcher();

    // Toggle sidebar expansion
    function toggleSidebar() {
        isExpanded = !isExpanded;
        dispatch("toggleSidebar", isExpanded);
        updateLayout();
    }

    // Logout function
    async function handleLogout() {
        dispatch("logout");
        goto("/"); // Redirect to login after logout
    }

    function updateLayout() {
        // Force a reflow (optional)
        document.body.offsetHeight; // This line is just to force a reflow
    }
</script>

{#if $loggedInUser}
    <aside class="sidebar {isExpanded ? 'expanded' : 'collapsed'}">
        <div
            class="sidebar-content bg-gradient-to-b from-[#6addd0] to-[#f7c188]"
        >
            <div class="sidebar-header">
                <div class="flex items-justify justify-center">
                    <img src="FinalLogo.png" alt="Logo" class="sidebar-logo" />

                    {#if isExpanded}
                        <span
                            class="text-3xl text-center font-bold mt-3 ml-3"
                            style="color: #ffffff; font-family: 'Dancing Script', cursive;"
                            >Vistalk</span
                        >
                    {/if}
                </div>

                <button class="toggle-button" on:click={toggleSidebar}>
                    {#if isExpanded}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 50 50"
                        >
                            <path
                                fill="white"
                                d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17s-7.6 17-17 17m0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15s15-6.7 15-15s-6.7-15-15-15"
                            />
                            <path
                                fill="white"
                                d="M25.3 34.7L15.6 25l9.7-9.7l1.4 1.4l-8.3 8.3l8.3 8.3z"
                            />
                            <path fill="white" d="M17 24h17v2H17z" />
                        </svg>
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 50 50"
                        >
                            <path
                                fill="white"
                                d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17s-7.6 17-17 17m0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15s15-6.7 15-15s-6.7-15-15-15"
                            />
                            <path
                                fill="white"
                                d="M24.7 15.3L34.4 25l-9.7 9.7l-1.4-1.4l8.3-8.3l-8.3-8.3z"
                            />
                            <path fill="white" d="M17 24h17v2H17z" />
                        </svg>
                    {/if}
                </button>
            </div>

            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <nav class="navigation">
                <a class="nav-link" on:click={() => goto("/dashboard")}>
                    <i class="fas fa-chart-line"></i>
                    {#if isExpanded}
                        <span class="nav-text">Dashboard</span>
                    {/if}
                </a>
                <a
                    class="nav-link {activePage === '/user' ? 'active' : ''}"
                    href="/user"
                >
                    <i class="fas fa-user"></i>
                    {#if isExpanded}
                        <span class="nav-text">User</span>
                    {/if}
                </a>
                <a
                    class="nav-link {activePage === '/contents'
                        ? 'active'
                        : ''}"
                    href="/contents"
                    >
                    <i class="fas fa-book"></i>
                    {#if isExpanded}
                        <span class="nav-text">Contents</span>
                    {/if}
                </a>
                <a
                    class="nav-link {activePage === '/section' ? 'active' : ''}"
                    on:click={() => goto("/section")}
                >
                    <i class="fas fa-folder"></i>
                    {#if isExpanded}
                        <span class="nav-text">Section</span>
                    {/if}
                </a>

                <a
                    class="nav-link {activePage === '/dailytask'
                        ? 'active'
                        : ''}"
                    on:click={() => goto("/dailytask")}
                >
                    <i class="fas fa-tasks"></i>
                    {#if isExpanded}
                        <span class="nav-text">Daily Task</span>
                    {/if}
                </a>

                <a
                    class="nav-link {activePage === '/shop' ? 'active' : ''}"
                    on:click={() => goto("/shop")}
                >
                    <i class="fas fa-shop"></i>
                    {#if isExpanded}
                        <span class="nav-text">Shop</span>
                    {/if}
                </a>

                <a
                    class="nav-link {activePage === '/feedback'
                        ? 'active'
                        : ''}"
                    on:click={() => goto("/feedback")}
                >
                    <i class="fas fa-comments text-black"></i>
                    {#if isExpanded}
                        <span class="nav-text">Feedbacks</span>
                    {/if}
                </a>
                <a
                    class="nav-link {activePage === '/reports' ? 'active' : ''}"
                    on:click={() => goto("/reports")}
                >
                    <i class="fas fa-file-alt"></i>
                    {#if isExpanded}
                        <span class="nav-text">Reports</span>
                    {/if}
                </a>

                <a
                    class="nav-link {activePage === '/userRecording' ? 'active' : ''}"
                    on:click={() => {console.log("recording");
                                    goto("/userRecording")}}

                >
                    <i class="fas fa-microphone"></i>
                    {#if isExpanded}
                        <span class="nav-text">Recordings</span>
                    {/if}
                </a>
            </nav>

            <button
                class="bg-white font-bold py-2 rounded-full mt-4 flex justify-center relative overflow-hidden group transition duration-300 ease-in-out logout-button"
                on:click={handleLogout}
            >
                <div class="group">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.2rem"
                        height="1.2rem"
                        viewBox="0 0 24 24"
                        class="transition duration-300 ease-in-out fill-black group-hover:fill-[#99BC85]"
                    >
                        <path
                            d="M11 20a1 1 0 0 0-1-1H5V5h5a1 1 0 1 0 0-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5a1 1 0 0 0 1-1"
                            clip-rule="evenodd"
                        />
                        <path
                            d="M21.714 12.7a1 1 0 0 0 .286-.697v-.006a1 1 0 0 0-.293-.704l-4-4a1 1 0 1 0-1.414 1.414L18.586 11H9a1 1 0 1 0 0 2h9.586l-2.293 2.293a1 1 0 0 0 1.414 1.414l4-4z"
                        />
                    </svg>
                </div>

                {#if isExpanded}
                    <span
                        class="text-black transition duration-300 ease-in-out group-hover:text-transparent bg-gradient-to-r from-[#99BC85] to-[#f7c188] bg-clip-text ml-4"
                    >
                        Log Out
                    </span>
                {/if}
            </button>
        </div>
    </aside>
{/if}

<style>
    .sidebar {
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        overflow: visible;
        z-index: 1000;
        transition:
            width 0.3s ease,
            padding 0.3s ease;
    }

    .sidebar.expanded {
        width: 250px;
    }

    .sidebar.collapsed {
        width: 80px;
    }

    .sidebar-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 20px;
        color: white;
        font-family: "Arial", sans-serif;
        transition: opacity 0.3s ease;
    }

    .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .title {
        font-size: 1.2em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .toggle-button {
        background-color: rgba(247, 193, 136, 0.7);
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.5em;
        cursor: pointer;
        transition:
            color 0.3s ease,
            background-color 0.3s ease;
        position: absolute;
        right: -15px;
        top: 7%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        z-index: 9999;
    }

    .toggle-button:hover {
        color: #e0e0e0;
    }

    .toggle-button svg {
        width: 1.5em;
        height: 1.5em;
    }

    .navigation {
        display: flex;
        flex-direction: column;
    }

    .nav-link {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: white;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 10px;
        transition: background-color 0.3s ease;
        cursor: pointer;
    }

    .nav-link i {
        font-size: 1.2em;
        margin-right: 10px;
        color: white;
    }

    .nav-text {
        display: inline;
        color: white;
    }

    .nav-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .logout-button {
        display: flex;
        align-items: center;
        margin-top: auto;
        border: none;
        padding: 10px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .sidebar {
            width: 100%;
            height: auto;
            position: relative;
        }

        .sidebar.expanded {
            width: 100%;
        }

        .sidebar.collapsed {
            width: 100%;
        }
    }

    .nav-link.active {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .sidebar-logo {
        width: 56px;
        height: auto;
        display: block;
        margin: 10px auto;
        object-fit: contain;
    }
</style>
