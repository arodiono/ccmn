<template>
    <b-card-group deck class="mb-3">
        <b-card header="Connected visitors" class="text-center">
            <p class="card-text">{{ connectedVisitors }}</p>
        </b-card>
    </b-card-group>
</template>

<script>
    import {HTTP} from '../../http'

    export default {
        name: 'ConnectedVisitors',
        data: () => ({
            connectedVisitors: ''
        }),
        props: ['interval'],
        watch: {
            interval: function() {
                this.getVisits()
            }
        },
        created() {
            this.getVisits()
        },
        methods: {
            getVisits: function () {
                HTTP.get('/presence/v1/connected/count/' + this.interval + '?siteId=' + this.$root.siteId)
                    .then(response => {
                        this.connectedVisitors = response.data
                    })
            }
        }
    }
</script>