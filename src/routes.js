import Analytics from './components/Analytics.vue'
import Location from './components/Location.vue'


export const routes = [
    {
        path: '/',
        component: Analytics,
        meta: {
            title: 'Analytics'
        }
    },
    {
        path: '/location',
        component: Location,
        meta: {
            title: 'Location'
        }
    }
]