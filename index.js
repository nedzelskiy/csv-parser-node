'use strict';

const http = require('http');
const fs = require('fs');
const split = require('split');


const server = http.createServer();
const CSV_URL = '/csv';
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
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'gaa',
    password : '123',
    database : 'test'
});

connection.connect();


const csvReader = (max_csv_data) => {
    let res = this.res
        ,req = this.req
        ,size = 0
        ,lineDate = [];
        ;



    // res.setHeader('Connection', 'Transfer-Encoding');
    // res.setHeader('Content-Type', 'text/txt; charset=utf-8');
    // res.setHeader('Transfer-Encoding', 'chunked');
    // req.setTimeout(2000, () => {
    //     console.log('terminated!');
    // });
    req
    .pipe(split())
    .on('data', chunk => {
        size += chunk.length;
        if (size > max_csv_data) {
            res.statusCode = 413;
            // TODO WHY this shit does not work with .pipe(split()) ???
            // res.setHeader('Connection', 'close');
            res.end('File is too big!');
        }
        req.pause();
        lineDate = [];
        lineDate = chunk.split(',');
        // TODO How cut HEADERS FROM body data???
        if (lineDate.length === 3) {
            var post  = {fname: lineDate[0], sname: lineDate[1], email: lineDate[2]};
            var query = connection.query('INSERT INTO `csv` SET ?', post, function (error, results, fields) {
                if (error) {
                    console.log(error);
                    req.resume();
                } else {
                    req.resume();
                    // res.write(lineDate.join(",") + "\r\n");
                }
            });
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
    .on('end', () => {
        console.log('uploading finished!');
        res.end('OK');
        // connection.end();
        // db.close();
    });
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
        csvReader.call(this, MAX_CSV_DATA);
        return;
    } else {
        sendIndexHtml.call(this);
        return;
    }
});


server.listen(4000);
console.log('Listening localhost:4000');