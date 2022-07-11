const pool = require('./dbConfig').pool;
const errors = require('../error-handler');

function create_project (name, currency, exchange_rate, owner_id, cap) {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `INSERT INTO project (name, currency, exchange_rate, owner_id, supply, cap) VALUES ("${name}", "${currency}", ${exchange_rate}, ${owner_id}, ${cap}, ${cap})`
                );
        }).then( () => {
            conn.release();
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            if(err.errno === 1062) {
                return reject(errors.returnZEFError(err, 409, 'Project or currency already exists', `Duplicate field when creating project ${name}`));
            }
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error trying to create project`));
        });
    });
}

function get_project_by_coin (name) {
    return new Promise ((resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `SELECT * FROM project WHERE currency="${name}"`
            );
        }).then( (result) => {
            conn.release();
            if (result[0].length === 0) {
                return resolve(null);
            }
            let {project_id, name, currency, exchange_rate, owner_id, supply, cap} = result[0][0];
            return resolve({
                project_id,
                name,
                currency,
                exchange_rate,
                owner_id,
                supply,
                cap
            });
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error trying to get currency ${name}`));
        });
    });
}

function update_exchange_rate (project_id, new_exchange_rate) {
    return new Promise ( (resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `UPDATE project SET exchange_rate=${new_exchange_rate} WHERE project_id='${project_id}'`
            );
        }).then( () => {
            conn.release();
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when updating exchange_rate for project_id ${project_id}`));
        });
    })
}

function update_cap (project_id, new_cap) {
    return new Promise ( (resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `UPDATE project SET cap=${new_cap} WHERE project_id='${project_id}'`
            );
        }).then( () => {
            conn.release();
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when updating cap for project_id ${project_id}`));
        });
    })
}

function update_supply (project_id, new_supply) {
    return new Promise ( (resolve, reject) => {
        let conn;
        pool.getConnection()
        .then( (connection) => {
            conn = connection;
            return conn.query(
                `UPDATE project SET supply=${new_supply} WHERE project_id='${project_id}'`
            );
        }).then( () => {
            conn.release();
            return resolve();
        }).catch( (err) => {
            if (conn !== undefined) conn.release();
            return reject(errors.returnZEFError(err, 500, 'Internal server error', `Error when updating supply for project_id ${project_id}`));
        });
    })
}

module.exports = {
    create_project,
    get_project_by_coin,
    update_exchange_rate,
    update_cap,
    update_supply
}