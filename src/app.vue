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
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">Dashboard</h1>
                        <div class="btn-toolbar mb-2 mb-md-0">
                            <div class="btn-group mr-2">
                                <button class="btn btn-sm btn-outline-secondary">Share</button>
                                <button class="btn btn-sm btn-outline-secondary">Export</button>
                            </div>
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle">
                                <span data-feather="calendar"></span>
                                This week
                            </button>
                        </div>
                    </div>
                    <router-view></router-view>
                </main>
            </div>
        </b-container>
    </div>
</template>

<script>
  import dashboard from './components/dashboard.vue'
  import sidebar from './components/sidebar.vue'

  export default {
    name: 'app',
    components: {
      sidebar,
      dashboard
    },
    data: () => ({
      siteId: String
    })
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
