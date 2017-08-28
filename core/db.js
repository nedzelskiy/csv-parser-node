'use strict';

const mysqlPool  = require('mysql').createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'gaa',
    password        : '123',
    database        : 'test'
});

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

module.exports = {
    getConnection: () => {
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection((err, connection) => {
                err && reject(err);
                resolve(connection);
            });
        }).catch(err => {
            console.error(err);
        });
    },
    releaseConnection: (connection) => {
        connection.release();
    },
    // sqlite
    // db.run('INSERT INTO csv  VALUES(NULL, ?, ?, ?)', [lineData[0], lineData[1], lineData[2]], function(err) {
    //     if (err) {
    //         console.error(err);
    //     } else {
    //         res.write(lineData.join(",") + "\r\n");
    //         req.resume();
    //     }
    // });
    query: (connection, sql, data = {}) => {
        return new Promise((resolve, reject) => {
            if (data) {
                connection.query(sql, data, (err, results, fields) => {
                    err && reject(err);
                    resolve({
                        results
                        ,fields
                    });
                });
            } else {

            }
        }).catch(err => {
            console.error(err);
        });
    }
};