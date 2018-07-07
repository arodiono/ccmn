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
      connectedDays: []
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
              data: this.connectedDays
            },
          ]
        }
      },
      chartOptions: function () {
        return {
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Daily Correlation Users by Connected Users'
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
            let i = 0;
            this.connectedDays = [0, 0, 0, 0, 0, 0, 0];
            for (let key in response.data) {
              this.connectedDays[moment(key).day()] += response.data[key];
              i++
            }

            Object.keys(this.connectedDays).map((key, index) => {
              this.connectedDays[key] = Math.floor(this.connectedDays[key] / (i / 7));
            })
          })
      }
    }
  }
</script>
