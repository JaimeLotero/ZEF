const express = require('express');
const db_member = require('./db/member');
const db_user = require('./db/user');
const app = express();

app.use(express.json());


const member_route = require('./routes/member').router;
app.use('/member', member_route);

const project_route = require('./routes/project').router;
app.use('/project', project_route);

const currency_route = require('./routes/currency').router;
app.use('/currency', currency_route);

const trade_route = require('./routes/trade').router;
app.use('/trade', trade_route);

const withdraw_route = require('./routes/withdraw').router;
app.use('/withdraw', withdraw_route);

app.listen(8080);