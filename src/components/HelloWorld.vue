<template>
    <div class="fight">
        <img src="https://avatars1.githubusercontent.com/u/13568494?s=460&v=4" alt="azazazazaza"/>
        <img class="fight__img-rev" src="https://avatars1.githubusercontent.com/u/13568494?s=460&v=4"
             alt="azazazazaza"/>
        <h1 class="fight__title">{{ msg }}</h1>
    </div>
</template>

<script>
  export default {
    name: 'HelloWorld',
    props: {
      msg: String
    }
  }
</script>

<style lang="sass">
    .fight
        &__title
            color: #fff
            position: absolute
            top: 160px
            left: 460px
            transform: translate(-50%)
        &__img
            &-rev
                transform: scaleX(-1)
</style>