const db_user = require('./db/user');
const db_member = require('./db/member');
const errors = require('./error-handler');
var crypto = require('crypto');

const auth = function (req, res, next) {

    let username = req.get('ZEFUser');
    let password = req.get('ZEFPass');

    if (!username || !password) {
        return errors.sendErrorResponse(res, 401, 'Request does not have a user or password');
    }
    db_user.get_user(username)
    .then((result) => {
        if (!result) {
            return errors.sendErrorResponse(res, 401, 'User not found');
        }       
        let encryptedPassword = crypto.pbkdf2Sync(password, result.salt, 100000, 64, 'sha512').toString('hex');
        if (encryptedPassword !== result.password) {
            return errors.sendErrorResponse(res, 401, 'Invalid password');
        }
        req.user = result;

        if (req.user.role === 'member') {
            return db_member.get_member_by_user_id(req.user.user_id)
            .then( (result) => {
                if (!result) {
                    throw new errors.ZEFError(500, 'Database inconsistency', `Could not find member for user_id ${req.user.user_id}`)
                }
                req.member = result;
                next();
            })
        }
        next();
    }).catch( (err) => {
        errors.handleErrorResponse(err, res);
    });
}

module.exports = auth;