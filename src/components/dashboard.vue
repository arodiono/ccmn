<template>
    <div>
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <b-col cols="6">
                <h1 class="h2">Dashboard</h1>
            </b-col>
            <b-col cols="3">
                <b-form-select v-model="site" :options="sitesOptions"/>
            </b-col>
            <b-col cols="3">
                <b-form-select v-model="interval" :options="intervalOptions"/>
            </b-col>
        </div>
        <b-card-group deck class="mb-3">
            <b-card header="Total Visitors" class="text-center" bg-variant="success" text-variant="white">
                <p class="card-text">{{ summary.totalVisitorCount }}</p>
            </b-card>
            <b-card header="Average Dwell Time" class="text-center" bg-variant="danger" text-variant="white">
                <p class="card-text">{{ Math.round(summary.averageDwell) }} mins</p>
            </b-card>
            <b-card header="Peak Hour" class="text-center" bg-variant="primary" text-variant="white">
                <p class="card-text">{{ summary.peakSummary.peakHour }}:00 - {{ summary.peakSummary.peakHour + 1}}:00 </p>
            </b-card>
            <b-card header="Conversion Rate" class="text-center" bg-variant="warning" text-variant="white">
                <p class="card-text">{{ summary.conversionRate }}%</p>
            </b-card>
            <b-card header="Top Device Maker" class="text-center" bg-variant="info" text-variant="white">
                <p class="card-text">{{ summary.topManufacturers.name }}</p>
            </b-card>
        </b-card-group>
        <hourly-connected-visitors v-bind:interval="interval" v-bind:site="site"></hourly-connected-visitors>
    </div>
</template>

<style lang="sass"></style>

<script>
    import {HTTP} from './../http'
    import HourlyConnectedVisitors from './widgets/HourlyConnectedVisitors.vue'

    export default {
        name: 'dashboard',
        components: {
            HourlyConnectedVisitors
        },
        data() {
            return {
                interval: 'today',
                intervalOptions: [
                    {value: 'today', text: 'Today'},
                    {value: 'yesterday', text: 'Yesterday'},
                    {value: 'lastweek', text: 'Last week'},
                    {value: 'lastmonth', text: 'Last month'},
                ],
                site: '',
                sitesOptions: [],
                summary: {}
            }
        },
        watch: {
            site: function () {
                this.getSummary()
            },
            interval: function () {
                this.getSummary()
            }
        },
        beforeCreate() {
            let self = this
            HTTP.get('/config/v1/sites')
                .then(response => {
                    response.data.forEach(function (el) {
                        self.sitesOptions.push({
                            value: el.aesUId,
                            text: el.name
                        })
                    })
                    self.site = self.sitesOptions[0].value
                })
                .catch(e => {
                    console.dir(e) // eslint-disable-line no-console
                })
        },
        methods: {
            getSummary: function () {
                HTTP.get('/presence/v1/kpisummary/' + this.interval + '?siteId=' + this.site)
                    .then(response => {
                        this.summary = response.data
                    })
            }
        }
    }
</script>