<script lang="ts">
  import Highcharts from 'highcharts';
  import { onMount } from 'svelte';

  // Define the props
  export let chartTitle: string; // Title of the chart
  export let categories: string[]; // X-axis categories (e.g., months)
  export let seriesData: { name: string; data: number[] }[]; // Data for the series

  let chartContainer: HTMLDivElement;

  onMount(() => {
    const customColors = ['#6addd0', '#f7c188', '#FF5733', '#33FF57', '#3357FF']; // Extend as needed
    const options: Highcharts.Options = {
      chart: {
        type: 'line',
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
          text: 'Months',
          style: {
            color: '#000',
          },
        },
      },
      yAxis: {
        title: {
          text: 'Number of Subscribers',
          style: {
            color: '#000',
          },
        },
      },
      series: seriesData.map((serie, index) => ({
        name: serie.name,
        type: 'line',  // Specify the type here
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
