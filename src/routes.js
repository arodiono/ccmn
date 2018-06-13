import dashboard from './components/dashboard.vue'
import location from './components/location.vue'


export const routes = [
    {
        path: '/',
        component: dashboard
    },
    {
        path: '/location',
        component: location
    }
]