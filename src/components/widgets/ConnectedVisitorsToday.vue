<template>
    <b-card-group deck class="mb-3">
        <b-card header="Connected visitors today" class="text-center">
            <p class="card-text">{{ connectedVisitorsToday }} <span class="small" :class= diffClass>{{ difference }}</span></p>

        </b-card>
    </b-card-group>
</template>

<script>
  import { HTTP } from '../../http'

  export default {
    name: 'ConnectedVisitorsToday',
    data: () => ({
      connectedVisitorsToday: null,
      connectedVisitorsYesterday: null
    }),
    computed: {
      difference() {
        return this.connectedVisitorsToday > this.connectedVisitorsYesterday ? '+' : '-' + Math.round(this.connectedVisitorsToday / this.connectedVisitorsYesterday) + '%'
      },
      diffClass: function () {
        if (this.connectedVisitorsToday > this.connectedVisitorsYesterday) {
          return 'text-success'
        }
        else if (this.connectedVisitorsToday < this.connectedVisitorsYesterday) {
          return 'text-warning'
        }
        else {
          return ''
        }
      }
    },
    created() {
        HTTP.get('/presence/v1/connected/count/today?siteId=' + this.$root.siteId)
          .then(response => {
            this.connectedVisitorsToday = response.data
          })
        HTTP.get('/presence/v1/connected/count/yesterday?siteId=' + this.$root.siteId)
        .then(response => {
          this.connectedVisitorsYesterday = response.data
        })
    }
  }
</script>