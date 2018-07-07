<template>
    <bar-chart
            :chart-data="chartData"
            :options="chartOptions"
            :height="400"
    >
    </bar-chart>
</template>

<script>
    import BarChart from '../charts/BarChart'
    import {HTTP} from '../../http'
    import moment from 'moment'

    export default {
        components: {
            BarChart
        },
        data: () => ({
            connectedUsersByLevel: [],
            shortestDwell: [],
            shortDwell: [],
            middleDwell: [],
            longDwell: [],
            longestDwell: []
        }),
        props: ['site'],
        watch: {
            site: async function () {
                await this.getData()
            }
        },
        computed: {
            chartData: function () {
                return {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        {
                            label: '5-30 mins',
                            backgroundColor: 'rgba(40,167,69,0.5)',
                            borderColor: '#28a745',
                            data: this.shortestDwell
                        },
                        {
                            label: '30-60 mins',
                            backgroundColor: 'rgba(220,53,69,0.5)',
                            borderColor: '#DC3545',
                            data: this.shortDwell
                        },
                        {
                            label: '1-5 hours',
                            backgroundColor: 'rgba(0, 123, 255, 0.5)',
                            borderColor: '#007bff',
                            data: this.middleDwell
                        },
                        {
                            label: '5-8 hours',
                            backgroundColor: 'rgba(255,193,7,0.5)',
                            borderColor: '#FFC107',
                            data: this.longDwell
                        },
                        {
                            label: '8+ hours',
                            backgroundColor: 'rgba(23,162,184,0.5)',
                            borderColor: '#17a2b8',
                            data: this.longestDwell
                        }
                    ]
                }
            },
            chartOptions: function () {
                return {
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        text: 'Daily Correlation Visitors by Dwell Level'
                    },
                    scales: {
                        xAxes: [{
                            stacked: true
                        }],
                    }
                }
            }
        },
        methods: {
            getData: async function () {
                await HTTP.get('/presence/v1/dwell/daily', {
                    params: {
                        siteId: this.site,
                        startDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
                        endDate: moment().format('YYYY-MM-DD')
                    }
                })
                    .then(response => {
                        let i = 0;
                        this.connectedUsersByLevel = [0, 0, 0, 0, 0, 0, 0];
                        for (let key in response.data) {
                            if (!this.connectedUsersByLevel[moment(key).day()]) {
                                this.connectedUsersByLevel[moment(key).day()] = [];
                            }
                            for (let k in response.data[key]) {
                                if (!this.connectedUsersByLevel[moment(key).day()][k]) {
                                    this.connectedUsersByLevel[moment(key).day()][k] = 0;
                                }
                                this.connectedUsersByLevel[moment(key).day()][k] += response.data[key][k];
                            }
                            i++
                        }
                        for (let key in this.connectedUsersByLevel) {
                            let arrays = Object.entries(this.connectedUsersByLevel[key]);
                            for (let k in arrays) {
                                arrays[k][0] === 'FIVE_TO_THIRTY_MINUTES' ? this.shortestDwell.push(Math.floor(arrays[k][1] / (i / 7))) : 0;
                                arrays[k][0] === 'THIRTY_TO_SIXTY_MINUTES' ? this.shortDwell.push(Math.floor(arrays[k][1] / (i / 7))) : 0;
                                arrays[k][0] === 'ONE_TO_FIVE_HOURS' ? this.middleDwell.push(Math.floor(arrays[k][1] / (i / 7))) : 0;
                                arrays[k][0] === 'FIVE_TO_EIGHT_HOURS' ? this.longDwell.push(Math.floor(arrays[k][1] / (i / 7))) : 0;
                                arrays[k][0] === 'EIGHT_PLUS_HOURS' ? this.longestDwell.push(Math.floor(arrays[k][1] / (i / 7))) : 0;
                            }
                        }
                    })
            }
        }
    }
</script>
