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

exports.setNotInitial = function (req, res) {
  const sess = req.session;

  SessionState.ranker_setIsInitial(sess.state, false);

  res.status(200).jsonp({});
};

exports.pushSearchAction = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => pushSearchAction()");

  const searchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  const time_in_ms = Date.now() - searchSess.startTs;

  const oldQueries = SessionState.ranker_getUserQuery(sess.state, 0);

  global.logger.log("debug", "PRE: \n" + JSON.stringify(oldQueries, null, 4));

  const body = req.body;

  let action = null;
  let operand = null;
  let word = null;

  if (body.action) {
    action = body.action;
    operand = body.operand;
    word = body.word;

    // Project action to queries
    SessionState.ranker_processQueryAction(sess.state, 0, action, operand, word);
  }
  const newQueries = SessionState.ranker_getUserQuery(sess.state, 0);

  global.logger.log("debug", "POST: \n" + JSON.stringify(newQueries, null, 4));

  // +++++++++++++++++++++++++++++++++++++++++++++
  // Get updated search results

  let userQuery = SessionState.ranker_getUserQueryStrings(sess.state);
  const dataPackId = SessionState.ranker_getDataPackId(sess.state);
  const imagesetId = SessionState.getActieImageset(sess.state);
  const modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);
  const isNativeQuery = SessionState.ranker_getFullyNative(sess.state);

  if (isNativeQuery)
  {
    userQuery = SessionState.ranker_getUserQueryStringsNative(sess.state);
  }
  const resultSize = global.gConfig.ranker.resultSizeLimit;

  const currSearchSessBefore = SessionState.ranker_getCurrentSearchSession(sess.state);
  const targetFrame = currSearchSessBefore.targetFramesIds[0];

  let queryResult = global.imageRanker.rankFrames(
    userQuery,
    dataPackId,
    imagesetId,
    modelOptions,
    isNativeQuery,
    resultSize,
    targetFrame.frameId
  );

  // +++++++++++++++++++++++++++++++++++++++++++++

  // Store this action
  if (body.action) {
    const rank = queryResult.target_position;
    SessionState.pushSearchSessionAction(
      sess.state,
      0,
      action,
      Number(operand),
      Number(rank),
      Number(time_in_ms),
      word
    );
  }

  // Construct chart data
  const chartData = SessionState.getSearchSessionActionsForChart(sess.state);
  const currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  const ssState = SessionState.ranker_getState(sess.state);
  const rankerUi = SessionState.ranker_getCurrentUiState(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: Added new action...");

  global.logger.log("debug", "<" + sess.id + ">: <= pushSearchAction()");

  const isInitial = SessionState.ranker_getIsInitial(sess.state, true);
  if (isInitial) {
    queryResult = null;
  }

  res.status(200).jsonp({
    searchSession: currSearchSess,
    ui: rankerUi,
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
  const activeDataPack = SessionState.getActiveDataPackId(sess.state);

  let targetFramesIds = body.targetFramesIds;
  if (targetFramesIds.length == 0) {
    targetFramesIds = global.imageRanker.getRandomFrameSequence(activeImgSet, activeDataPack, 1);
  }

  // Write the session
  SessionState.ranker_goToState_running(sess.state, targetFramesIds);

  const currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state, targetFramesIds);
  const ssState = SessionState.ranker_getState(sess.state);
  const rankerUi = SessionState.ranker_getCurrentUiState(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: currentSearchSession:" + JSON.stringify(currSearchSess, null, 4));
  global.logger.log("debug", "<" + sess.id + ">: currentSearchSession STATE:" + ssState);

  global.logger.log("debug", "<" + sess.id + ">: <= startSearchSession()");
  res.status(200).jsonp({
    searchSession: currSearchSess,
    state: ssState,
    ui: rankerUi,
  });
};

exports.discardSearchSession = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "=> discardSearchSession()");

  const body = req.body;

  SessionState.ranker_goToState_nosess(sess.state);

  let currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  let ssState = SessionState.ranker_getState(sess.state);
  const rankerUi = SessionState.ranker_getCurrentUiState(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: <= discardSearchSession()");
  res.status(200).jsonp({
    searchSession: currSearchSess,
    state: ssState,
    ui: rankerUi,
  });
};

exports.submitFrame = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => submitFrame()");

  const body = req.body;
  const submittedFrameId = body.frameId;

  let currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  let ssState = SessionState.ranker_getState(sess.state);
  const dataPackId = SessionState.ranker_getDataPackId(sess.state);
  const modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);
  const userLevel = SessionState.getUserLevel(sess.state);
  const withExampleImages = true;

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

  currSearchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  ssState = SessionState.ranker_getState(sess.state);

  const targetId = currSearchSess.targetFramesIds[0].frameId;

  // ========================================
  // Submit using native call
  global.imageRanker.submitSearchSession(
    dataPackId,
    modelOptions,
    userLevel,
    withExampleImages,
    currSearchSess.found,
    targetId,
    currSearchSess.duration,
    req.session.id,
    currSearchSess.actions
  );
  // ========================================

  const chartData = SessionState.getSearchSessionActionsForChart(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: <= submitFrame()");
  res.status(200).jsonp({
    searchSession: currSearchSess,
    state: ssState,
    chartData: chartData,
  });
};

exports.getFrameDetailData = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => startSearchSession()");

  const frameId = Number(req.query.frameId);
  const dataPackId = SessionState.ranker_getDataPackId(sess.state);
  const imagesetId = SessionState.getActieImageset(sess.state);
  const modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);
  const withExampleFrames = true;
  const accumulated = false;

  // -------------------------------
  // Native call
  const frameData = global.imageRanker.getFrameDetailData(
    frameId,
    dataPackId,
    imagesetId,
    modelOptions,
    withExampleFrames,
    accumulated
  );
  // -------------------------------

  res.status(200).jsonp(frameData);
};
