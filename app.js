
// Require modules for server run
var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Load global config
var config = require("./config/config");

// Require routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var collectorRouter = require('./routes/collector');
var collectorAjax = require('./routes/collector_ajax');


// Instantiate app
var app = express();

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));
// app.use(function printSession(req, res, next) {
//   console.log('req.session', req.session);
//   return next();
// });

// Setup views path
app.set('views', path.join(__dirname, 'views'));

// Setup it's engine
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Get ImageRanker C++ library
const imageRanker = require(path.join(__dirname, 'build/Release/image_ranker.node'));



// Local version
const a = path.join(__dirname, "./public/images/");
const b = path.join(__dirname, "./data2/Studenti_NasNetLarge.pre-softmax");
const c = path.join(__dirname, "./data2/Studenti_NasNetLarge.deep-features");
const d = path.join(__dirname, "./data2/keyword_classes.txt");

console.log(a);
console.log(b);
console.log(c);
console.log(d);

// Live version
// const a = path.join(__dirname, "../public/images/");
// const b = path.join(__dirname, "../data/VBS2019_classification_NasNetLarge_20000.softmax");
// const c = path.join(__dirname, "../data/VBS2019_classification_NasNetMobile_20000.deep-features");
// const d = path.join(__dirname, "../data/keyword_classes.txt");

// Create global instance if ImageRanker
global.imageRanker = new imageRanker.ImageRankerWrapper(a,b,c,d);



if (global.gConfig.log_all == true)
{
  console.log(global.imageRanker);
}

// Push all routers into express middleware stack
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/collector', collectorRouter);

// Allow only GET requests to 'collector_ajax' router
app.get('/collector_ajax', collectorAjax.find);

// Catch 404 and forward to error handler
app.use(function(req, res, next) 
{
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
