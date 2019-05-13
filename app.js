
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
const rankerAjaxRouter = require("./routes/ranker_ajax");
const statisticsRouter = require("./routes/statistics");
const statisticsAjaxRouter = require("./routes/statistics_ajax");

var collectorAjax = require('./routes/collector_ajax');
var testsAjax = require('./routes/tests_ajax');
var imagesAjax = require('./routes/images_ajax');
var api = require('./routes/api');



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


global.getDefaultModelSettingsObject = function()
{
  selectedSettings = new Object();

  selectedSettings.numResults = 500;
  selectedSettings.aggregation = 100;
  selectedSettings.aggregationParameter = 1;
  selectedSettings.rankingModel = 3;
  selectedSettings.keywordFrequency = 0;
  selectedSettings.dataSource = 0;
  
  selectedSettings.boolean_trueTreshold = 0.001;
  selectedSettings.boolean_inBucketRanking = 0;

  selectedSettings.viret_probTreshold = 0.0;
  selectedSettings.viret_queryOperations = 1;

  return selectedSettings;
}

global.initializeModelSettings = function(sessionObject)
{ 
  // If ranker session object not initialized yet
  if (typeof sessionObject.ranker === "undefined")
  {
    if (global.gConfig.log_all)
    {
      console.log("Initializing sess.ranker object for session " + sessionObject.id);
    }
    sessionObject.ranker = new Object();
  }
  if (typeof sessionObject.ranker.settings === "undefined")
  {
    sessionObject.ranker.settings = global.getDefaultModelSettingsObject();
  }
};

global.parseModelSettingsFromForm = function(formBbody)
{ 
  // Get default values
  let settings = global.getDefaultModelSettingsObject();

  // If some are set, just overwrite them
  if (typeof formBbody.numResults !== "undefined")
  {
    settings.numResults = formBbody.numResults;
  }   
  if (typeof formBbody.aggregation !== "undefined")
  {
    settings.aggregation = formBbody.aggregation;
  }
  if (typeof formBbody.aggregationParameter !== "undefined")
  {
    settings.aggregationParameter = formBbody.aggregationParameter;
  }
  if (typeof formBbody.rankingModel !== "undefined")
  {
    settings.rankingModel = formBbody.rankingModel;
  }


  if (typeof formBbody.keywordFrequency !== "undefined")
  {
    settings.keywordFrequency = formBbody.keywordFrequency;
  }
  if (typeof formBbody.dataSource !== "undefined")
  {
    settings.dataSource = formBbody.dataSource;
  }

  // Boolean specific
  if (typeof formBbody.boolean_trueTreshold !== "undefined")
  {
    settings.boolean_trueTreshold = formBbody.boolean_trueTreshold;
  }
  if (typeof formBbody.boolean_inBucketRanking !== "undefined")
  {
    settings.boolean_inBucketRanking = formBbody.boolean_inBucketRanking;
  }

  // Viret specific
  if (typeof formBbody.viret_trueTreshold !== "undefined")
  {
    settings.viret_probTreshold = formBbody.viret_trueTreshold;
  }
  if (typeof formBbody.viret_queryOperations !== "undefined")
  {
    settings.viret_queryOperations = formBbody.viret_queryOperations;
  }

  return settings;
};

global.convertSettingsObjectToNativeFormat = function(settings)
{ 
  let result = new Object();

  result.keywordFrequency = settins.keywordFrequency;
  result.dataSource = settins.dataSource;
  result.rankingModel = settings.rankingModel;
  result.rankingModelSettings = new Array();
  {
    switch (settings.rankingModel)
    {
      /*!
      * FORMAT:
      *  0: Boolean:
      *  1: BooleanBucket:
      *    0 => trueTreshold
      *    1 => inBucketSorting
      *  2: BooleanExtended:
      *  3: ViretBase:
      *    0 => ignoreTreshold
      *    1 => rankCalcMethod
      *      0: Multiply & (Add |)
      *      1: Add only
      *  4: FuzzyLogic:
      */
  
      // BooleanBucket
      case 1:
      {
        // 0 => 
        settingsArray.push(settings.boolean_trueTreshold);
  
        // 1 =>
        settingsArray.push(settings.boolean_inBucketRanking);
      }
      break;
  
      // ViretBase
      case 3:
      {
        // 0 =>
        settingsArray.push(selectedSettings.viret_probTreshold);
  
        // 1 =>
        settingsArray.push(settings.viret_queryOperations);
      }
      break;
  
      default:
        throw "Unknown model type.";
    }  
  }
  result.aggregation = settings.aggregation;
  result.aggregationSettings = new Array();
  {
    // Variable with all settings
    result.aggregationSettings.push(settings.aggregationParameter);
  }
  return result;
};

global.setUserLevel = function(sessionObject, level)
{
  sess.userLevel = level;
}

global.resolveUserLevel = function(sessionObject)
{
  if (typeof sessionObject.userLevel === "undefined")
  {
    // If loged as developer
    if (sessionObject.isDev)
    {
      sessionObject.userLevel = 10;
    }
    else 
    {
      sessionObject.userLevel = 1;
    }
  }
}

// Create global instance if ImageRanker
global.imageRanker = new imageRanker.ImageRankerWrapper(a,b,c,d,e,f,g, h);

global.imageRanker.Initialize();


if (global.gConfig.log_all == true)
{
  console.log(global.imageRanker);
}

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
//app.get('/ranker_ajax', rankerAjaxRouter);

app.use('/statistics', statisticsRouter);
//app.use('/statistics_ajax', statisticsAjaxRouter);

app.get('/ranker_ajax_submit_settings', rankerAjaxRouter.submitSettings);
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
