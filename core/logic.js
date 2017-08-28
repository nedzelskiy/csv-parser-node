'use strict';

const fs = require('fs');
const split = require('split');
const db = require('./db');
const config = require('./config');
const services = require('./../services/services');
const limitStream = require('size-limit-stream');
const CsvStreamTransform = require('./../services/CsvStreamTransform');

const readCSV = function(max_csv_data) {
    let res = this.res
        ,req = this.req
        ,lineData = []
        // we can can get boundary from headers content-type
        ,boundary = '-----'
        ;

    res.setHeader('Connection', 'Transfer-Encoding');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let limiter = limitStream(max_csv_data).on('error', e => {
        res.statusCode = 413;
        res.setHeader('Connection', 'close');
        res.end('File is too big!');
    });

    req.on('end', () => {
        console.log('uploading finished!');
        res.end();
    });

    req
        .pipe(limiter)
        .pipe(split())
        .on('data', chunkStr => {
            req.pause();
            lineData = [];
            lineData = chunkStr.split(',');

            if (services.isThisDataStrChunk(boundary, chunkStr) && lineData.length === 3) {
                let post = {
                    fname: lineData[0],
                    sname: lineData[1],
                    email: lineData[2]
                };
                db.getConnection().then(connection => {
                    db.query(
                        connection
                        ,'INSERT INTO `csv` SET ?'
                        ,post
                    ).then(res => {
                        req.resume();
                        db.releaseConnection(connection);
                    });
                });
            }
        })
        .pipe(new CsvStreamTransform(boundary))
        .pipe(res);
};

const redirectToHome = function() {
    let res = this.res;
    res.statusCode = 302;
    res.setHeader('Location', '/');
    res.end();
};


const sendIndexHtml = function() {
    let res = this.res
        ,fileStream = fs.createReadStream(`${config.views_way}/form.html`, 'utf-8')
        ,htmlForm = ''
        ;

    fileStream
        .on('error', err => {
            if (err.code === 'ENOENT') {
                res.statusCode = 404;
                res.end('Not found!');
            } else {
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end('Internal error!');
                } else {
                    res.end();
                }
            }
        })
        .on('data', chunk => {
            htmlForm += chunk;
        })
        .on('end', () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(htmlForm);
        });

    res.on('close', () => {
        fileStream.destroy();
    });
};


const sendStatic = function() {
    let res = this.res;
    res.statusCode = 404;
    res.end();
};

module.exports = {
    readCSV,
    redirectToHome,
    sendIndexHtml,
    sendStatic
};