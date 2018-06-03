<template>
    <div id="visitors">

    </div>
</template>

<script>
  import { Line } from 'vue-chartjs'
  import { HTTP } from '../http'

  export default {
    extends: Line,
    data: () => ({
      labels: [],
      values: []
    }),
    created: function () {
      const id = this.$root.siteId()
      HTTP.get('/presence/v1/connected/hourly/today?siteId=' + id)
        .then(response => {
          for (let key in response.data) {
            if (response.data.hasOwnProperty(key)) {
              this.labels.push(key)
              this.values.push(response.data[key])
            }
          }
        })
    },
    mounted () {
      console.log(this.labels, this.values)
      this.renderChart({
        labels: this.labels,
        datasets: [
          {
            label: 'GitHub Commits',
            backgroundColor: '#f87979',
            data: this.values
          }
        ]
      })
    }
  }
</script>

<style>

</style>