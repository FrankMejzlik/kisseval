const util = require("util");
const fs = require("fs");
var path = require("path");

const SessionState = require("../classes/SessionState");

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

  // Find this pack and check if it's loaded
  for (const pack of global.loadedDataPacksInfo) {
    if (pack.id == newDataPackId) {
      // Set new state
      SessionState.setActieDataPack(sess.state, pack.id, pack.model_options);

      global.logger.log(
        "debug",
        "<" +
          req.session.id +
          "> \n" +
          "Active data pack changed to  '" +
          newDataPackId +
          "'"
      );
      res.jsonp(true);
      return;
    }
  }

  global.logger.log(
    "debug",
    "<" +
      req.session.id +
      "> \n" +
      "Active data pack change failed. Pack '" +
      newDataPackId +
      "' not found."
  );

  res.jsonp(false);
};

exports.getAutocompleteResults = function (req, res) {
  const sess = req.session;

  const prefix = req.query.queryValue;

  // Get active settings from the current session
  const activeDataPackId = SessionState.getActiveDataPackId(sess.state);
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
    SessionState.setUserLevel(req.session.state, 10);
  }

  res.redirect(301, "/");
};

exports.submitAnnotatorQuery = function (req, res) {
  const sess = req.session;

  const sessionId = sess.id;
  const frameSequence = SessionState.getAnnotImageSquence(sess.state);
  const activeDataPackId = SessionState.getActiveDataPackId(sess.state);
  const activeModelOptions = SessionState.getActiveDataPackModelOptions(sess.state);

  let keywordIds = req.body.keyword;
  // Make sure it's an array
  if (!Array.isArray(keywordIds)){
    keywordIds = [keywordIds];
  }

  let queryStrings = req.body.keywordWord;

  // Make sure it's an array
  if (!Array.isArray(queryStrings)){
    queryStrings = [queryStrings];
  }

  const fullyNative = SessionState.getAnnotFullyNative(sess.state);
  const withExampleImages = SessionState.getAnnotWithExampleImages(sess.state);

  // \todo User level is to be dynamic if made public
  const userLevel = 10;

  // Encode queries propperly (only for non-fully native queries)
  let encodedQuery = "";
  let readableQuery = "";
  if (!fullyNative) {
    // Query with IDs
    encodedQuery += "&";
    for (const kw_ID of keywordIds) {
      encodedQuery += "-";
      encodedQuery += kw_ID;
      encodedQuery += "+";
    }

    // Readable query
    let i = 0;
    for (const word of queryStrings) {
      readableQuery += word;
      if (i < queryStrings.length - 1)
        readableQuery += " && ";
      ++i;
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
