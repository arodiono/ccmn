<template>
    <scatter-chart
            :chart-data="chartData"
            :options="chartOptions"
            :height="400"
    >
    </scatter-chart>
</template>

<script>
  import ScatterChart from '../charts/ScatterChart'
  import { HTTP } from '../../http'
  import moment from 'moment'

  export default {
    components: {
      ScatterChart
    },
    data: () => ({
      connected: {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      }
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
              label: 'Session Duration',
              backgroundColor: 'rgba(40,167,69,0.5)',
              borderColor: '#28a745',
              data: this.sessions
            },
          ]
        }
      },
      chartOptions: function () {
        return {
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Session Duration by day of week'
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
//            let self = this
//            for (let key in response.data) {
//              this.connected[moment(key).day()] += response.data[key]
//            }
//            let l = self.connected.length
////            Object.keys(self.connected).map(function(key, index) {
////              self.connected[key] /= self.connected.length;
////            });
////            this.connected.map((x) => x / this.connected.length)
//            console.log(this.connected)
          })
      }
    }
  }
</script>
