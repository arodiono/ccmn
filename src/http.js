import axios from 'axios';

export const HTTP = axios.create({
    baseURL: 'https://cisco-presence.unit.ua/api',
    headers: {
        Accept: '*/*',
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': "Basic " + new Buffer('RO' + ":" + 'Passw0rd').toString("base64")
    },
    crossdomain: true
})