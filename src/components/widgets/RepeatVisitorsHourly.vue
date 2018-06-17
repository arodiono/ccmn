<template>
    <line-chart
            :chart-data="chartData"
            :options="chartOptions"
            :height="400"
    >
    </line-chart>
</template>

<script>
    import LineChart from '../charts/LineChart'
    import {HTTP} from '../../http'

    export default {
        components: {
            LineChart
        },
        data: () => ({
            labels: [],
            daily: [],
            weekly: [],
            occasional: [],
            firstTime: [],
            yesterday: []
        }),
        props: ['interval', 'site'],
        watch: {
            site: async function () {
                await this.getData()
            },
            interval: async function () {
                await this.getData()
            }
        },
        computed: {
            chartData: function () {
                return {
                    labels: this.labels,
                    datasets: [
                        {
                            label: 'Daily',
                            backgroundColor: 'rgba(40,167,69,0.5)',
                            borderColor: '#28a745',
                            data: this.daily
                        },
                        {
                            label: 'Weekly',
                            backgroundColor: 'rgba(220,53,69,0.5)',
                            borderColor: '#DC3545',
                            data: this.weekly
                        },
                        {
                            label: 'Occasional',
                            backgroundColor: 'rgba(0, 123, 255, 0.5)',
                            borderColor: '#007bff',
                            data: this.occasional
                        },
                        {
                            label: 'First Time',
                            backgroundColor: 'rgba(255,193,7,0.5)',
                            borderColor: '#FFC107',
                            data: this.firstTime
                        },
                        {
                            label: 'Yesterday',
                            backgroundColor: 'rgba(23,162,184,0.5)',
                            borderColor: '#17a2b8',
                            data: this.yesterday
                        }
                    ]
                }
            },
            chartOptions: function () {
                return {
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        text: 'Repeat Visitors'
                    }
                }
            }
        },
        methods: {
            getData: async function () {
                await HTTP.get('/presence/v1/repeatvisitors/' + this.interval.type + '/' + this.interval.interval + '?siteId=' + this.site)
                    .then(response => {
                        this.labels.length = 0
                        this.daily.length = 0
                        this.weekly.length = 0
                        this.occasional.length = 0
                        this.firstTime.length = 0
                        this.yesterday.length = 0
                        for (let key in response.data) {
                            if (response.data.hasOwnProperty(key)) {
                                this.labels.push(key)
                                this.daily.push(response.data[key].DAILY)
                                this.weekly.push(response.data[key].WEEKLY)
                                this.occasional.push(response.data[key].OCCASIONAL)
                                this.firstTime.push(response.data[key].FIRST_TIME)
                                this.yesterday.push(response.data[key].YESTERDAY)
                            }
                        }
                    })
            }
        }
    }
</script>
