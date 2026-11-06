
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const resumesRouter = require('./routes/resumes');
var app = express();
app.use(logger('dev'));
app.use(express.json());
const aiRouter = require('./routes/ai');
const deltaRouter = require('./routes/delta');
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/resumes', resumesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/delta', deltaRouter);
app.listen(3000, () => {
    console.log('服务器运行在http://localhost:3000');
});
module.exports = app;
