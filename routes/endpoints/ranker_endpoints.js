"use strict";

const fs = require("fs");
const path = require("path");

const SessionState = require("../classes/SessionState");

exports.setModelOptions = function (req, res) {
  const sess = req.session;
  const body = req.body;

  global.logger.log("debug", "<" + sess.id + ">: => setModelOptions()");

  let optionsStr = "";
  for (const [formId, options] of Object.entries(body)) {
    // Stringify options
    for (const [opt_key, opt_val] of Object.entries(options)) {
      optionsStr += `${String(opt_key)}=${String(opt_val)};`;
    }
    break;
  }

  global.logger.log("debug", "<" + sess.id + ">: \t Changing model options to: '" + optionsStr + "'");

  SessionState.ranker_setActiveModelOptions(sess.state, optionsStr);

  global.logger.log(
    "debug",
    "<" + sess.id + ">: \t activeOptions = " + SessionState.ranker_getActiveModelOptions(req.session.state)
  );

  res.st;
  global.logger.log("debug", "<" + sess.id + ">: <= setModelOptions()");

  res.status(200).jsonp(true);
};

exports.pushSearchAction = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => pushSearchAction()");

  const body = req.body;

  const action = body.action;
  const operand = body.operand;
  const word = body.word;

  const searchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  const time_in_ms = Date.now() - searchSess.startTs;

  const oldQueries = SessionState.ranker_getUserQuery(sess.state, 0);

  global.logger.log("debug", "PRE: \n" + JSON.stringify(oldQueries, null, 4));

  // Project action to queries
  SessionState.ranker_processQueryAction(sess.state, 0, action, operand, word);
  const newQueries = SessionState.ranker_getUserQuery(sess.state, 0);

  global.logger.log("debug", "POST: \n" + JSON.stringify(newQueries, null, 4));

  // +++++++++++++++++++++++++++++++++++++++++++++
  // Get updated search results

  const userQuery = SessionState.ranker_getUserQueryStrings(sess.state);
  const dataPackId = SessionState.ranker_getDataPackId(sess.state);
  const modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);
  const isNativeQuery = SessionState.ranker_getFullyNative(sess.state);
  const resultSize = global.gConfig.ranker.resultSizeLimit;

  const currSearchSessBefore = SessionState.ranker_getCurrentSearchSession(sess.state);
  const targetFrame = currSearchSessBefore.targetFramesIds[0];

  const queryResult = global.imageRanker.rankFrames(
    userQuery,
    dataPackId,
    modelOptions,
    isNativeQuery,
    resultSize,
    targetFrame.frameId
  );

  // +++++++++++++++++++++++++++++++++++++++++++++

  // Store this action
  const rank = queryResult.target_position;
  SessionState.pushSearchSessionAction(sess.state, 0, action, Number(operand), Number(rank), Number(time_in_ms), word);

  // Construct chart data
  const chartData = SessionState.getSearchSessionActionsForChart(sess.state);
  const currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  const ssState = SessionState.ranker_getState(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: Added new action...");
  global.logger.log(
    "debug",
    "<" +
      sess.id +
      ">:" +
      "action: " +
      action +
      "\n" +
      "operand: " +
      operand +
      "\n" +
      "rank: " +
      rank +
      "\n" +
      "time: " +
      time_in_ms +
      "\n"
  );

  global.logger.log("debug", "<" + sess.id + ">: <= pushSearchAction()");

  res.status(200).jsonp({
    searchSession: currSearchSess,
    state: ssState,
    chartData: chartData,
    queryResult: queryResult,
  });
};

exports.startSearchSession = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => startSearchSession()");

  const body = req.body;

  const activeImgSet = SessionState.getActieImageset(sess.state);

  let targetFramesIds = body.targetFramesIds;
  if (targetFramesIds.length == 0) {
    targetFramesIds = global.imageRanker.getRandomFrameSequence(activeImgSet, 1);
  }

  // Write the session
  SessionState.ranker_goToState_running(sess.state, targetFramesIds);

  const currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state, targetFramesIds);
  const ssState = SessionState.ranker_getState(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: currentSearchSession:" + JSON.stringify(currSearchSess, null, 4));
  global.logger.log("debug", "<" + sess.id + ">: currentSearchSession STATE:" + ssState);

  global.logger.log("debug", "<" + sess.id + ">: <= startSearchSession()");
  res.status(200).jsonp({
    searchSession: currSearchSess,
    state: ssState,
  });
};

exports.discardSearchSession = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "=> discardSearchSession()");

  const body = req.body;

  SessionState.ranker_goToState_nosess(sess.state);

  let currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  let ssState = SessionState.ranker_getState(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: <= discardSearchSession()");
  res.status(200).jsonp({
    searchSession: currSearchSess,
    state: ssState,
  });
};

exports.submitFrame = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => submitFrame()");

  const body = req.body;
  const submittedFrameId = body.frameId;

  let currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  let ssState = SessionState.ranker_getState(sess.state);

  // Check giveup
  if (submittedFrameId == null) {
    // Give up
    SessionState.ranker_goToState_finished(sess.state, false);
  }
  // Check if correct
  else if (submittedFrameId == currSearchSess.targetFramesIds[0].frameId) {
    // Finish session
    SessionState.ranker_goToState_finished(sess.state, true);
  } else {
    // Incorrect submit
    res.status(200).jsonp({
      searchSession: currSearchSess,
      state: ssState,
    });
    return;
  }

  // ========================================
  // Submit using native call
  // global.imageRanker.submitSearchSession();
  // ========================================

  currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  ssState = SessionState.ranker_getState(sess.state);

  const chartData = SessionState.getSearchSessionActionsForChart(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: <= submitFrame()");
  res.status(200).jsonp({
    searchSession: currSearchSess,
    state: ssState,
    chartData: chartData,
  });
};

// ==============================================
// vv Not refactored vv
// ==============================================

// var eActions = {
//   removeKeyword: 0,
//   addKeyword: 1,
// };

// exports.startSearchSession = function (sess, targetImages) {
//   global.logger.log("debug", "<" + sess.id + ">: => startSearchSession()");

//   // Initialize session counter if needed
//   if (typeof sess.ranker.searchSessionCounter == "undefined") {
//     sess.ranker.searchSessionCounter = 0;
//   }

//   // Start new
//   sess.ranker.searchSession = new Object();
//   // Git it unique ID
//   sess.ranker.searchSession.id = sess.ranker.searchSessionCounter;

//   sess.ranker.searchSession.targetImages = targetImages;

//   sess.ranker.searchSession.actionsArray = new Array();

//   var date = new Date();
//   var timestamp = date.getTime();
//   sess.ranker.searchSession.startTimestamp = timestamp;

//   // Increment counter
//   ++sess.ranker.searchSessionCounter;

//   global.logger.log("debug", "<" + sess.id + ">: Started search session... ");
//   global.logger.log(
//     "debug",
//     "<" + sess.id + ">: \t searchSessionIndex = " + sess.ranker.searchSession.id
//   );
//   global.logger.log("debug", "<" + sess.id + ">: <= startSearchSession()");
// };
