
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

// Set root directory
global.rootDir = __dirname;

// Require routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var collectorRouter = require('./routes/collector');
var scoreboardRouter = require('./routes/scoreboard');
var collectorAjax = require('./routes/collector_ajax');



// Instantiate app
var app = express();

// Setup views path
app.set('views', path.join(__dirname, 'views'));

// Setup it's engine
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'matfyz', resave: false, saveUninitialized: true, }));


// Get ImageRanker C++ library
const imageRanker = require(path.join(__dirname, 'build/Release/image_ranker.node'));

const a = path.join(global.rootDir, global.gConfig.pathToImages);
const b = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.softmaxFilename2);
const c = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.deepFeaturesFilename2);
const d = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.keywordClassesFilename2);

console.log(a);
console.log(b);
console.log(c);
console.log(d);

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
app.use('/scoreboard', scoreboardRouter);

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
