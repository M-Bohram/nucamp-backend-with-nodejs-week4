const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

// const session = require('express-session')
// const FileStore = require('session-file-store')(session)
const passport = require('passport')

const { authorizeUsers } = require('./authenticate');
// const config = require('./config')

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const noteRouter = require('./routes/noteRouter');
const uploadRouter = require('./routes/uploadRouter');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser(config.SECRET_KEY));

// app.use(session({
//   name: 'session-id',
//   secret: config.SECRET_KEY,
//   saveUninitialized: false,
//   resave: false,
//   store: new FileStore()
// }))

app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize())
// app.use(passport.session())

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/imageUpload', uploadRouter);

// app.use(authorizeUsers)

app.use('/notes', noteRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
