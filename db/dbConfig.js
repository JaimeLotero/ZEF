const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'db',
    user: 'root',
    password: '12345678',
    port: 3306,
    database: 'zef',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
});

module.exports = {
    pool
}