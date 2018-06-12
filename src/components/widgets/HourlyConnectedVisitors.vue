<script>
    import {Line} from 'vue-chartjs'
    import {HTTP} from '../../http'

    export default {
        extends: Line,
        data: () => ({
            labels: [],
            values: [],

        }),
        props: ['interval', 'site'],
        watch: {
            site: function() {
                this.getVisits()
            },
            interval: function() {
                this.getVisits()
            }
        },
        created() {
            this.getVisits()
        },
        computed: {
            chartData: function () {
                return {
                    labels: this.labels,
                    datasets: [
                        {
                            label: 'Users',
                            backgroundColor: 'rgba(0, 123, 255, 0.5)',
                            borderColor: '#007bff',
                            data: this.values
                        }
                    ]
                }
            },
            chartOptions: function () {
                return {
                    title: {
                        display: true,
                        text: 'Hourly count of connected visitors'
                    }
                }
            }
        },
        methods: {
            getVisits: function () {
                HTTP.get('/presence/v1/connected/hourly/' + this.interval + '?siteId=' + this.site)
                    .then(response => {
                        this.labels = []
                        this.values = []
                        for (let key in response.data) {
                            if (response.data.hasOwnProperty(key)) {
                                this.labels.push(key)
                                this.values.push(response.data[key])
                            }
                        }
                    })
                    .then(() => {
                        this.renderChart(this.chartData, this.chartOptions)
                    })
            }
        }
    }
</script>
