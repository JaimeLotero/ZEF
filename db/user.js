const pool = require('./dbConfig').pool;
const errors = require('../error-handler');

function get_user (username) {
    return new Promise ( (resolve, reject) => {
        let conn;
        pool.getConnection()
        .then((connection) => {
            conn = connection;
            return conn.query(
                `SELECT * FROM user WHERE username='${username}'`
            );
        }).then((result) => {
            conn.release();
            return resolve(result[0][0]);
        }).catch((err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when getting user ${username}`));
        });
    });
}


module.exports = {
    get_user
}