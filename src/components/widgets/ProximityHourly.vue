<template>
    <bar-chart
            :chart-data="chartData"
            :options="chartOptions"
            :height="400"
    >
    </bar-chart>
</template>

<script>
  import BarChart from '../charts/BarChart'
  import { HTTP } from '../../http'
  import moment from 'moment'

  export default {
    components: {
      BarChart
    },
    data: () => ({
      passerby: {
        labels: [],
        values: []
      },
      visitors: {
        labels: [],
        values: []
      },
      connected: {
        labels: [],
        values: []
      }
    }),
    props: ['params', 'interval'],
    watch: {
      params: async function () {
        await this.getPasserby();
        await this.getVisitors();
        await this.getConnected()
      }
    },
    computed: {
      chartData: function () {
        return {
          labels: this.passerby.labels,
          datasets: [
            {
              label: 'Passerby',
              backgroundColor: 'rgba(40,167,69,0.5)',
              borderColor: '#28a745',
              data: this.passerby.values
            },
            {
              label: 'Visitors',
              backgroundColor: 'rgba(220,53,69,0.5)',
              borderColor: '#DC3545',
              data: this.visitors.values
            },
            {
              label: 'Connected',
              backgroundColor: 'rgba(0, 123, 255, 0.5)',
              borderColor: '#007bff',
              data: this.connected.values
            }
          ]
        }
      },
      chartOptions: function () {
        return {
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Proximity'
          }
        }
      }
    },
    methods: {
      getPasserby: async function () {
        await HTTP.get('/presence/v1/passerby/' + this.interval, { params: this.params })
          .then(response => {
            this.passerby.labels.length = 0;
            this.passerby.values.length = 0;
            for (let key in response.data) {
              if (response.data.hasOwnProperty(key)) {
                this.passerby.labels.push(key);
                this.passerby.values.push(response.data[key])
              }
            }
          })
      },
      getVisitors: async function () {
        await HTTP.get('/presence/v1/visitor/' + this.interval, { params: this.params })
          .then(response => {
            this.visitors.values.length = 0;
            for (let key in response.data) {
              if (response.data.hasOwnProperty(key)) {
                this.visitors.values.push(response.data[key])
              }
            }
          })
      },
      getConnected: async function () {
        await HTTP.get('/presence/v1/connected/' + this.interval, { params: this.params })
          .then(response => {
            this.connected.values.length = 0;
            for (let key in response.data) {
              if (response.data.hasOwnProperty(key)) {
                this.connected.values.push(response.data[key])
              }
            }
          })
      }
    }
  }
</script>
