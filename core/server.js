'use strict';

const config = require('./config');
const server = require('http').createServer();
const readCSV = require('./logic.js').readCSV;
const sendStatic = require('./logic.js').sendStatic;
const sendIndexHtml = require('./logic.js').sendIndexHtml;
const redirectToHome = require('./logic.js').redirectToHome;

server.on('request', (req, res) => {
    this.req = req;
    this.res = res;
    if (req.url.split('/').pop().split('.').length > 1) {
        sendStatic.call(this);
        return;
    }

    if (req.url === config.csv_url && 'POST' !==  req.method) {
        redirectToHome.call(this);
        return;
    } else if (req.url === config.csv_url && 'POST' ===  req.method) {
        readCSV.call(this, config.max_csv_data);
        return;
    } else {
        sendIndexHtml.call(this);
        return;
    }
});

module.exports = server;