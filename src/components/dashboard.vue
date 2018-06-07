<template>
    <div>
        <connected-visitors-today v-if="$root.siteId"></connected-visitors-today>
        <hourly-connected-visitors-today v-if="$root.siteId"></hourly-connected-visitors-today>
        <daily-connected-visitors-last-week v-if="$root.siteId"></daily-connected-visitors-last-week>
       <!--{{ $root.siteId }}-->
    </div>
</template>

<style lang="sass"></style>

<script>
  import ConnectedVisitorsToday from './widgets/ConnectedVisitorsToday.vue'
  import HourlyConnectedVisitorsToday from './widgets/HourlyConnectedVisitorsToday.vue'
  import DailyConnectedVisitorsLastWeek from'./widgets/DailyConnectedVisitorsLastWeek.vue'

  export default {
    name: 'dashboard',
    components: {
      ConnectedVisitorsToday,
      HourlyConnectedVisitorsToday,
      DailyConnectedVisitorsLastWeek
    }
  }
</script>