<template>
    <nav class="col-md-2 d-none d-md-block bg-light sidebar">
        <div class="sidebar-sticky">
            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted"><span>Main</span></h6>
            <b-nav vertical class="w-25">
                <b-nav-item to="/">Analytics</b-nav-item>
            </b-nav>
            <b-nav vertical class="w-25">
                <b-nav-item to="/location">Location</b-nav-item>
            </b-nav>
        </div>
    </nav>
</template>

<script>
  export default {
    name: 'sidebar'
  }
</script>

<style lang="sass">
    .sidebar
        position: fixed
        top: 0
        bottom: 0
        left: 0
        z-index: 100
        padding: 48px 0 0
        box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1)
    .sidebar-sticky
        position: relative
        top: 0
        height: calc(100vh - 48px)
        padding-top: .5rem
        overflow-x: hidden
        overflow-y: auto
    @supports ((position: -webkit-sticky) or (position: sticky))
        .sidebar-sticky
            position: -webkit-sticky
            position: sticky
    .sidebar .nav-link
        font-weight: 500
        color: #333
    .sidebar .nav-link .feather
        margin-right: 4px
        color: #999
    .sidebar .nav-link.active
        color: #007bff
    .sidebar .nav-link:hover .feather,
    .sidebar .nav-link.active .feather
        color: inherit
    .sidebar-heading
        font-size: .75rem
        text-transform: uppercase
    [role="main"]
        padding-top: 48px
</style>