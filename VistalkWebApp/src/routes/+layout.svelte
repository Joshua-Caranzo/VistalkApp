<script lang="ts">
    import SideBar from '$lib/components/SideBar.svelte';
    import MobileNavbar from '$lib/components/MobileNavbar.svelte';
    import { getLoggedInUser } from '$lib/auth/oidcService';
    import { onMount } from 'svelte';
    import { loggedInUser } from '$lib/store';
    import '../app.css';
    import type { LoggedInUser } from '../types/types';
    import { initAuth } from '$lib/auth/auth';

    let user: LoggedInUser | null = null;
    let isLoading = true;
    let isSidebarExpanded = true;
    let isMobileExpanded = true;

    function logout(): void {
        loggedInUser.set(null);        
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }

    // Function to handle sidebar toggle
    function handleSidebarToggle() {
        isSidebarExpanded = !isSidebarExpanded;
        isMobileExpanded = !isMobileExpanded;
    }

    onMount(async () => {
        await initAuth();
    });
</script>

{#if $loggedInUser}
    <div class="layout">
        <SideBar on:logout={logout} on:toggleSidebar={handleSidebarToggle} />
        <main class="content" class:collapsed={!isSidebarExpanded} class:expanded={isSidebarExpanded}>
            <div>
                <slot/>
            </div>
        </main>
    </div>

    <div class="mobile-layout h-full flex flex-col">
        <MobileNavbar on:logout={logout} on:toggleSidebar={handleSidebarToggle} />
        <main class="mobile-content flex-1 pt-16 overflow-auto">
            <div class="content-inner w-full h-full">
                <slot/>
            </div>
        </main>
    </div>

{:else}
    <slot/>
{/if}

<style>
    /* General styles */
    .layout {
        display: flex;
        min-height: 100vh; /* Ensure the layout fills the viewport height */
        background-color: #f4f4f4; /* Set a default background color */
    }

    .content {
        flex: 1;
        transition: margin-left 0.3s ease;
        padding: 20px;
        background-color: #f4f4f4;
    }

    .mobile-layout {
        display: none; /* Hide mobile layout by default */
    }

    .mobile-content {
        flex: 1;
        transition: margin-top 0.3s ease;
        padding: 20px;
        background-color: #f4f4f4;
    }

    /* Desktop styles */
    @media (min-width: 769px) {
        .mobile-layout {
            display: none; /* Hide mobile layout on desktop */
        }

        .content {
            margin-left: 250px; /* Sidebar width when expanded */
        }

        .content.collapsed {
            margin-left: 80px; /* Sidebar width when collapsed */
        }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
        .layout {
            display: none; /* Hide desktop layout on mobile */
        }

        .mobile-layout {
            display: flex; /* Show mobile layout */
            min-height: 100vh; /* Ensure mobile layout fills the viewport height */
        }

        .mobile-content {
            margin-top: 60px; /* Adjust based on the mobile navbar height */
        }
    }
</style>
