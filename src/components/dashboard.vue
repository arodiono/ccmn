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
                <p class="card-text">{{ totalVisitors }}</p>
            </b-card>
            <b-card header="Average Dwell Time" class="text-center" bg-variant="danger" text-variant="white">
                <p class="card-text">{{ dwellTime }}</p>
            </b-card>
            <b-card header="Peak Hour" class="text-center" bg-variant="primary" text-variant="white">
                <p class="card-text">{{ peakHour }}</p>
            </b-card>
            <b-card header="Conversion Rate" class="text-center" bg-variant="warning" text-variant="white">
                <p class="card-text">{{ conversionRate }}</p>
            </b-card>
            <b-card header="Top Device Maker" class="text-center" bg-variant="info" text-variant="white">
                <p class="card-text">{{ topDevice }}</p>
            </b-card>
        </b-card-group>
        <b-row class="mt-5">
            <b-col cols="8">
                <proximity-hourly v-bind:interval="interval" v-bind:site="site"></proximity-hourly>
            </b-col>
            <b-col cols="4">
                <proximity-count v-bind:interval="interval" v-bind:site="site"></proximity-count>
            </b-col>
        </b-row>
        <b-row class="mt-5">
            <b-col cols="8">
                <dwell-time-hourly v-bind:interval="interval" v-bind:site="site"></dwell-time-hourly>
            </b-col>
            <b-col cols="4">
                <dwell-time-count v-bind:interval="interval" v-bind:site="site"></dwell-time-count>
            </b-col>
        </b-row>
        <b-row class="mt-5 mb-3">
            <b-col cols="8">
                <repeat-visitors-hourly v-bind:interval="interval" v-bind:site="site"></repeat-visitors-hourly>
            </b-col>
            <b-col cols="4">
                <repeat-visitors-count v-bind:interval="interval" v-bind:site="site"></repeat-visitors-count>
            </b-col>
        </b-row>
    </div>
</template>

<script>
    import {HTTP} from './../http'
    import ProximityHourly from './widgets/ProximityHourly.vue'
    import ProximityCount from './widgets/ProximityCount.vue'
    import DwellTimeHourly from './widgets/DwellTimeHourly.vue'
    import DwellTimeCount from './widgets/DwellTimeCount.vue'
    import RepeatVisitorsHourly from './widgets/RepeatVisitorsHourly.vue'
    import RepeatVisitorsCount from './widgets/RepeatVisitorsCount.vue'

    export default {
        name: 'dashboard',
        components: {
            ProximityHourly,
            ProximityCount,
            DwellTimeHourly,
            DwellTimeCount,
            RepeatVisitorsHourly,
            RepeatVisitorsCount,

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
                totalVisitors: 'n/a',
                dwellTime: 'n/a',
                peakHour: 'n/a',
                conversionRate: 'n/a',
                topDevice: 'n/a',
                totalConnected: null,
                totalPasserby: null,
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
                let self = this
                HTTP.get('/presence/v1/kpisummary/' + this.interval + '?siteId=' + this.site)
                    .then(response => {
                        self.totalVisitors = response.data.totalVisitorCount
                        self.dwellTime = Math.round(response.data.averageDwell) + ' mins'
                        self.conversionRate = response.data.conversionRate + '%'
                        self.peakHour = (response.data.peakSummary.peakHour + ':00') + '-' + (response.data.peakSummary.peakHour + 1) + ':00'
                        self.topDevice = response.data.topManufacturers.name
                        self.totalConnected = response.data.totalConnectedCount
                        self.totalPasserby = response.data.totalPasserbyCount
                    })
            }
        }
    }
</script>