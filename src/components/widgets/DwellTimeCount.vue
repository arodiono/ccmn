<template>
    <doughnut-chart
            :chart-data="chartData"
            :options="chartOptions"
            :height="400"
    >
    </doughnut-chart>
</template>

<script>
    import DoughnutChart from '../charts/DoughnutChart'
    import {HTTP} from '../../http'
    import moment from 'moment'

    export default {
        components: {
            DoughnutChart
        },
        data: () => ({
            fiveToThirtyMinutes: null,
            thirtyToSixtyMinutes: null,
            oneToFiveHours: null,
            fiveToEightHours: null,
            eightPlusHours: null
        }),
        props: ['params'],
        watch: {
            params: async function () {
                await this.getData()
            }
        },
        computed: {
            chartData: function () {
                return {
                    labels: [
                        '5-30 mins',
                        '30-60 mins',
                        '1-5 hours',
                        '5-8 hours',
                        '8+ hours'
                    ],
                    datasets: [{
                        backgroundColor: [
                            '#28a745',
                            '#DC3545',
                            '#007bff',
                            '#FFC107',
                            '#17a2b8'
                        ],
                        borderColor: [
                            'rgba(40,167,69,0.5)',
                            'rgba(220,53,69,0.5)',
                            'rgba(0, 123, 255, 0.5)',
                            'rgba(255,193,7,0.5)',
                            'rgba(23,162,184,0.5)'
                        ],
                        data: [
                            this.fiveToThirtyMinutes,
                            this.thirtyToSixtyMinutes,
                            this.oneToFiveHours,
                            this.fiveToEightHours,
                            this.eightPlusHours
                        ]
                    }]
                }
            },
            chartOptions: function () {
                return {
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        text: 'Dwell Time Distribution'
                    }
                }
            }
        },
        methods: {
            getData: async function () {
                await HTTP.get('/presence/v1/dwell/count/', { params: this.params })
                    .then(response => {
                        this.fiveToThirtyMinutes = response.data.FIVE_TO_THIRTY_MINUTES
                        this.thirtyToSixtyMinutes = response.data.THIRTY_TO_SIXTY_MINUTES
                        this.oneToFiveHours = response.data.ONE_TO_FIVE_HOURS
                        this.fiveToEightHours = response.data.FIVE_TO_EIGHT_HOURS
                        this.eightPlusHours = response.data.EIGHT_PLUS_HOURS
                    })
            }
        }
    }
</script>
