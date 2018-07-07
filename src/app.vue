<template>
    <div id="app">
        <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            <router-link class="navbar-brand col-sm-3 col-md-2 mr-0" to="/">CCMN</router-link>
            <ul class="navbar-nav px-3">
                <li class="nav-item text-nowrap">
                </li>
            </ul>
        </nav>
        <b-container fluid>
            <div class="row">
                <sidebar></sidebar>
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
                    <transition name="fade">
                        <router-view></router-view>
                    </transition>
                </main>
            </div>
        </b-container>
    </div>
</template>

<script>
    import dashboard from './components/Analytics.vue'
    import sidebar from './components/sidebar.vue'
    import {CMX} from './cmx'

    export default {
        name: 'app',
        components: {
            sidebar,
            dashboard
        },
        data() {
            return {
                dismissSecs: 3,
                dismissCountDown: 0,
            }
        },
        methods: {
            countDownChanged(dismissCountDown) {
                this.dismissCountDown = dismissCountDown
            },
            showAlert() {
                this.dismissCountDown = this.dismissSecs
            }
        },
    }
</script>

<style lang="sass">
    body
        font-size: .875rem
        .navbar-brand
            padding-top: .75rem
            padding-bottom: .75rem
            font-size: 1rem
            background-color: rgba(0, 0, 0, .25)
            box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25)
        .border-top
            border-top: 1px solid #e5e5e5
        .border-bottom
            border-bottom: 1px solid #e5e5e5
</style>
