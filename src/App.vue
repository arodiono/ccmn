<template>
  <div id="app">
    <HelloWorld msg="sasai lalka!"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: sans-serif;
}
</style>
