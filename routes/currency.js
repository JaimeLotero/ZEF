const express = require('express');
const errors = require('../error-handler');
const auth = require('../very_basic_security');
const db_currency = require('../db/currency');
const {body, validationResult} = require('express-validator')
const router = express.Router();

router.use(auth);

router.post('/', 
[
    body('name').exists(),
    body('kuna_ratio').isNumeric()
],
(req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({ errors: validation.array() });
    }
    if (req.user.role !== 'admin') {
        return errors.sendErrorResponse(res, 403, 'Only admins are allowed to do this operation');
    }

    db_currency.create_currency(
        req.body.name,
        req.body.kuna_ratio,
    ).then( () => {
        res.status(201).send('Currency created');
    }).catch( (err) => {
        errors.handleErrorResponse(err, res);
    })
});

module.exports = {
    router
}