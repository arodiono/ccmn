<template>
    <div>
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <b-col cols="6">
                <h1 class="h2">Analytics</h1>
            </b-col>
            <b-col cols="2">
                <b-form-select v-model="site" :options="sitesOptions"/>
            </b-col>
            <b-col cols="4">
                <date-picker :input-class="'form-control'" :first-day-of-week="1" :not-after="new Date()" v-model="date"
                             :lang="lang" range :shortcuts="shortcuts"></date-picker>
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
                    <br>
                    Connected ~{{ nextDayConnected }}
                    <br>
                    Passerby ~{{ nextDayPasserby }}
                </p>
            </b-card>
        </b-card-group>
        <b-row class="mt-5">
            <b-col cols="8">
                <proximity-hourly v-bind:params="params" v-bind:interval="interval"></proximity-hourly>
            </b-col>
            <b-col cols="4">
                <proximity-count v-bind:params="params"></proximity-count>
            </b-col>
        </b-row>
        <b-row class="mt-5">
            <b-col cols="8">
                <dwell-time-hourly v-bind:params="params" v-bind:interval="interval"></dwell-time-hourly>
            </b-col>
            <b-col cols="4">
                <dwell-time-count v-bind:params="params"></dwell-time-count>
            </b-col>
        </b-row>
        <b-row class="mt-5 mb-3">
            <b-col cols="8">
                <repeat-visitors-hourly v-bind:params="params" v-bind:interval="interval"></repeat-visitors-hourly>
            </b-col>
            <b-col cols="4">
                <repeat-visitors-count v-bind:params="params"></repeat-visitors-count>
            </b-col>
        </b-row>
        <connected-day-correlation v-bind:site="site"></connected-day-correlation>
        <users-dwell-level-correlation v-bind:site="site"></users-dwell-level-correlation>
        <users-dwell-duration-by-dwell-level-correlation v-bind:site="site"></users-dwell-duration-by-dwell-level-correlation>
    </div>
</template>

<script>
  import { HTTP } from './../http'
  import ProximityHourly from './widgets/ProximityHourly.vue'
  import ProximityCount from './widgets/ProximityCount.vue'
  import DwellTimeHourly from './widgets/DwellTimeHourly.vue'
  import DwellTimeCount from './widgets/DwellTimeCount.vue'
  import RepeatVisitorsHourly from './widgets/RepeatVisitorsHourly.vue'
  import RepeatVisitorsCount from './widgets/RepeatVisitorsCount.vue'
  import ConnectedDayCorrelation from './widgets/ConnectedDayCorrelation.vue'
  import UsersDwellLevelCorrelation from './widgets/UsersDwellLevelCorrelation.vue'
  import UsersDwellDurationByDwellLevelCorrelation from './widgets/UsersDwellDurationByDwellLevelCorrelation'
  import DatePicker from 'vue2-datepicker'
  import moment from 'moment'

  const ESS = require('exponential-smoothing-stream')

  export default {
    name: 'Analytics',
    components: {
        UsersDwellDurationByDwellLevelCorrelation,
      ProximityHourly,
      ProximityCount,
      DwellTimeHourly,
      DwellTimeCount,
      RepeatVisitorsHourly,
      RepeatVisitorsCount,
      DatePicker,
      ConnectedDayCorrelation,
      UsersDwellLevelCorrelation
    },
    data () {
      return {
        date: [new Date(), new Date()],
        interval: 'hourly',
        shortcuts: [
          {
            text: 'Today',
            onClick: () => {
              this.date = [new Date(), new Date()]
              this.interval = 'hourly'
            }
          },
          {
            text: 'Yesterday',
            onClick: () => {
              this.date = [new Date(Date.now() - 24 * 60 * 60 * 1000), new Date(Date.now() - 24 * 60 * 60 * 1000)]
              this.interval = 'hourly'
            }
          },
          {
            text: 'Last week',
            onClick: () => {
              this.date = [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]
              this.interval = 'daily'
            }
          },
          {
            text: 'Last month',
            onClick: () => {
              this.date = [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]
              this.interval = 'daily'
            }
          }
        ],
        lang: {
          days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          pickers: ['next 7 days', 'next 30 days', 'previous 7 days', 'previous 30 days'],
          placeholder: {
            date: 'Select Date',
            dateRange: 'Select Date Range'
          }
        },
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
    computed: {
      params: function () {
        let params = {
          siteId: this.site,
          startDate: moment(this.date[0]).format('YYYY-MM-DD'),
          endDate: moment(this.date[1]).format('YYYY-MM-DD'),
        };
        if (moment(this.date[0]).format('YYYY-MM-DD') === moment(this.date[1]).format('YYYY-MM-DD') || this.interval === 'hourly') {
          params.date = moment(this.date[0]).format('YYYY-MM-DD')
        }
        return params
      },
    },
    watch: {
      site: function () {
        this.getSummary();
        this.calcNextDayVisitorsCount()
      },
      date: function () {
        this.getSummary()
      }
    },
    beforeCreate () {
      let self = this;
      HTTP.get('/config/v1/sites')
        .then(response => {
          response.data.forEach(function (el) {
            self.sitesOptions.push({
              value: el.aesUId,
              text: el.name
            })
          });
          self.site = self.sitesOptions[0].value
        })
        .catch(e => {
          console.dir(e) // eslint-disable-line no-console
        })
    },
    methods: {
      getSummary: function () {
        let self = this
        HTTP.get('/presence/v1/kpisummary/', {params: this.params})
          .then(response => {
            self.totalVisitors = response.data.totalVisitorCount ? response.data.totalVisitorCount : 0
            self.dwellTime = Math.round(response.data.averageDwell) + ' mins'
            self.conversionRate = response.data.conversionRate + '%'

            let interval = (self.date[1] - self.date[0]) / (1000 * 60 * 60 * 24);
            if (interval >= 7 && interval < 30) {
              self.peakHour = response.data.peakWeekSummary ? (response.data.peakWeekSummary.peakHour + ':00') + '-' + (response.data.peakWeekSummary.peakHour + 1) + ':00' : 'n/a'
            }
            else if (interval >= 30) {
              self.peakHour = response.data.peakMonthSummary ? (response.data.peakMonthSummary.peakHour + ':00') + '-' + (response.data.peakMonthSummary.peakHour + 1) + ':00' : 'n/a'
            }
            else {
              self.peakHour = response.data.peakSummary ? (response.data.peakSummary.peakHour + ':00') + '-' + (response.data.peakSummary.peakHour + 1) + ':00' : 'n/a'
            }
            self.topDevice = response.data.topManufacturers.name
            self.totalConnected = response.data.totalConnectedCount
            self.totalPasserby = response.data.totalPasserbyCount
          })
      },
      calcNextDayVisitorsCount: function () {
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
        let data = Object.keys(obj).map(key => obj[key]);

        let a = new ESS({
          smoothingFactor: 2 / (data.length + 1),
          initialStrategy: new ESS.strategies.InitialStrategyMedian(data.length)
        });
        let valueList = [];

        a.on('data', function (data) {
          valueList.push(data)
        });
        data.forEach(el => {
          a.write(parseInt(el))
        });
        a.end();

        return Math.round(valueList[valueList.length - 1])
      }

    }
  }
</script>