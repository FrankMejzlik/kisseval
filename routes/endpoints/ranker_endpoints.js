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

  global.logger.log(
    "debug",
    "<" + sess.id + ">: \t Changing model options to: '" + optionsStr + "'"
  );

  SessionState.ranker_setActiveModelOptions(sess.state, optionsStr);

  global.logger.log(
    "debug",
    "<" +
      sess.id +
      ">: \t activeOptions = " +
      SessionState.ranker_getActiveModelOptions(req.session.state)
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
  const rank = body.rank;

  const searchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  const time_in_ms = searchSess.startTs - Date.now();

  // Store this action
  SessionState.pushSearchSessionAction(
    sess.state,
    0,
    action,
    Number(operand),
    Number(rank),
    Number(time_in_ms)
  );

  // +++++++++++++++++++++++++++++++++++++++++++++
  // Get updated search results

  const userQuery = SessionState.ranker_getUserQueryStrings(sess.state);
  const dataPackId = SessionState.ranker_getDataPackId(sess.state);
  const modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);
  const isNativeQuery = SessionState.ranker_getFullyNative(sess.state);
  const resultSize = global.gConfig.ranker.resultSizeLimit;

  const currSearchSessBefore = SessionState.ranker_getCurrentSearchSession(
    sess.state
  );
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

  // Construct chart data
  const chartData = SessionState.getSearchSessionActionsForChart(sess.state);
  const currSearchSess = SessionState.ranker_getCurrentSearchSession(
    sess.state,
    targetFramesIds
  );
  const ssState = SessionState.ranker_getState(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: Added new action...");
  global.logger.log(
    "debug",
    "<" +
      sess.id +
      ">: \t newAction: " +
      "action: " +
      action +
      "operand: " +
      operand +
      "rank: " +
      rank +
      "time: " +
      time
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
    targetFramesIds = global.imageRanker.getRandomFrameSequence(
      activeImgSet,
      1
    );
  }

  // Write the session
  SessionState.ranker_goToState_running(sess.state, targetFramesIds);

  const currSearchSess = SessionState.ranker_getCurrentSearchSession(
    sess.state,
    targetFramesIds
  );
  const ssState = SessionState.ranker_getState(sess.state);

  global.logger.log(
    "debug",
    "<" +
      sess.id +
      ">: currentSearchSession:" +
      JSON.stringify(currSearchSess, null, 4)
  );
  global.logger.log(
    "debug",
    "<" + sess.id + ">: currentSearchSession STATE:" + ssState
  );

  global.logger.log("debug", "<" + sess.id + ">: <= startSearchSession()");
  res.status(200).jsonp({
    searchSession: currSearchSess,
    state: ssState,
  });
};

exports.cancelSearchSession = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "=> cancelSearchSession()");

  const body = req.body;

  SessionState.ranker_ui_goToState_nosess(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: <= cancelSearchSession()");
  res.status(200).jsonp(true);
};

exports.submitFrame = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => submitFrame()");

  const body = req.body;

  // Store this action
  //SessionState.pushSearchSessionAction(sess.state, 0, action, Number(operand), Number(rank), Number(time_in_ms));

  global.logger.log("debug", "<" + sess.id + ">: <= submitFrame()");
  res.status(200).jsonp(false);
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
