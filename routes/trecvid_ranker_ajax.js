

const util = require('util')

const utils = require("./utils/utils");
const rankerUtils = require("./utils/ranker_utils");
const trecvidRankerUtils = require("./utils/trecvid_ranker_utils");

exports.startRunNormal = function(req, res) 
{
  global.logger.log('debug', "=> startRunNormal()");

  // Get session object reference
  const sess = req.session;

  // Start RUN
  trecvidRankerUtils.startTrecvidRun(sess, global.gConfig.normalTasks, "M");

  // Terminate this task session
  trecvidRankerUtils.startTrecvidTaskSession(sess);

  const taskId = sess.trecvidRun.tasks[sess.trecvidSession.currTaskIdx].id;
  const taskString = sess.trecvidRun.tasks[sess.trecvidSession.currTaskIdx].string;


  global.logger.log('debug', "<= startRunNormal()");

  let response = new Object();
  response.taskId = taskId;
  response.taskString = taskString;

  res.jsonp(response);
}

exports.startRunProgress = function(req, res) 
{
  global.logger.log('debug', "=> startRunProgress()");

  // Get session object reference
  const sess = req.session;

  // Start RUN
  trecvidRankerUtils.startTrecvidRun(sess, global.gConfig.progressTasks, "P");

  // Terminate this task session
  trecvidRankerUtils.startTrecvidTaskSession(sess);

  const taskId = sess.trecvidRun.tasks[sess.trecvidSession.currTaskIdx].id;
  const taskString = sess.trecvidRun.tasks[sess.trecvidSession.currTaskIdx].string;

  global.logger.log('debug', "<= startRunProgress()");

  let response = new Object();
  response.taskId = taskId;
  response.taskString = taskString;

  res.jsonp(response);
}

exports.nextTask = function(req, res) 
{
  // Gsesset session object reference
  const sess = req.session;

  global.logger.log('debug', "=> nextTask()");

  // Terminate this task session
  trecvidRankerUtils.startTrecvidTaskSession(sess);

  const taskId = sess.trecvidRun.tasks[sess.trecvidSession.currTaskIdx].id;
  const taskString = sess.trecvidRun.tasks[sess.trecvidSession.currTaskIdx].string;

  let response = new Object();
  response.taskId = taskId;
  response.taskString = taskString;

  global.logger.log('debug', "<= nextTask()");

  res.jsonp(response);
}

exports.submitTaskk = function(req, res) 
{
  global.logger.log('debug', "=> submitTask()");
  const sess = req.session;

  var keywords = req.body.keyword;
  const keywordsWords = req.body.keywordWord;

  var keywords2 = req.body.keyword2;
  const keywordsWords2 = req.body.keywordWord2;

  // Get all needed things for calling native method
  const settingsForNative = utils.convertSettingsObjectToNativeFormat(sess.ranker.settings); 

  //
  // Query 1
  //
  sess.ranker.query = new Array();
  sess.ranker.queryWords = new Array();
  if (typeof keywords !== "undefined")
  {
    for (let i = 0; i < keywords.length; ++i)
    {
      sess.ranker.query.push(keywords[i]);
      sess.ranker.queryWords.push(keywordsWords[i]);
    }
  }


  //
  // Query 2
  //
  sess.ranker.query2 = new Array();
  sess.ranker.queryWords2 = new Array();
  if (typeof keywords2 !== "undefined")
  {
    for (let i = 0; i < keywords2.length; ++i)
    {
      sess.ranker.query2.push(keywords2[i]);
      sess.ranker.queryWords2.push(keywordsWords2[i]);
    }
  }

  // Join queries with ampersand
  const queryPlain = sess.ranker.query.join("&");
  const queryPlain2 = sess.ranker.query2.join("&");

  // Construct final queries
  let queriesPlain = new Array();
  queriesPlain.push(queryPlain);
  if (queryPlain2 != "")
  {
    queriesPlain.push(queryPlain2);
  }

  // Response for not switching state
  let response = 1;

  // If there is something to submit
  if (sess.ranker.query.length > 0)
  {
    // Get elapsed time up to this point
    var date = new Date();
    var timestamp = date.getTime();

    const microSecondsDiff = Math.abs(sess.trecvidSession.startTimestamp - timestamp);
    const sessionDurationInSeconds = Math.floor(microSecondsDiff/(1000));


    // const resultShots = global.imageRanker.TrecvidGetRelevantShots(
    //   queriesPlain, 
    //   1000, 
    //   settingsForNative.aggregation, 
    //   settingsForNative.rankingModel, 
    //   settingsForNative.rankingModelSettings, 
    //   settingsForNative.aggregationSettings,
    //   sessionDurationInSeconds,
    //   0
    // );

    let resultShots = new Object();
    resultShots.elapsedTime = 1.0;
    resultShots.shots = new Array();


    // ===============================
    // Print provided results into output XML
    trecvidRankerUtils.printXmlShots(sess, resultShots.elapsedTime, resultShots.shots);
    // ===============================

    
    // Increment task index
    ++sess.trecvidSession.currTaskIdx;

    // Response for switching to state TASK SUBMITTED
    response = 2;
  }
    
  // If this was last run task
  if (sess.trecvidSession.currTaskIdx >= sess.trecvidRun.tasks.length)
  {
    // Terminate this run
    trecvidRankerUtils.terminateTrecvidRun(sess);
    
    // Reset trecvid session IDs
    sess.trecvidSession = undefined;

    // Response for switching to state NO RUN STATE
    response = 0;
  }

  
  global.logger.log('debug', "<= submitTask()");
  res.jsonp(response);
}

