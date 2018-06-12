<script>
    import {Bar} from 'vue-chartjs'
    import {HTTP} from '../../http'

    export default {
        extends: Bar,
        data: () => ({
            passerby: {
                labels: [],
                values: []
            },
            visitors: {
                labels: [],
                values: []
            },
            connected: {
                labels: [],
                values: []
            }
        }),
        props: ['interval', 'site'],
        watch: {
            site: async function () {
                await this.getPasserby()
                await this.getVisitors()
                await this.getConnected()
                await this.renderChart(this.chartData, this.chartOptions)

            },
            interval: async function () {
                await this.getPasserby()
                await this.getVisitors()
                await this.getConnected()
                await this.renderChart(this.chartData, this.chartOptions)

            }
        },
        mounted() {
            console.dir(this)
        },
        computed: {
            chartData: function () {
                return {
                    labels: this.visitors.labels,
                    datasets: [
                        {
                            label: 'Passerby',
                            backgroundColor: 'rgba(40,167,69,0.5)',
                            borderColor: '#28a745',
                            data: this.passerby.values
                        },
                        {
                            label: 'Visitors',
                            backgroundColor: 'rgba(220,53,69,0.5)',
                            borderColor: '#DC3545',
                            data: this.visitors.values
                        },
                        {
                            label: 'Connected',
                            backgroundColor: 'rgba(0, 123, 255, 0.5)',
                            borderColor: '#007bff',
                            data: this.connected.values
                        }
                    ]
                }
            },
            chartOptions: function () {
                return {
                    title: {
                        display: true,
                        text: 'Proximity'
                    }
                }
            }
        },
        methods: {
            getPasserby: async function () {
                await HTTP.get('/presence/v1/passerby/hourly/' + this.interval + '?siteId=' + this.site)
                    .then(response => {
                        this.passerby.labels.length = 0
                        this.passerby.values.length = 0
                        for (let key in response.data) {
                            if (response.data.hasOwnProperty(key)) {
                                this.passerby.labels.push(key)
                                this.passerby.values.push(response.data[key])
                            }
                        }
                    })
            },
            getVisitors: async function () {
                await HTTP.get('/presence/v1/visitor/hourly/' + this.interval + '?siteId=' + this.site)
                    .then(response => {
                        this.visitors.labels.length = 0
                        this.visitors.values.length = 0
                        for (let key in response.data) {
                            if (response.data.hasOwnProperty(key)) {
                                this.visitors.labels.push(key)
                                this.visitors.values.push(response.data[key])
                            }
                        }
                    })
            },
            getConnected: async function () {
                await HTTP.get('/presence/v1/connected/hourly/' + this.interval + '?siteId=' + this.site)
                    .then(response => {
                        this.connected.labels.length = 0
                        this.connected.values.length = 0
                        for (let key in response.data) {
                            if (response.data.hasOwnProperty(key)) {
                                this.connected.labels.push(key)
                                this.connected.values.push(response.data[key])
                            }
                        }
                    })
            }
        }
    }
</script>
