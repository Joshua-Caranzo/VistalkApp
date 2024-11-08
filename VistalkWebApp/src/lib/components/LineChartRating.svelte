<script lang="ts">
    import Highcharts from 'highcharts';
    import { onMount } from 'svelte';
  
    // Define the props
    export let chartTitle: string; // Title of the chart
    export let categories: string[]; // X-axis categories (1 to 5)
    export let seriesData: { name: string; data: number[] }[]; // Data for the series
  
    let chartContainer: HTMLDivElement;
  
    onMount(() => {
      const customColors = ['#6addd0', '#f7c188', '#FF5733', '#33FF57', '#3357FF']; // Extend as needed
      const options: Highcharts.Options = {
        chart: {
          type: 'column', // Change to 'column' for better visibility
          backgroundColor: 'transparent',
        },
        title: {
          text: chartTitle,
          style: {
            color: '#000',
          },
        },
        xAxis: {
          categories: categories,
          title: {
            text: 'Ratings',
            style: {
              color: '#000',
            },
          },
        },
        yAxis: {
          title: {
            text: 'Number of Vistas',
            style: {
              color: '#000',
            },
          },
          allowDecimals: false // Optional: to show integer values
        },
        series: seriesData.map((serie, index) => ({
          name: serie.name,
          type: 'column', // Use 'column' type for clearer representation
          data: serie.data,
          color: customColors[index % customColors.length], // Assign color from the array
        })),
        credits: {
            enabled: false, // Disable the Highcharts watermark
        },
      };
  
      // Create the chart
      Highcharts.chart(chartContainer, options);
    });
</script>
  
<div bind:this={chartContainer} style="width: 100%; height: 300px;"></div>