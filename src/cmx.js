import axios from 'axios';

export const CMX = axios.create({
    baseURL: 'https://cisco-cmx.unit.ua/api',
    headers: {
        Accept: '*/*',
        'Authorization': "Basic " + new Buffer('RO' + ":" + 'just4reading').toString("base64")
    },
    crossdomain: true
})