
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
var testsRouter = require('./routes/tests');
var imageFinderRouter = require('./routes/image_finder');
var collectorRouter = require('./routes/collector');
var collectorDevRouter = require('./routes/collector_dev');
var scoreboardRouter = require('./routes/scoreboard');
var docsRouter = require('./routes/docs');

const annotatorRouter = require("./routes/annotator");
const annotatorAjaxRouter = require("./routes/annotator_ajax");
const rankerRouter = require("./routes/ranker");
const rankerNegateRouter = require("./routes/ranker_negate");
const rankerAjaxRouter = require("./routes/ranker_ajax");
const rankerAjaxNegateRouter = require("./routes/ranker_ajax_negate");
const statisticsRouter = require("./routes/statistics");
const statisticsAjaxRouter = require("./routes/statistics_ajax");

var collectorAjax = require('./routes/collector_ajax');
var testsAjax = require('./routes/tests_ajax');
var imagesAjax = require('./routes/images_ajax');
var api = require('./routes/api');


const winston = require('winston');
global.logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        })
    ),
    transports: [new winston.transports.Console()]
});
// Instantiate app
var app = express();

// Setup views path
app.set('views', path.join(__dirname, 'views'));

// Setup it's engine
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {

  // -----------------------------------------------------------------------
  // authentication middleware

  const auth = {login: 'dev', password: 'ndbi045'} // change this

  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next()
  }

  // Access denied...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message

  // -----------------------------------------------------------------------

})

app.use(session({ secret: 'matfyz', resave: false, saveUninitialized: true, }));


// Get ImageRanker C++ library
const imageRanker = require(path.join(__dirname, 'build/Release/image_ranker.node'));

// Shared property
const a = path.join(global.rootDir, global.gConfig.pathToImages);

// Dataset specific properties
// DATASET 2
const b = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.preSoftmaxFilename2);
const c = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.keywordClassesFilename2);
const d = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.softmaxFilename2);
const e = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.deepFeaturesFilename2);
const f = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.imagesDirList2);
const g = global.gConfig.idOffset2;
const h = global.gConfig.appMode;

console.log(a);
console.log(b);
console.log(c);
console.log(d);
console.log(e);
console.log(f);
console.log(g);
console.log(g);


// Create global instance if ImageRanker
global.imageRanker = new imageRanker.ImageRankerWrapper(a,b,c,d,e,f,g, h);

global.imageRanker.Initialize();

// Push all routers into express middleware stack
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/image_finder', imageFinderRouter);

app.use('/tests', testsRouter);
app.use('/collector_dev', collectorDevRouter);
app.use('/scoreboard', scoreboardRouter);
app.use('/docs', docsRouter);
app.use('/collector', collectorRouter);

app.use('/annotator', annotatorRouter);
//app.get('/annotator_ajax', annotatorAjaxRouter);

app.use('/ranker', rankerRouter);
app.use('/ranker_negate', rankerNegateRouter);

//app.get('/ranker_ajax', rankerAjaxRouter);

app.use('/statistics', statisticsRouter);
//app.use('/statistics_ajax', statisticsAjaxRouter);

// Ranker AJAXes
app.get('/ranker_ajax_submit_settings', rankerAjaxRouter.submitSettings);
app.get('/ranker_ajax_submit_image', rankerAjaxRouter.submitImage);
app.get('/ranker_ajax_get_random_image_and_start_search_session', rankerAjaxRouter.getRandomImageAndStartSearchSession);
app.get('/ranker_ajax_get_selected_image_and_start_search_session', rankerAjaxRouter.getSelectedImageAndStartSearchSession);
app.get('/ranker_ajax_process_action', rankerAjaxRouter.processAction);
app.get('/ranker_ajax_get_image_keywords_for_interactive_search', rankerAjaxRouter.getImageKeywordsForInteractiveSearch);

app.get('/ranker_negate_ajax_submit_settings', rankerAjaxNegateRouter.submitSettings);
app.get('/ranker_negate_ajax_submit_image', rankerAjaxNegateRouter.submitImage);
app.get('/ranker_negate_ajax_get_random_image_and_start_search_session', rankerAjaxNegateRouter.getRandomImageAndStartSearchSession);
app.get('/ranker_negate_ajax_get_selected_image_and_start_search_session', rankerAjaxNegateRouter.getSelectedImageAndStartSearchSession);
app.get('/ranker_negate_ajax_process_action', rankerAjaxNegateRouter.processAction);
app.get('/ranker_negate_ajax_get_image_keywords_for_interactive_search', rankerAjaxNegateRouter.getImageKeywordsForInteractiveSearch);


// Allow only GET requests to 'collector_ajax' router
app.get('/collector_ajax', collectorAjax.find);

// GETs
app.get('/api_get_relevant_images', api.getRelevantImagesFromPlainQuery);

// AJAXes
app.get('/images_ajax', imagesAjax.find);
app.get('/tests_ajax_RunModelTest', testsAjax.RunModelTest);
app.get('/tests_ajax_RunGridTest', testsAjax.RunGridTest);
app.get('/tests_ajax_GetGridTestProgress', testsAjax.GetGridTestProgress);


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
