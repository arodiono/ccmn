<template>
    <div>
        <b-card-group deck class="mb-3" v-if="$root.siteId || connectedUsersToday">
            <b-card header="Connected visitors today" class="text-center">
                <p class="card-text">{{ connectedUsersToday }}</p>
            </b-card>
        </b-card-group>

        <visitors v-if="$root.siteId"></visitors>
       <!--{{ $root.siteId }}-->
    </div>
</template>

<style lang="sass"></style>

<script>
  import visitors from './visitors.vue'
  import {HTTP} from '../http'

  export default {
    name: 'dashboard',
    data: () => ({
      connectedUsersToday: null
    }),
    components: {
      visitors
    },
    mounted: function () {
      let main = this
      console.log(this.$root.siteId)
        HTTP.get('/presence/v1/connected/count/today?siteId=' + this.$root.siteId)
          .then(response => {
            main.connectedUsersToday = response.data
            this.$forceUpdate()
            console.log(main.connectedUsersToday)
          })
    }
  }
</script>