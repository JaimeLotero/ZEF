const pool = require('./dbConfig').pool;
const errors = require('../error-handler');

function create_currency (name, kuna_ratio) {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `INSERT INTO currency (name, kuna_ratio) VALUES ("${name}", ${kuna_ratio})`
                );
        }).then( () => {
            conn.release();
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            if(err.errno === 1062) {
                return reject(errors.returnZEFError(err, 409, 'Currency already exists', `Tried to create duplicate currency ${name}`));
            }
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error trying to create currency`));
        });
    });
}

function get_currency (name) {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `SELECT * FROM currency WHERE name="${name}"`
                );
        }).then( (result) => {
            conn.release();
            if (result[0].length === 0) {
                return resolve(null);
            }
            let {currency_id, name, kuna_ratio} = result[0][0];
            return resolve({
                currency_id,
                name,
                kuna_ratio
            });
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error trying to get currency ${name}`));
        });
    });
}

function get_currencies () {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `SELECT * FROM currency"`
                );
        }).then( (result) => {
            conn.release();
            return resolve(result[0]);
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error trying to get currencies`));
        });
    });
}

module.exports = {
    create_currency,
    get_currency,
    get_currencies
}