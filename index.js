'use strict';

const fs = require('fs');
const http = require('http');
const split = require('split');
const services = require('./services');
const limitStream = require('size-limit-stream');
const CsvStreamTransform = require('./CsvStreamTransform');

const CSV_URL = '/csv';
const server = http.createServer();
const MAX_CSV_DATA = 1024 * 1024 * 100;


// const sqlite3 = require('sqlite3').verbose();
// let db = new sqlite3.Database('./db/csv.db', (err) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log('Connected to the csv.db');
// });
// db.run(`CREATE TABLE IF NOT EXISTS csv (
// 	id INTEGER PRIMARY KEY AUTOINCREMENT,
// 	fname VARCHAR(255) NOT NULL DEFAULT '',
// 	sname VARCHAR(255) NOT NULL DEFAULT '',
// 	email VARCHAR(255) NOT NULL DEFAULT ''
// );`);


var mysql      = require('mysql');
var mysqlPool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'gaa',
    password        : '123',
    database        : 'test'
});


const readCSV = (max_csv_data) => {
    let res = this.res
        ,req = this.req
        ,lineDate = []
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
        lineDate = [];
        lineDate = chunkStr.split(',');

        if (services.isThisDataStrChunk(boundary, chunkStr) && lineDate.length === 3) {
            // mysql
            var post  = {fname: lineDate[0], sname: lineDate[1], email: lineDate[2]};
            mysqlPool.getConnection(function(err, connection) {
                var query = connection.query('INSERT INTO `csv` SET ?', post, function(error, results, fields) {
                    if (error) {
                        console.log(error);
                    }
                    req.resume();
                    connection.release();
                });
            });
            // sqlite
            // db.run('INSERT INTO csv  VALUES(NULL, ?, ?, ?)', [lineDate[0], lineDate[1], lineDate[2]], function(err) {
            //     if (err) {
            //         console.error(err);
            //     } else {
            //         res.write(lineDate.join(",") + "\r\n");
            //         req.resume();
            //     }
            // });
        }
    })
    .pipe(new CsvStreamTransform(boundary))
    .pipe(res);
};

const redirectToHome = () => {
    let res = this.res;
    res.statusCode = 302;
    res.setHeader('Location', '/');
    res.end();
};


const sendIndexHtml = () => {
    let res = this.res
        ,req = this.req
        ,fileStream = fs.createReadStream('./form.html', 'utf-8')
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


const sendStatic = () => {
    let res = this.res;
    res.statusCode = 404;
    res.end();
};

server.on('request', (req, res) => {
    this.req = req;
    this.res = res;

    if (req.url.split('/').pop().split('.').length > 1) {
        sendStatic.call(this);
        return;
    }

    if (req.url === CSV_URL && 'POST' !==  req.method) {
        redirectToHome.call(this);
        return;
    } else if (req.url === CSV_URL && 'POST' ===  req.method) {
        readCSV.call(this, MAX_CSV_DATA);
        return;
    } else {
        sendIndexHtml.call(this);
        return;
    }
});


server.listen(4000);
console.log('Listening localhost:4000');