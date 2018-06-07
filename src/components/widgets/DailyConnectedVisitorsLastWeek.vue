<script>
  import { Line } from 'vue-chartjs'
  import { HTTP } from '../../http'

  export default {
    extends: Line,
    data: () => ({
      labels: [],
      values: [],

    }),
    computed: {
      chartData: function () {
        return {
          labels: this.labels,
          datasets: [
            {
              label: 'Users',
              backgroundColor: 'rgba(0, 123, 255, 0.5)',
              borderColor: '#007bff',
              data: this.values
            }
          ]
        }
      },
      chartOptions: function () {
        return {
          title: {
            display: true,
            text: 'Daily count of connected visitors for the last 7 days'
          }
        }
      }
    },
    created: function () {
      HTTP.get('/presence/v1/connected/daily/lastweek?siteId=' + this.$root.siteId)
        .then(response => {
          for (let key in response.data) {
            if (response.data.hasOwnProperty(key)) {
              this.labels.push(key)
              this.values.push(response.data[key])
            }
          }
        })
        .then(() => {
          this.renderChart(this.chartData, this.chartOptions)
        })
    }
  }
</script>
