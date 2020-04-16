const util = require("util");
const fs = require("fs");
var path = require("path");

const sessState = require("../modules/SessionState");

let prefixCache = new Array();

function writePrefixCache(kwDataType) {
  let origArr = prefixCache;
  prefixCache = new Array();

  var today = new Date();
  let todayString =
    String(today.getDate()) +
    "-" +
    String(today.getMonth()) +
    "-" +
    String(today.getFullYear());

  const filepath = path.join(
    global.rootDir,
    global.gConfig.outputDir +
      "/autocomplete/" +
      todayString +
      "." +
      kwDataType +
      ".log"
  );

  let file = fs.createWriteStream(filepath, { flags: "a" });
  file.on("error", function (err) {
    return;
  });
  origArr.forEach(function (v) {
    file.write(v + "\n");
  });
  file.end();
}

exports.setActiveDataPack = function (req, res) {
  let sess = req.session;

  const newDataPackId = req.body.dataPackId;

  // Set new state
  sessState.setActieDataPack(sess.state, newDataPackId);

  global.logger.log(
    "info",
    "Active data pack changed to  '" + newDataPackId + "'"
  );
  res.jsonp(true);
};

exports.getAutocompleteResults = function (req, res) {
  const sess = req.session;

  const prefix = req.query.queryValue;

  // Get active settings from the current session
  const activeDataPackId = sessState.getActiveDataPack(sess.state);
  const withExImgs = sessState.getAnnotWithExampleImages(sess.state);
  const numResults = sessState.getAnnotNumResults(sess.state);

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

  var nearKeywords = global.imageRanker.getAutocompleteResults(
    activeDataPackId,
    prefix,
    numResults,
    withExImgs
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

  prefixCache.push("<" + String(sess.id) + ">:" + prefix);
  if (prefixCache.length > 100) {
    writePrefixCache(kwDataType);
  }

  // Send response
  res.jsonp(nearKeywords);
};

exports.tryToSwitchToDevMode = function (req, res) {
  const pass = req.body.pass;

  // Verify if correct pass
  if (pass == global.gConfig.devPass) {
    // Switch to dev session
    sessState.setUserLevel(req.session.state, 10);
  }

  res.redirect(301, "/");
};

exports.submitAnnotatorQuery = function (req, res) {
  // Get keywords user provided
  var keywords = req.body.keyword;

  // Get this session
  const sess = req.session;

  // Initialize final string
  let finalString = "";

  let sessionId = sess.id;
  let imageId = sess.gameImage.imageId;

  let wasWithExampleImages = false;
  if (req.session.annotatorSettings.autocompleteWithExamples) {
    wasWithExampleImages = true;
  }

  if (wasWithExampleImages) {
    queryType += 10;
  }

  // Parameters: SessionID, ImageID, string query
  // const kwScDataType = new Object();
  // kwScDataType.keywordsDataType = req.session.keywordsSettings.kwDataType;
  // kwScDataType.scoringDataType = req.session.rankingSettings.scoringDataType;

  // const userImageResult = global.imageRanker.SubmitUserQueriesWithResults(
  //     kwScDataType,
  //     sessionId,
  //     imageId,
  //     finalString,
  //     queryType
  // );

  // Redirect user back to game page
  res.redirect(301, "/annotator/");
};
