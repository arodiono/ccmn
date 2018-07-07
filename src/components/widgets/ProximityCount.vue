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

    export default {
        components: {
            DoughnutChart
        },
        computed: {
            chartData: function () {
                return {
                    labels: [
                        'Passerby',
                        'Visitors',
                        'Connected'
                    ],
                    datasets: [{
                        backgroundColor: [
                            '#28a745',
                            '#DC3545',
                            '#007bff'
                        ],
                        borderColor: [
                            'rgba(40,167,69,0.5)',
                            'rgba(220,53,69,0.5)',
                            'rgba(0, 123, 255, 0.5)'
                        ],
                        data: [
                            this.$parent.totalPasserby,
                            this.$parent.totalVisitors,
                            this.$parent.totalConnected
                        ]
                    }]
                }
            },
            chartOptions: function () {
                return {
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        text: 'Proximity Distribution'
                    }
                }
            }
        }
    }
</script>
