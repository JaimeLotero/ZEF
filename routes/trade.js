const express = require('express');
const errors = require('../error-handler');
const auth = require('../very_basic_security');
const db_project = require('../db/project');
const db_currency = require('../db/currency');
const db_member = require('../db/member');
const db_invest = require('../db/investment');
const {body, validationResult} = require('express-validator');
const router = express.Router();

router.use(auth);

router.post('/:currency/:coin', 
[
    body('amount').isNumeric(),
],
(req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({ errors: validation.array() });
    }

    if (req.user.role === 'admin') {
        return errors.sendErrorResponse(res, 400, 'Admins can\'t invest in projects');
    }

    let kuna_cost = 0;
    let owner_id;

    Promise.all([db_currency.get_currency(req.params.currency), db_project.get_project_by_coin(req.params.coin)])
    .then( (results) => {
        if(!results[0]) {
            throw new errors.ZEFError(404, 'Specified currency does not exist', `Request for non-existent currency ${req.params.currency}`);
        }
        if(!results[1]) {
            throw new errors.ZEFError(404, 'A project with the specified coin does not exist', `Request for non-existent project ${req.params.coin}`);
        }
        if (!req.body.amount) {
            throw new errors.ZEFError(400, 'Missing amount in request', null);
        }
        
        kuna_cost = req.body.amount * results[0].kuna_ratio;
        owner_id = results[1].owner_id;
        let coin_amount = kuna_cost / results[1].exchange_rate;

        if (kuna_cost > req.member.zkn_balance) {
            throw new errors.ZEFError(200, 'Not enough funds in member balance', null);
        }

        if (coin_amount > results[1].supply) {
            throw new errors.ZEFError(200, 'Buying operation exceeds coin supplies', null);
        }

        let new_supply = results[1].supply - coin_amount;
        let new_balance = req.member.zkn_balance - kuna_cost;

        return Promise.all([
            db_member.update_balance(req.member.member_id, new_balance),
            db_project.update_supply(results[1].project_id, new_supply),
            db_invest.create_investment(req.member.member_id, results[1].project_id, coin_amount),
        ]);
    
    }).then( () => {
        return db_member.get_balance(owner_id);
    }).then( (result) => {
        if (!result) {
            throw new errors.ZEFError(500, 'Internal server error', `Error querying balance for member ${owner_id} `)
        }
        return db_member.update_balance(owner_id, result + kuna_cost);
    }).then( () => {
        return res.status(200).send('Investment created successfully')
    }).catch( (err) => {
        errors.handleErrorResponse(err, res);
    })
});


module.exports = {
    router
}