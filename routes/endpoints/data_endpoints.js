"use strict";

const fs = require("fs");
const path = require("path");

const SessionState = require("../classes/SessionState");

exports.getSearchSessionsRankProgressChartData = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => getSearchSessionsRankProgressChartData()");

  const dataPackId = SessionState.ranker_getDataPackId(sess.state);
  const modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);

  // -------------------------------
  // Native call
  //const frameData = global.imageRanker.getFrameDetailData(  );
  // -------------------------------

  global.logger.log("debug", "<" + sess.id + ">: <= getSearchSessionsRankProgressChartData()");
  res.status(200).jsonp(frameData);
};
