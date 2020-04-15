
// Require modules for server run
var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let utils = require("./routes/utils/utils");

const mysql = require('mysql');

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
var dataCenterRouter = require('./routes/data_center');

const endpoints = require("./routes/endpoints/endpoints")

const settingsAjaxRouter = require("./routes/settings_ajax");
const annotatorRouter = require("./routes/annotator");
const nativeAnnotatorRouter = require("./routes/native_annotator");
const annotatorAjaxRouter = require("./routes/annotator_ajax");
const rankerRouter = require("./routes/ranker");
const trecvidRankerRouter = require("./routes/trecvid_ranker");
const trecvidAjaxRankerRouter = require("./routes/trecvid_ranker_ajax");
const rankerNegateRouter = require("./routes/ranker_negate");
const rankerAjaxRouter = require("./routes/ranker_ajax");
const rankerAjaxNegateRouter = require("./routes/ranker_ajax_negate");
const statisticsRouter = require("./routes/statistics");
const statisticsAjaxRouter = require("./routes/statistics_ajax");
const exporterAjaxRouter = require("./routes/exporter_ajax");
const dataCenterAjaxRouter = require("./routes/data_center_ajax");

var testsAjax = require('./routes/tests_ajax');
var imagesAjax = require('./routes/images_ajax');
var api = require('./routes/api');

global.dbConnectionsPool = mysql.createPool({
  host: global.gConfig.db.host,
  port: global.gConfig.db.port,
  user: global.gConfig.db.user,
  password: global.gConfig.db.password,
  database: global.gConfig.db.dbName
});

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

const dataInfoFpth = global.gConfig.dataInfoFpth;
const dataDir = global.gConfig.dataDir;

global.logger.log('debug', "process.env = '" + process.env["NODE_ENV"] + "'");

global.logger.log('debug', "NATIVE CALL: ImageRanker()");
global.logger.log('debug', "\tdataInfoFpth = " + dataInfoFpth);
global.logger.log('debug', "\tdataDir = " + dataDir);

// Create global instance if ImageRanker
global.imageRanker = new imageRanker.ImageRankerWrapper(dataInfoFpth, dataDir);
global.logger.log('debug', "ImageRanker instantiated...");

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

app.use('/ranker', rankerRouter);
app.use('/ranker_negate', rankerNegateRouter);
app.use('/trecvid_ranker', trecvidRankerRouter);

app.use('/statistics', statisticsRouter);
app.use('/data_center', dataCenterRouter);
app.use('/native_annotator', nativeAnnotatorRouter);

// Request endpoints
app.post('/set_active_data_pack', endpoints.setActiveDataPack);

app.post('/settings_ajax_set_kw_sc_data_type', settingsAjaxRouter.SetKeywordScoringDataType);
app.post('/data_center_ajax_get_annotator_user_data', dataCenterAjaxRouter.GetAnnotatorUserData);
app.post('/data_center_ajax_validate_user_data_record', dataCenterAjaxRouter.ValidateUserDataRecord);

app.post('/exporter_ajax_export_file', exporterAjaxRouter.ExportFile);
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

app.post('/trecvid_ranker_ajax_start_run_normal', trecvidAjaxRankerRouter.startRunNormal);
app.post('/trecvid_ranker_ajax_start_run_progress', trecvidAjaxRankerRouter.startRunProgress);
app.post('/trecvid_ranker_ajax_submit_task', trecvidAjaxRankerRouter.submitTask);
app.post('/trecvid_ranker_ajax_next_task', trecvidAjaxRankerRouter.nextTask);

app.get('/annotator_ajax', annotatorAjaxRouter.GetNearKeywords);
app.get('/annotator_ajax_get_near_keywords_with_examples', annotatorAjaxRouter.GetNearKeywordsWithExamples);

app.get('/api_get_relevant_images', api.getRelevantImagesFromPlainQuery);

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
