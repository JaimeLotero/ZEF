const express = require('express');
const errors = require('../error-handler')
const auth = require('../very_basic_security')
const db_project = require('../db/project');
const {body, validationResult} = require('express-validator')
const router = express.Router()

router.use(auth);

router.post('/', 
    [
        body('name').exists(),
        body('currency').exists(),
        body('exchange_rate').isNumeric(),
        body('cap').isNumeric()
    ],
(req, res) => {

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({ errors: validation.array() });
    }

    db_project.create_project(
        req.body.name,
        req.body.currency,
        req.body.exchange_rate,
        req.member.member_id,
        req.body.cap,
    ).then( () => {
        res.status(201).send('Project created');
    }).catch( (err) => {
        errors.handleErrorResponse(err, res);
    })
});

router.put('/',
[
    body('currency').exists(),
    body('cap').isNumeric(),
    body('exchange_rate').isNumeric(),
],
(req, res) => {

const validation = validationResult(req);
if (!validation.isEmpty()) {
  return res.status(400).json({ errors: validation.array() });
}
    db_project.get_project_by_coin(req.body.currency)
    .then( (result) => {
        if (!result) {
            throw new errors.ZEFError(404, 'No project found with specified currency', '');
        }
        if (result.owner_id !== req.member.member_id) {
            throw new errors.ZEFError(403, 'You are not the owner of the project', '');
        }
        if (req.body.cap && req.body.cap < result.cap && result.supply < result.cap - req.body.cap) {
            throw new errors.ZEFError(409, 'Cannot reduce limit without affecting existing investments', '');
        }
        
        let promise_array = [];
        if (req.body.cap) {
            let new_supply = result.supply + req.body.cap - result.cap;
            promise_array.push(db_project.update_cap(result.project_id, req.body.cap));
            promise_array.push(db_project.update_supply(result.project_id, new_supply));
        }
        if (req.body.exchange_rate) {
            promise_array.push(db_project.update_exchange_rate(result.project_id, req.body.exchange_rate));
        }

        return Promise.all(promise_array);
    }).then( () => {
        return res.status(200).send('Project updated successfully');
    }).catch( (err) => {
        errors.handleErrorResponse(err, res);
    })
});


module.exports = {
    router
}