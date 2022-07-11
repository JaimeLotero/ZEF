const pool = require('./dbConfig').pool;
const errors = require('../error-handler');

function create_investment (member_id, project_id, amount) {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `INSERT INTO investment (member_id, project_id, amount) VALUES (${member_id}, ${project_id}, ${amount})
                ON DUPLICATE KEY UPDATE amount=amount + ${amount}`
                );
        }).then( () => {
            conn.release();
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error trying to create investment of ${amount} for memeber ${member_id} on ${project_id}`));
        });
    });
}

function get_investment (member_id, project_id) {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `SELECT amount FROM investment WHERE member_id=${member_id} AND project_id=${project_id}`
                );
        }).then( (result) => {
            conn.release();
            if (result[0].length === 0) {
                return resolve(null);
            }
            return resolve(result[0][0].amount);
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when tryint to get investment for memeber ${member_id} on ${project_id}`));
        });
    });
}

function get_investments_by_member (member_id) {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `SELECT p.name, p.currency, i.amount FROM investment i JOIN project p ON i.project_id=p.project_id WHERE member_id=${member_id}`
                );
        }).then( (result) => {
            conn.release();
            return resolve(result[0]);
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when tryint to get investment for memeber ${member_id} on ${project_id}`));
        });
    });
}

function update_investment (member_id, project_id, amount) {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `UPDATE investment SET amount=${amount} WHERE member_id=${member_id} AND project_id=${project_id}`
                );
        }).then( () => {
            conn.release();
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error trying to update investment with ${amount} for member ${member_id} on ${project_id}`));
        });
    });
}

function delete_investment (member_id, project_id) {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `DELETE FROM investment WHERE member_id=${member_id} AND project_id=${project_id}`
                );
        }).then( () => {
            conn.release();
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error trying to delete investment by member ${member_id} on ${project_id}`));
        });
    });
}


module.exports = {
    create_investment,
    get_investment,
    get_investments_by_member,
    update_investment,
    delete_investment
}