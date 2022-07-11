const express = require('express');
const errors = require('../error-handler')
const auth = require('../very_basic_security')
const db_member = require('../db/member');
const db_invest = require('../db/investment');
const db_currency = require('../db/currency');
const {body, validationResult} = require('express-validator')
const router = express.Router()


router.post('/', 
[
    body('username').isAlphanumeric(),
    body('password').exists(),
    body('name').exists(),
    body('email').isEmail()
],
(req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({ errors: validation.array() });
    }
    db_member.create_member(
        req.body.username,
        req.body.password,
        req.body.name,
        req.body.email
    ).then( () => {
        res.status(201).send('Member created');
    }).catch( (err) => {
        errors.handleErrorResponse(err, res);
    })
});

router.get('/' , auth, (req, res) => {

    if (req.user.role === 'admin') {
        return errors.sendErrorResponse(res, 400, 'User is not a member but an admin');
    }

    db_invest.get_investments_by_member(req.member.member_id)
    .then((results) => {
          res.status(200).json({
              'name': req.member.name,
              'email': req.member.email,
              'balance in ZKN': req.member.zkn_balance,
              'investments': results
          });
    }).catch( (err) => {
        errors.handleErrorResponse(err, res);
    });
});

router.get('/balance' , auth, (req, res) => {
    res.status(200).json({
        'balance': req.member.zkn_balance
    })
});

router.put('/balance' , 
[
    body('member_id').isNumeric(),
    body('currency').isAlpha(),
    body('amount').isNumeric()
],
(req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({ errors: validation.array() });
    }
    if (req.user.role !== 'admin') {
        return errors.sendErrorResponse(res, 403, 'Only admins can perform this operation')
    }
    let kuna_ratio;
    db_currency.get_currency(req.body.currency)
    .then((result) => {
        if (!result) {
            throw new errors.ZEFError(404, 'Specified currency does not exist', null)
        }
        kuna_ratio = result.kuna_ratio;
        return db_member.get_balance(req.body.member_id);
    }).then((result) => {
        if (!result) {
            throw new errors.ZEFError(404, 'Member not found', null)
        }
        return db_member.update_balance(req.body.member_id, result + parseFloat(req.body.amount)*kuna_ratio);
    }).then( () => {
        return res.status(200).send('Added amount to member balance');
    }).catch( (err) => {
        errors.handleErrorResponse(err, res);
    });
});

module.exports = {
    router
}