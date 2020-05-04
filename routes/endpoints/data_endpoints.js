"use strict";

const fs = require("fs");
const path = require("path");
const utils = require("../utils/utils")

const SessionState = require("../classes/SessionState");

exports.getSearchSessionsRankProgressChartData = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => getSearchSessionsRankProgressChartData()");

  const dataPackId = SessionState.ranker_getDataPackId(sess.state);
  //const modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);

  let resData = {};
  let resStatus = 200;
  // -------------------------------
  // Native call
  try {
    const chartData = global.imageRanker.getSearchSessionsRnkProgressCharData(dataPackId, "", 9);
    const csvString = utils.getCsvChartData(chartData);
    resData.chartData = chartData;
    
    const dir = path.join(global.rootDir, "/public/", global.gConfig.exportDir, "/");
    const filename0 = Date.now() + "_" + dataPackId + "_search_sessions_rank_progress_chart_data.json";
    const filename1 = Date.now() + "_" + dataPackId + "_search_sessions_rank_progress_chart_data.csv";

    resData.filename0 = global.gConfig.exportDir + "/" + filename0; 
    resData.filename1 = global.gConfig.exportDir + "/" + filename1; 
    

    // Write data to the JSON & CSV
    fs.writeFile(dir + filename0, JSON.stringify(chartData, 4), function (err) {
      if (err) {
        throw Error(err);
      }
    });
    fs.writeFile(dir + filename1, csvString, function (err) {
      if (err) {
        throw Error(err);
      }
    });

    
    
  } catch (e) {
    resData = {
      error: { message: e.message }
    };
    resStatus = 400;
  }
  // -------------------------------

  global.logger.log("debug", "<" + sess.id + ">: <= getSearchSessionsRankProgressChartData()");
  res.status(resStatus).jsonp(resData);
};
