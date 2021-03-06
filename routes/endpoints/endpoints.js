"use strict";

const fs = require("fs");
const path = require("path");

const SessionState = require("../classes/SessionState");
const rankerEndpoints = require("./ranker_endpoints");

exports.setActiveDataPack = function (req, res) {
  const sess = req.session;

  const newDataPackId = req.body.dataPackId;
  
  // Find this pack and check if it's loaded
  for (const pack of global.loadedDataPacksInfo) {
    if (pack.id == newDataPackId) {
      // Set new state
      SessionState.setActieDataPack(sess.state, pack.id, pack.model_options, pack.description);
      SessionState.setActieImageset(sess.state, pack.target_imageset_ID);

      global.logger.log(
        "debug",
        "<" + req.session.id + "> \n" + "Active data pack changed to  '" + newDataPackId + "'"
      );
      rankerEndpoints.discardSearchSession(req, res);
      res.jsonp(true);
    }
  }

  global.logger.log(
    "debug",
    "<" + req.session.id + "> \n" + "Active data pack change failed. Pack '" + newDataPackId + "' not found."
  );

  res.jsonp(false);
};

exports.getAutocompleteResults = function (req, res) {
  const sess = req.session;

  let isRanker = false;
  if (typeof req.query.isRanker !== "undefined" && req.query.isRanker == "true") {
    isRanker = true;
  }
  const prefix = req.query.queryValue;

  // Get active settings from the current session
  const activeDataPackId = SessionState.getActiveDataPackId(sess.state);
  const activeImagesetId = SessionState.getActieImageset(sess.state);

  let modelOptions = SessionState.getActiveDataPackModelOptions(sess.state);
  if (isRanker) {
    modelOptions = SessionState.ranker_getActiveModelOptions(sess.state);
  }

  const withExImgs = SessionState.getAnnotWithExampleImages(sess.state);
  const numResults = SessionState.getAnnotNumResults(sess.state);

  global.logger.log(
    "debug",
    "<" +
      req.session.id +
      "> \n" +
      "=>(N) getAutocompleteResults() " +
      "\n\t activeDataPackId = " +
      activeDataPackId +
      "\n\t prefix = " +
      prefix +
      "\n\t numResults = " +
      numResults +
      "\n\t withExImgs = " +
      withExImgs
  );

  const nearKeywords = global.imageRanker.getAutocompleteResults(
    activeDataPackId,
    activeImagesetId,
    prefix,
    numResults,
    withExImgs,
    modelOptions
  );

  global.logger.log(
    "debug",
    "<" +
      req.session.id +
      "> \n" +
      "<=(N) getAutocompleteResults() " +
      "\n\t nearKeywords.length = " +
      nearKeywords.length +
      "\n\t nearKeywords[0] = " +
      (nearKeywords.length > 0 ? JSON.stringify(nearKeywords[0]) : null)
  );

  // Send response
  res.jsonp(nearKeywords);
};

exports.switchToEvaluatorMode = function (req, res) {
  const pass = req.body.pass;

  // Verify if correct pass
  if (pass == global.gConfig.devPass) {
    SessionState.setUserLevel(req.session.state, 10);
  }

  res.redirect(301, "/");
};

exports.switchToPublicMode = function (req, res) {
  const pass = req.body.pass;

  SessionState.setUserLevel(req.session.state, 1);

  res.redirect(301, "/");
};

exports.submitAnnotatorQuery = function (req, res) {
  const sess = req.session;

  const sessionId = sess.id;
  const frameSequence = SessionState.getAnnotImageSquence(sess.state);
  const activeDataPackId = SessionState.getActiveDataPackId(sess.state);
  const activeModelOptions = SessionState.getActiveDataPackModelOptions(sess.state);

  const fullyNative = SessionState.getAnnotFullyNative(sess.state);
  const withExampleImages = SessionState.getAnnotWithExampleImages(sess.state);

  // \todo User level is to be dynamic if made public
  const userLevel = 10;

  let encodedQuery = "";
  let readableQuery = "";
  if (req.body.query) {
    encodedQuery = req.body.query;
    readableQuery = req.body.query;
  } else {
    let keywordIds = req.body.keyword;
    // Make sure it's an array
    if (!Array.isArray(keywordIds)) {
      keywordIds = [keywordIds];
    }

    let queryStrings = req.body.keywordWord;

    // Make sure it's an array
    if (!Array.isArray(queryStrings)) {
      queryStrings = [queryStrings];
    }

    if (!fullyNative) {
      // Query with IDs
      encodedQuery += "&";
      for (const kwId of keywordIds) {
        encodedQuery += "-";
        encodedQuery += kwId;
        encodedQuery += "+";
      }

      // Readable query
      let i = 0;
      for (const word of queryStrings) {
        readableQuery += word;
        if (i < queryStrings.length - 1) {
          readableQuery += " && ";
        }
        ++i;
      }
    }
  }

  const userQueries = [
    {
      sessionId: sessionId,
      userQueryEncoded: [encodedQuery],
      userQueryReadable: [readableQuery],
      targetSequenceIds: frameSequence,
    },
  ];

  // \todo We ignore them for now
  // eslint-disable-next-line no-unused-vars
  const gameResults = global.imageRanker.submitAnnotatorUserQueries(
    activeDataPackId,
    activeModelOptions,
    userLevel,
    withExampleImages,
    userQueries
  );

  // Reset the presented target frame sequence
  SessionState.setAnnotImageSquence(sess.state, null);

  // \todo Make dynamic
  res.redirect(301, "/annotator/");
};

exports.runModelTests = function (req, res) {
  const body = req.body;

  console.log(JSON.stringify(body, null, 4));

  const dataPackId = SessionState.getActiveDataPackId(req.session.state);
  const dataPackType = SessionState.getActiveDataPackType(req.session.state);

  const are_native_queries = dataPackType == "W2VV_based" ? true : false;

  let numPoints = global.gConfig.numPointsInTestResults;

  let testResultData = {};
  let testOptions = {};

  try {
    for (const [formId, options] of Object.entries(body)) {
      // Stringify options
      let optionsStr = "";
      for (const [opt_key, opt_val] of Object.entries(options)) {
        optionsStr += `${String(opt_key)}=${String(opt_val)};`;
      }

      // Add info
      testOptions[formId] = optionsStr;

      // Run test
      const result = global.imageRanker.runModelTest(10, dataPackId, optionsStr, are_native_queries, numPoints);

      for (let i = 0; i < result.fx.length; ++i) {
        result.fx[i] = result.fx[i] / 100;
      }

      testResultData[formId] = result;
    }
  } catch (error) {
    res.jsonp({
      error: error.message,
    });
    return;
  }

  const now = new Date();
  const utcTs = now.toString();
  const unixTs = Date.now();

  const testInfo = {
    timestamp: unixTs,
    utc: utcTs,
    testOptions: testOptions,
  };

  let csvString = "";

  let xVals = [];
  for (const [formId, testResults] of Object.entries(testResultData)) {
    xVals = testResults.x;
    break;
  }

  // Header
  csvString += "x";
  for (const [formId, testResults] of Object.entries(testResultData)) {
    csvString += "," + formId;
  }
  csvString += "\n";

  // Data
  {
    let i = 0;
    for (let x of xVals) {
      csvString += Number(x);
      for (const [formId, testResults] of Object.entries(testResultData)) {
        csvString += "," + testResults.fx[i];
      }
      csvString += "\n";
      ++i;
    }
  }

  // Create two files:
  //  - <UNIX_TS>_<data_pack_ID>_test_info.json
  //  - <UNIX_TS>_<data_pack_ID>_test_result.csv

  const dataPackName = SessionState.getActiveDataPackId(req.session.state);

  const dir = path.join(global.rootDir, "/public/", global.gConfig.exportDir, "/");
  const hrefDir = global.gConfig.exportDir + "/";
  const filename1 = unixTs + "_" + dataPackName + "_test_info.json";
  const filename2 = unixTs + "_" + dataPackName + "_test_result.csv";

  fs.writeFile(dir + filename1, JSON.stringify(testInfo, 4), function (err) {
    if (err) {
      throw Error(err);
    }
  });
  fs.writeFile(dir + filename2, csvString, function (err) {
    if (err) {
      throw Error(err);
    }
  });

  res.jsonp({
    data: testResultData,
    files: {
      info: hrefDir + filename1,
      data: hrefDir + filename2,
    },
  });
};

// ==============================================
// vv Not refactored vv
// ==============================================

exports.ExportFile = function (req, res) {
  const sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => ExportFile()");

  global.logger.log("debug", "newAction: " + JSON.stringify(req.query, undefined, 4));

  const native = req.body.native;

  const kwScDataType = {
    keywordsDataType: req.body.kwTypeId,
    scoringDataType: req.body.scTypeId,
  };

  const fileTypeId = req.body.fileType;

  let filename;
  let kkk = "";

  switch (fileTypeId) {
    case 0:
      filename = "user_annotator_queries";
      kkk = "eUserAnnotatorQueries";
      break;

    case 1:
      filename = "net_normalized_scores";
      kkk = "eNetNormalizedScores";
      break;

    case 2:
      filename = "query_num_hits";
      kkk = "eQueryNumHits";
      break;

    case 3:
      filename = "native_queries";
      kkk = "cNativeQueries";
      break;
  }

  if (fileTypeId == 3) {
    const responseData = {
      result: false,
      filename: "Something went wrong!",
    };

    global.dbConnectionsPool.query(
      "SELECT image_id, manually_validated, query FROM `image-ranker-collector-data2`.user_data_native_queries;",
      function (error, results, fields) {
        if (error) throw error;
        console.log("The solution is: ", results[0].solution);

        filename =
          filename + "." + String(kwScDataType.keywordsDataType) + "." + String(kwScDataType.scoringDataType) + ".txt";
        global.logger.log("debug", "<" + sess.id + ">: => b");
        const outputFilepath = path.join(global.rootDir, "/public/", global.gConfig.exportDir, filename);

        let strToWrite = "";
        for (let i = 0; i < results.length; ++i) {
          strToWrite += results[i].image_id + "," + results[i].manually_validated + ',"' + results[i].query + '"\n';
        }

        fs.writeFile(outputFilepath, strToWrite, function (err) {
          if (err) {
            return console.log(err);
          }
        });

        responseData.result = true;
        responseData.filename = global.gConfig.exportDir + filename;

        const iii = String(req.body.kwTypeId);
        const jjj = String(req.body.scTypeId);

        global.logger.log("debug", "<" + sess.id + ">: => c");

        // Save to app context
        global.exportedFiles["id" + iii]["id" + jjj][kkk] = global.gConfig.exportDir + filename;

        global.logger.log("debug", "<" + sess.id + ">: Exported file '" + outputFilepath + "'");

        global.logger.log("debug", "<" + sess.id + ">: <= ExportFile()");
        res.jsonp(responseData);
      }
    );
  } else {
    filename =
      filename + "." + String(kwScDataType.keywordsDataType) + "." + String(kwScDataType.scoringDataType) + ".txt";
    global.logger.log("debug", "<" + sess.id + ">: => b");
    const outputFilepath = path.join(global.rootDir, "/public/", global.gConfig.exportDir, filename);

    global.logger.log("debug", "<" + sess.id + ">: Exporting file...");
    global.logger.log("debug", "<" + sess.id + ">: kwScDataType = " + JSON.stringify(kwScDataType, undefined, 4));
    global.logger.log("debug", "<" + sess.id + ">: fileTypeId = " + String(fileTypeId));
    global.logger.log("debug", "<" + sess.id + ">: outputFilepath = " + String(outputFilepath));

    const responseData = {
      result: false,
      filename: "Something went wrong!",
    };

    try {
      // ======================================================
      // ======================================================
      global.imageRanker.exportDataFile(kwScDataType, fileTypeId, outputFilepath, native);
      // ======================================================
      // ======================================================
    } catch (err) {
      global.logger.log("error", "<" + sess.id + ">: Exporting data file failed! (imageRanker.exportDataFile())");

      res.jsonp(responseData);
      return;
    }

    responseData.result = true;
    responseData.filename = global.gConfig.exportDir + filename;

    const iii = String(req.body.kwTypeId);
    const jjj = String(req.body.scTypeId);

    global.logger.log("debug", "<" + sess.id + ">: => c");

    // Save to app context
    global.exportedFiles["id" + iii]["id" + jjj][kkk] = global.gConfig.exportDir + filename;

    global.logger.log("debug", "<" + sess.id + ">: Exported file '" + outputFilepath + "'");

    global.logger.log("debug", "<" + sess.id + ">: <= ExportFile()");
    res.jsonp(responseData);
  }
};
