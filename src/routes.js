import dashboard from './components/dashboard.vue'
import location from './components/location.vue'


export const routes = [
    {
        path: '/',
        component: dashboard,
        name: 'dashboard',
        meta: {
            title: 'Dashboard'
        }
    },
    {
        path: '/location',
        component: location,
        name: 'location',
        meta: {
            title: 'Location'
        }
    }
]