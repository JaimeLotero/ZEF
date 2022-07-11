const pool = require('./dbConfig').pool;
const errors = require('../error-handler');
const crypto = require('crypto');

function create_member (username, password, name, email) {
    return new Promise ( (resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            let salt = crypto.randomBytes(16).toString('hex');    //TODO: Move this logic outside of db function        
            let encryptedPassword = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
            return conn.query(
                `INSERT INTO user (username, password, salt, role) VALUES ("${username}", "${encryptedPassword}", "${salt}", "member")`
                );
        }).then( (result) => {
            let user_id = result[0].insertId;
            return conn.query(
                `INSERT INTO member (name, email, zkn_balance, user_id) VALUES ("${name}", "${email}", 0, ${user_id})`
                );
        }).then( () => {
            conn.release()
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            if(err.errno === 1062) {
                return reject(errors.returnZEFError(err, 409, 'Username already exists', `Duplicate field when creating member with username ${username}`));
            }
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when creating member ${username}`));
        });
    });
}

function get_balance (member_id) {
    return new Promise ( (resolve, reject) => {
        let conn;
        pool.getConnection()
        .then((connection) => {
            conn = connection;
            return conn.query(
                `SELECT zkn_balance FROM member WHERE member_id=${member_id}`
            );
        }).then((result) => {
            conn.release();
            if (result[0].length === 0) {
                return resolve(null);
            }
            return resolve(result[0][0].zkn_balance);
        }).catch((err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when getting balance for member ${member_id}`));
        });
    });
}

function update_balance (member_id, new_balance) {
    return new Promise ( (resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            let query = `UPDATE member SET zkn_balance=${new_balance} WHERE member_id=${member_id}`;
            return conn.query(
                query
            );
        }).then( () => {
            conn.release();
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when updating balance for member ${member_id}`));
        });
    })
}

function get_member_by_user_id (user_id) {
    return new Promise ( (resolve, reject) => {
        let conn;
        pool.getConnection()
        .then((connection) => {
            conn = connection;
            return conn.query(
                `SELECT * FROM member WHERE user_id='${user_id}'`
            );
        }).then((result) => {
            conn.release();
            return resolve(result[0][0]);
        }).catch((err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when finding member by user_id ${user_id}`));
        });
    });
}

module.exports = {
    create_member,
    get_balance,
    update_balance,
    get_member_by_user_id
}