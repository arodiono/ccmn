<template>
    <div>
        <visitors></visitors>
       <!--{{ $root.siteId }}-->
    </div>
</template>

<style lang="sass"></style>

<script>
  import visitors from './visitors.vue'

  export default {
    name: 'dashboard',
    components: {
      visitors
    }
  }
</script>