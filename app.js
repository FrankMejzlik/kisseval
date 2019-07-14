
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
const trecvidRankerRouter = require("./routes/trecvid_ranker");
const trecvidAjaxRankerRouter = require("./routes/trecvid_ranker_ajax");
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

// SELECT DATASET
const inputData = 4;

// Do you even TRECVID?
const doTrecvid =  true;
const testTrecvid = true;

// Vars for ImageRanker constructor args
let a = path.join(global.rootDir, global.gConfig.pathToImages);
let b;
let c;
let d;
let e;
let f;
let g;
let h = global.gConfig.appMode;

let outputPath;
let normalTasks;
let progressTasks;

// Dataset specific properties
switch(inputData)
{
  // NasNet, V3C1 20k dataset
case 2:
  
  b = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.preSoftmaxFilename2);
  c = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.keywordClassesFilename2);
  d = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.softmaxFilename2);
  e = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.deepFeaturesFilename2);
  f = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.imagesDirList2);
  g = global.gConfig.idOffset2;

  break;

  // GoogLeNet, V3C1 20k dataset
case 3:
  
  b = path.join(global.rootDir, global.gConfig.pathData3 + global.gConfig.preSoftmaxFilename3);
  c = path.join(global.rootDir, global.gConfig.pathData3 + global.gConfig.keywordClassesFilename3);
  d = path.join(global.rootDir, global.gConfig.pathData3 + global.gConfig.softmaxFilename3);
  e = path.join(global.rootDir, global.gConfig.pathData3 + global.gConfig.deepFeaturesFilename3);
  f = path.join(global.rootDir, global.gConfig.pathData2 + global.gConfig.imagesDirList2);
  g = global.gConfig.idOffset3;

  break;

  // NasNet, V3C1 1M dataset
  //  => TRECVID data
case 4:
  
  b = path.join(global.rootDir, global.gConfig.pathData4 + global.gConfig.preSoftmaxFilename4);
  c = path.join(global.rootDir, global.gConfig.pathData4 + global.gConfig.keywordClassesFilename4);
  d = path.join(global.rootDir, global.gConfig.pathData4 + global.gConfig.softmaxFilename4);
  e = path.join(global.rootDir, global.gConfig.pathData4 + global.gConfig.deepFeaturesFilename4);
  f = path.join(global.rootDir, global.gConfig.pathData4 + global.gConfig.imagesDirList4);
  g = global.gConfig.idOffset4;

  if (doTrecvid)
  {
    // Setup filepaths to task sources
    outputPath = path.join(global.rootDir, "/output/");

    // If just testing TRECVID 
    if (testTrecvid)
    {
      normalTasks = path.join(global.rootDir, global.gConfig.pathData4 + "/tasks/testing/tasks_normal.txt");
      progressTasks = path.join(global.rootDir, global.gConfig.pathData4 + "/tasks/testing/tasks_progress.txt");  
    }
    else 
    {
      normalTasks = path.join(global.rootDir, global.gConfig.pathData4 + "/tasks/2019/tasks_normal.txt");
      progressTasks = path.join(global.rootDir, global.gConfig.pathData4 + "/tasks/2019/tasks_progress.txt");
    }

    global.gConfig.outputPath = outputPath;
    global.gConfig.normalTasks = normalTasks;
    global.gConfig.progressTasks = progressTasks;

    // Log it out
    global.logger.log('debug', "TRECVID SPECIFIC:");
  }

  break;
}

// Log 
global.logger.log('debug', "ImageRanker constructor arguments:");
global.logger.log('debug', a);
global.logger.log('debug', b);
global.logger.log('debug', c);
global.logger.log('debug', d);
global.logger.log('debug', e);
global.logger.log('debug', f);
global.logger.log('debug', g);
global.logger.log('debug', h);


// Create global instance if ImageRanker
global.imageRanker = new imageRanker.ImageRankerWrapper(a, b, c, d, e, f, g, h);

// Initialize ImageRanker instance
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

app.use('/query_annotator', annotatorRouter);

app.use('/ranker', rankerRouter);
app.use('/ranker_negate', rankerNegateRouter);
app.use('/trecvid_ranker', trecvidRankerRouter);


app.use('/statistics', statisticsRouter);


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

// Trecvid ranker AJAXes
app.post('/trecvid_ranker_ajax_start_run_normal', trecvidAjaxRankerRouter.startRunNormal);
app.post('/trecvid_ranker_ajax_start_run_progress', trecvidAjaxRankerRouter.startRunProgress);
app.post('/trecvid_ranker_ajax_submit_task', trecvidAjaxRankerRouter.submitTask);
app.post('/trecvid_ranker_ajax_next_task', trecvidAjaxRankerRouter.nextTask);


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
