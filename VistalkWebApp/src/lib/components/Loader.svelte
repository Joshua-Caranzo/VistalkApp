<script lang="ts">
  export let isVisible: boolean;
  export let message: string; // Optional message
  export let colspan:number;
  
  let spinValue = 0; // Initial spin value
  let interval: number; // Store interval ID

  function startSpinning() {
    interval = setInterval(() => {
      spinValue = (spinValue + 1) % 360;
    }, 10); 
  }

  function stopSpinning() {
    clearInterval(interval);
  }

  $: if (isVisible) {
    startSpinning();
  } else {
    stopSpinning();
  }

</script>

{#if isVisible}
  <tr>
    <td colspan={colspan} class="loader-cell">
      <div class="flex flex-col items-center justify-center space-y-4">
        <div class="donut-container" style="transform: rotate({spinValue}deg);">
          <div class="donut"></div>
          <div class="inner-circle"></div>
        </div>
        {#if message}
          <div class="message-text">{message}</div>
        {/if}
      </div>
    </td>
  </tr>
{/if}

<style>
  .loader-cell {
    text-align: center; /* Center content horizontally */
    vertical-align: middle; /* Center content vertically */
    padding: 20px; /* Add padding for spacing */
    height: 100px; /* Set a height to ensure vertical centering */
  }

  .donut-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    border-radius: 50%; /* Make sure it's a circle */
    position: relative;
  }
  .donut {
    width: 100%;
    height: 100%;
    border-radius: 50%; /* Ensure the donut is circular */
    background: conic-gradient(#6addd0, #f7c188); /* Gradient fill */
  }
  .inner-circle {
    position: absolute;
    top: 10px; /* Adjusted for inner circle */
    left: 10px; /* Adjusted for inner circle */
    width: 60px;
    height: 60px;
    border-radius: 50%; /* Ensure the inner circle is circular */
    background-color: white;
  }
  .message-text {
    color: black;
    font-size: 16px;
    text-align: center;
  }
</style>
