"use strict";

const fs = require("fs");
const path = require("path");
const utils = require("../utils/utils")

const SessionState = require("../classes/SessionState");

exports.getSearchSessionsRankProgressChartData = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => getSearchSessionsRankProgressChartData()");

  const normalize = false;
  const minNumSamples = 20;
  const maxUserLevel = 9;

  const dataPackId = SessionState.ranker_getDataPackId(sess.state);
  //const modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);

  let resData = {};
  let resStatus = 200;
  // -------------------------------
  // Native call
  try {
    const chartData = global.imageRanker.getSearchSessionsRnkProgressCharData(dataPackId, "", maxUserLevel, minNumSamples, normalize);
    const csvString0 = utils.getCsvChartData(chartData.aggregate_quantile_chart);
    const csvString1 = utils.getCsvMultiLineChartData(chartData.median_multichart);


    resData.chartData = chartData;
    
    const dir = path.join(global.rootDir, "/public/", global.gConfig.exportDir, "/");
    const filename0 = Date.now() + "_" + dataPackId + "_search_sessions_rank_progress_chart_data.json";
    const filename1 = Date.now() + "_" + dataPackId + "_search_sessions_rank_progress_chart_data.csv";

    const filename10 = Date.now() + "_" + dataPackId + "_search_sessions_rank_medians_data.json";
    const filename11 = Date.now() + "_" + dataPackId + "_search_sessions_rank_medians_data.csv";

    resData.filename0 = global.gConfig.exportDir + "/" + filename0; 
    resData.filename1 = global.gConfig.exportDir + "/" + filename1; 

    resData.filename10 = global.gConfig.exportDir + "/" + filename10; 
    resData.filename11 = global.gConfig.exportDir + "/" + filename11; 
    

    // Write data to the JSON & CSV
    fs.writeFile(dir + filename0, JSON.stringify(chartData.aggregate_quantile_chart, 4), function (err) {
      if (err) {
        throw Error(err);
      }
    });
    fs.writeFile(dir + filename1, csvString0, function (err) {
      if (err) {
        throw Error(err);
      }
    });

    // Write data to the JSON & CSV
    fs.writeFile(dir + filename10, JSON.stringify(chartData.median_multichart, 4), function (err) {
      if (err) {
        throw Error(err);
      }
    });
    fs.writeFile(dir + filename11, csvString1, function (err) {
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


exports.getLabelHistogramData = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => getSearchSessionsRankProgressChartData()");


  const accumulated = req.body.accumulated;

  let accStr = "notaccum";
  if (accumulated) {
    accStr = "accum";
  }
  const numPoints = 400;

  const dataPackId = SessionState.ranker_getDataPackId(sess.state);
  //const modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);

  let resData = {};
  let resStatus = 200;
  // -------------------------------
  // Native call
  try {
    const chartData = global.imageRanker.getHistogramUsedLabels(dataPackId, "", numPoints, accumulated, 9);
    const csvString = utils.getCsvChartData(chartData);
    resData.chartData = chartData;
    
    const dir = path.join(global.rootDir, "/public/", global.gConfig.exportDir, "/");
    const filename0 = Date.now() + "_" + dataPackId + "_label_histogram_data_" + accStr + ".json";
    const filename1 = Date.now() + "_" + dataPackId + "_label_histogram_data_" + accStr + ".csv";

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
