import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueRouter from 'vue-router'
import App from './app.vue'
import {HTTP} from './http'
import {routes} from './routes'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(BootstrapVue)

const router = new VueRouter({
  routes
})

new Vue({
  el: '#app',
  router,
  render: h => h(App),
  data: {
    siteId: '',
    date: function () {
      let now = new Date()
      return now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate()
    }
  },
  created() {
    this.getSites()
  },
  methods: {
    getSites: function () {
      HTTP.get('/config/v1/sites')
        .then(response => {
          this.siteId = response.data[0].aesUId
        })
        .catch(e => {
          console.dir(e) // eslint-disable-line no-console
        })
    }
  }
})