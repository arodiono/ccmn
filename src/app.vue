<template>
    <div id="app">
        <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            <router-link class="navbar-brand col-sm-3 col-md-2 mr-0" to="/">CCMN</router-link>
            <ul class="navbar-nav px-3">
                <li class="nav-item text-nowrap">
                </li>
            </ul>
        </nav>
        <b-alert v-for="diffUsers in diff" :show="dismissCountDown"
                 dismissible
                 variant="warning"
                 @dismissed="dismissCountDown = 0"
                 @dismiss-count-down="countDownChanged">
            <p>This alert will dismiss after {{dismissCountDown}} seconds...</p>
            <b-progress variant="warning"
                        :max="dismissSecs"
                        :value="dismissCountDown"
                        height="4px">
            </b-progress>
        </b-alert>
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
    import $ from 'jquery'

    export default {
        name: 'app',
        components: {
            sidebar,
            dashboard
        },
        data() {
            return {
                interval: null,
                dismissSecs: 3,
                dismissCountDown: 0,
                diff: []
            }
        },
        methods: {
            findNew(arr) {
                let a = [];
                console.log(arr.length, this.$users.length);
                for (let i = 0; i < arr.length; i++) {
                    a[arr[i].macAddress] = arr[i];
                }
                for (let i = 0; i < this.$users.length; i++) {
                    if (a[this.$users[i].macAddress]) {
                        delete a[this.$users[i].macAddress];
                    } else {
                        a[this.$users[i].macAddress] = this.$users[i];
                    }
                }
                return a.length === 0 ? null : a;
            },
            start() { // TODO: NEED TO TEST
                // clearInterval(this.interval);
                // this.interval = setInterval(() => {
                //     let self = this;
                //     CMX.get('/location/v2/clients')
                //         .then(async response => {
                //             let arr = [];
                //             await response.data.forEach(el => {
                //                 arr.push(el)
                //             });
                //             if (self.$users.length !== 0) {
                //                 self.diff = self.findNew(arr);
                //             }
                //             if (self.diff) {
                //                 console.log(self.diff);
                //             }
                //             self.$users = arr;
                //         })
                //         .catch(e => {
                //             console.log(e)
                //         })
                // }, 5000)
            },
            countDownChanged(dismissCountDown) {
                this.dismissCountDown = dismissCountDown
            },
            showAlert() {
                this.dismissCountDown = this.dismissSecs
            }
        },
        created() {
            this.start();
        }
    }
</script>

<style lang="sass">
    $fa-font-path : "~@fortawesome/fontawesome-free-webfonts/webfonts"
    @import "~@fortawesome/fontawesome-free-webfonts/scss/fontawesome.scss"
    @import "~@fortawesome/fontawesome-free-webfonts/scss/fa-solid.scss"
    @import "~@fortawesome/fontawesome-free-webfonts/scss/fa-regular.scss"
    @import "~@fortawesome/fontawesome-free-webfonts/scss/fa-brands.scss"
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
