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

module.exports = mysqlPool;