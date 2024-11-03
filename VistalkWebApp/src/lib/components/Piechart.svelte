<script lang="ts">
    import Highcharts from 'highcharts';
    import { onMount } from 'svelte';
  
    export let chartTitle: string;
    export let data: { name: string; y: number }[];
  
    let chartContainer: HTMLDivElement;
  
    onMount(() => {
      const customColors = ['#6addd0', '#f7c188'];
      const options: Highcharts.Options = {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent',
        },
        title: {
          text: chartTitle,
          style: {
            color: '#000',
          },
        },
        series: [{
          type: 'pie',  // Specify the type here
          name: 'Users',
          data: data,
          colors: customColors,
        }],
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.y}',
            },
          },
        },
        credits: {
          enabled: false, // Disable the Highcharts watermark
        },
      };
  
      // Create the chart
      Highcharts.chart(chartContainer, options);
    });
  </script>
  
  <div bind:this={chartContainer} style="width: 100%; height: 300px;"></div>
  