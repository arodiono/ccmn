<template>
    <doughnut-chart
            :chart-data="chartData"
            :options="chartOptions"
            :height="400"
    >
    </doughnut-chart>
</template>

<script>
  import DoughnutChart from '../charts/DoughnutChart'
  import { HTTP } from '../../http'

  export default {
    components: {
      DoughnutChart
    },
    data: () => ({
      daily: null,
      weekly: null,
      occasional: null,
      firstTime: null,
      yesterday: null
    }),
    props: ['params'],
    watch: {
      params: async function () {
        await this.getData()
      }
    },
    computed: {
      chartData: function () {
        return {
          labels: [
            'Daily',
            'Weekly',
            'Occasional',
            'First Time',
            'Yesterday'
          ],
          datasets: [{
            backgroundColor: [
              '#28a745',
              '#DC3545',
              '#007bff',
              '#FFC107',
              '#17a2b8'
            ],
            borderColor: [
              'rgba(40,167,69,0.5)',
              'rgba(220,53,69,0.5)',
              'rgba(0, 123, 255, 0.5)',
              'rgba(255,193,7,0.5)',
              'rgba(23,162,184,0.5)'
            ],
            data: [
              this.daily,
              this.weekly,
              this.occasional,
              this.firstTime,
              this.yesterday
            ]
          }]
        }
      },
      chartOptions: function () {
        return {
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Repeat Visitors Distribution'
          }
        }
      }
    },
    methods: {
      getData: async function () {
        await HTTP.get('/presence/v1/repeatvisitors/count/', { params: this.params })
          .then(response => {
            this.daily = response.data.DAILY;
            this.weekly = response.data.WEEKLY;
            this.occasional = response.data.OCCASIONAL;
            this.firstTime = response.data.FIRST_TIME;
            this.yesterday = response.data.YESTERDAY
          })
      }
    }
  }
</script>
