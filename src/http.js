import axios from 'axios';

export const HTTP = axios.create({
    baseURL: 'https://cisco-presence.unit.ua/api',
    headers: {
        Accept: '*/*',
        'Authorization': "Basic " + new Buffer('RO' + ":" + 'Passw0rd').toString("base64")
    },
    crossdomain: true
})