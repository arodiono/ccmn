rve<template>
    <div>
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <b-col cols="4">
                <h1 class="h2">Analytics</h1>
            </b-col>
            <b-col cols="2">
                <date-picker name="date" v-model="date" :config="config"></date-picker>
            </b-col>
            <b-col cols="2">
                <date-picker name="date" v-model="date" :config="config"></date-picker>
            </b-col>
            <b-col cols="2">
                <b-form-select v-model="site" :options="sitesOptions"/>
            </b-col>
            <b-col cols="2">
                <b-form-select v-model="interval" :options="intervalOptions"/>
            </b-col>
        </div>
        <b-card-group deck class="mb-3">
            <b-card header="Total Visitors" class="text-center"
                    bg-variant="success" text-variant="white">
                <p class="card-text">{{ totalVisitors }}</p>
            </b-card>
            <b-card header="Average Dwell Time" class="text-center"
                    bg-variant="danger" text-variant="white">
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
            <b-card header="Tomorrow" class="text-center" bg-variant="dark" text-variant="white">
                <p class="card-text">
                Visitors ~{{ nextDayVisitors }}
                Connected ~{{ nextDayConnected }}
                Passerby ~{{ nextDayPasserby }}
                </p>
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
    import datePicker from 'vue-bootstrap-datetimepicker'
    const ESS = require('exponential-smoothing-stream')

    export default {
        name: 'Analytics',
        components: {
            ProximityHourly,
            ProximityCount,
            DwellTimeHourly,
            DwellTimeCount,
            RepeatVisitorsHourly,
            RepeatVisitorsCount,
            datePicker
        },
        data() {
            return {
                date: false,
                config: {
                    format: 'YYYY-MM-DD',
                    useCurrent: true,
                    showTodayButton: true
                },
                interval: {
                    interval: 'today',
                    type: 'hourly'
                },
                intervalOptions: [
                    {
                        value: {
                            interval: 'today',
                            type: 'hourly'
                        },
                        text: 'Today'
                    },
                    {
                        value: {
                            interval: 'yesterday',
                            type: 'hourly'
                        },
                        text: 'Yesterday'
                    },
                    {
                        value: {
                            interval: 'lastweek',
                            type: 'daily'
                        },
                        text: 'Last week'
                    },
                    {
                        value: {
                            interval: 'lastmonth',
                            type: 'daily'
                        },
                        text: 'Last month'
                    },
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
                vShow: false,
                dShow: false,
                nextDayVisitors: '',
                nextDayConnected: '',
                nextDayPasserby: ''
            }
        },
        watch: {
            site: function () {
                this.getSummary()
                this.calcNextDayVisitorsCount()
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
                HTTP.get('/presence/v1/kpisummary/' + this.interval.interval + '?siteId=' + this.site)
                    .then(response => {
                        self.totalVisitors = response.data.totalVisitorCount
                        self.dwellTime = Math.round(response.data.averageDwell) + ' mins'
                        self.conversionRate = response.data.conversionRate + '%'
                        self.peakHour = (response.data.peakSummary.peakHour + ':00') + '-' + (response.data.peakSummary.peakHour + 1) + ':00'
                        self.topDevice = response.data.topManufacturers.name
                        self.totalConnected = response.data.totalConnectedCount
                        self.totalPasserby = response.data.totalPasserbyCount
                    })
            },
            calcNextDayVisitorsCount: function () {
                let weekData = {}
                HTTP.get('/presence/v1/visitor/daily/lastweek?siteId=' + this.site)
                    .then(response => {
                        this.nextDayVisitors = this.forecast(response.data)
                    })
                HTTP.get('/presence/v1/connected/daily/lastweek?siteId=' + this.site)
                    .then(response => {
                        this.nextDayConnected = this.forecast(response.data)
                    })
                HTTP.get('/presence/v1/passerby/daily/lastweek?siteId=' + this.site)
                    .then(response => {
                        this.nextDayPasserby = this.forecast(response.data)
                    })
            },
            forecast: function (obj) {
                let data = Object.keys(obj).map(key => obj[key])

                let a = new ESS({
                    smoothingFactor: 2 / (data.length + 1),
                    initialStrategy: new ESS.strategies.InitialStrategyMedian(data.length)
                });
                let valueList = [];

                a.on('data', function (data) {
                    valueList.push(data);
                });
                data.forEach(el => {
                    a.write(parseInt(el));
                })
                a.end();

                return Math.round(valueList[valueList.length - 1])
            }

        }
    }
</script>