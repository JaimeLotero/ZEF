const express = require('express');
const errors = require('../error-handler');
const auth = require('../very_basic_security');
const db_project = require('../db/project');
const db_member = require('../db/member');
const db_invest = require('../db/investment');
const {body, validationResult} = require('express-validator');
const router = express.Router();

router.use(auth);

router.post('/:coin/', 
[
    body('amount').isNumeric()
],
(req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({ errors: validation.array() });
    }

    if (req.user.role === 'admin') {
        return errors.sendErrorResponse(res, 400, 'Admins can\'t invest in projects');
    }

    let kuna_value = 0;
    let project_id;
    let new_supply;
    let owner_id;

    db_project.get_project_by_coin(req.params.coin)
    .then( (result) => {
        if(!result) {
            throw new errors.ZEFError(404, 'A project with the specified coin does not exist', `Request for non-existent project ${req.params.coin}`);
        }
        kuna_value = req.body.amount * result.exchange_rate;
        project_id = result.project_id;
        new_supply = result.supply + req.body.amount;
        owner_id = result.owner_id
        return Promise.all([
            db_invest.get_investment(req.member.member_id, result.project_id),
            db_member.get_balance(owner_id)
        ]);
    }).then( (results) => {
        if (!results[0]) {
            throw new errors.ZEFError(409, 'Member has no investments in project', '');
        }
        if (results[0] < req.body.amount) {
            throw new errors.ZEFError(409, 'Requested amount is greater than investment', '');
        }
        if(results[1] < kuna_value) {
            throw new errors.ZEFError(409, 'Project owner does not have sufficient funds to return investment')
        }

        let promise_array = [];
        if (results[0] === req.body.amount) {
            promise_array.push(db_invest.delete_investment(req.member.member_id, project_id));
        } else {
            promise_array.push(db_invest.update_investment(req.member.member_id, project_id, results[0] - req.body.amount));
        }
        promise_array.push(db_project.update_supply(project_id, new_supply));
        promise_array.push(db_member.update_balance(owner_id, results[1] - kuna_value));
        promise_array.push(db_member.update_balance(req.member.member_id, req.member.zkn_balance + kuna_value));

        return Promise.all(promise_array);
    }).then( () => {
        return res.status(200).send('Successful withdrawal')
    }).catch( (err) => {
        errors.handleErrorResponse(err, res);
    })
});


module.exports = {
    router
}