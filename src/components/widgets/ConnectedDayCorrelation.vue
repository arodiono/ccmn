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
      connectedU: []
    }),
    props: ['site'],
    watch: {
      site: async function () {
        await this.getData()
      }
    },
    computed: {
      chartData: function () {
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Connected users',
              backgroundColor: 'rgba(40,167,69,0.5)',
              borderColor: '#28a745',
              data: this.connectedU
            },
          ]
        }
      },
      chartOptions: function () {
        return {
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Connected users by day of week'
          }
        }
      }
    },
    methods: {
      getData: async function () {

        await HTTP.get('/presence/v1/connected/daily', {
          params: {
            siteId: this.site,
            startDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD')
          }
        })
          .then(response => {
            let i = 0
            this.connectedU = [0, 0, 0, 0, 0, 0, 0]
            for (let key in response.data) {
              this.connectedU[moment(key).day()] += response.data[key]
              i++
            }

            Object.keys(this.connectedU).map((key, index) => {
              this.connectedU[key] /= i
            })
          })
      }
    }
  }
</script>
