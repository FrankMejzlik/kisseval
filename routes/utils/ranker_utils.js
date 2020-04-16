var eActions = {
  removeKeyword: 0,
  addKeyword: 1,
};

exports.initOrResumeInteractiveSearchSession = function (sess, viewData) {
  global.logger.log("debug", "=> initOrResumeInteractiveSearchSession");

  // If no search session runnig
  if (typeof sess.ranker.searchSession === "undefined") {
    global.logger.log(
      "debug",
      "Session " + sess.id + " has no active search session."
    );

    // Fill dummy view data
    viewData.ranker = new Object();
    viewData.ranker.settings = sess.ranker.settings;
  }
  // Search session running
  else {
    global.logger.log(
      "debug",
      "Session " +
        sess.id +
        " has active search session: " +
        JSON.stringify(sess.ranker.searchSession, undefined, 4)
    );
    global.logger.log(
      "debug",
      "with model settings: " +
        JSON.stringify(sess.ranker.settings, undefined, 4)
    );

    // Fill vew data
    viewData.ranker = new Object();
    viewData.ranker.settings = sess.ranker.settings;
    viewData.ranker.searchSession = sess.ranker.searchSession;

    // Asign query and its word representations
    viewData.ranker.query = sess.ranker.query;
    viewData.ranker.queryWords = sess.ranker.queryWords;

    viewData.ranker.query2 = sess.ranker.query2;
    viewData.ranker.queryWords2 = sess.ranker.queryWords2;

    viewData.ui.ranker.queryInputUnlocked = true;
    viewData.ui.ranker.queryInput2Unlocked = true;
  }

  viewData.ranker.settings.aggregationModelSimple = exports.getModelNumberNameFromSession(
    sess
  );

  global.logger.log("debug", "<= initOrResumeInteractiveSearchSession");
};

exports.checkOrInitSessionRankerObject = function (sess) {
  if (typeof sess.ranker === "undefined") {
    sess.ranker = new Object();
  }

  // Make sure ranker settings object exits
  if (typeof sess.ranker.settings === "undefined") {
    // Copy default ranker settings to this session
    sess.ranker.settings = JSON.parse(JSON.stringify(global.gConfig.ranker));
  }
};

exports.initializeRankerModelSettings = function (sess) {
  global.logger.log("debug", "=> initializeRankerModelSettings");

  // If ranker session object not initialized yet
  if (typeof sess.ranker === "undefined") {
    global.logger.log(
      "debug",
      "Initializing sess.ranker object for session " + sess.id
    );

    sess.ranker = new Object();
  }
  if (typeof sess.ranker.settings === "undefined") {
    sess.ranker.settings = new Object();
  }
  if (typeof sess.ranker.settings.rankingModel === "undefined") {
    // Get ranodom number
    const to = global.ranker.selectedModels.length;

    // [0, 1) * (N + 1) floored gives number from 0 to N
    const randIndex = Math.floor(Math.random() * to);

    sess.ranker.settings = global.ranker.selectedModels[randIndex];
    sess.ranker.settings.modelName = exports.getModelNameFromSession(sess);

    global.logger.log(
      "debug",
      "Initializing new session with predefined model index " + randIndex
    );
  }

  global.logger.log("debug", "<= initOrResumeInteractiveSearchSession");
};

exports.getModelNumberNameFromSession = function (sess) {
  let first = "";
  let second = "";
  switch (sess.ranker.settings.aggregationModel.id) {
    // Boolean
    case 1:
      switch (sess.ranker.settings.aggregationModel.boolean.inBucketRanking) {
        case 0:
          first = "1";
          second = "0";
          break;

        case 1:
          first = "1";
          second = "1";
          break;

        case 2:
          first = "1";
          second = "2";
          break;
      }
      break;

    // Viret
    case 3:
      switch (sess.ranker.settings.aggregationModel.viret.queryOperations) {
        case 0:
          first = "3";
          second = "0";
          break;

        case 1:
          first = "3";
          second = "1";
          break;

        case 2:
          first = "3";
          second = "2";
          break;

        case 3:
          first = "3";
          second = "3";
          break;
      }
      break;

    default:
  }

  return first + "-" + second;
};

exports.getModelNameFromSession = function (sess) {
  let first = "";
  let second = "";
  switch (sess.ranker.settings.aggregationModel.id) {
    // Viret
    case 3:
      switch (sess.ranker.settings.aggregationModel.viret.queryOperations) {
        case 0:
          first = "mult";
          second = "sum";
          break;

        case 1:
          first = "mult";
          second = "max";
          break;

        case 2:
          first = "sum";
          second = "sum";
          break;

        case 3:
          first = "sum";
          second = "max";
          break;
      }
      break;

    default:
  }

  return first + "/" + second;
};

exports.terminateSearchSession = function (sess) {
  global.logger.log("debug", "=> terminateSearchSession()");

  // If not set at all
  if (typeof sess.ranker === "undefined") {
    // Nothing to do
    global.logger.log("debug", "<= terminateSearchSession()");
    return;
  }
  if (typeof sess.ranker.searchSession === "undefined") {
    // Nothing to do
    global.logger.log("debug", "<= terminateSearchSession()");
    return;
  }

  sess.ranker.query = undefined;
  sess.ranker.queryWords = undefined;

  sess.ranker.query2 = undefined;
  sess.ranker.queryWords2 = undefined;

  //xoxo get duration
  var date = new Date();
  var timestamp = date.getTime();

  const microSecondsDiff = Math.abs(
    sess.ranker.searchSession.startTimestamp - timestamp
  );
  const sessionDurationInSeconds = Math.floor(microSecondsDiff / 1000);

  global.logger.log(
    "debug",
    "<" +
      sess.id +
      ">: Interactive search (ID = " +
      sess.ranker.searchSession.id +
      ") terminated."
  );
  global.logger.log("debug", "<" + sess.id + ">: <= terminateSearchSession()");

  // Reset it
  sess.ranker.searchSession = undefined;

  return sessionDurationInSeconds;
};

exports.startSearchSession = function (sess, targetImages) {
  global.logger.log("debug", "<" + sess.id + ">: => startSearchSession()");

  // Initialize session counter if needed
  if (typeof sess.ranker.searchSessionCounter == "undefined") {
    sess.ranker.searchSessionCounter = 0;
  }

  // Start new
  sess.ranker.searchSession = new Object();
  // Git it unique ID
  sess.ranker.searchSession.id = sess.ranker.searchSessionCounter;

  sess.ranker.searchSession.targetImages = targetImages;

  sess.ranker.searchSession.actionsArray = new Array();

  var date = new Date();
  var timestamp = date.getTime();
  sess.ranker.searchSession.startTimestamp = timestamp;

  // Increment counter
  ++sess.ranker.searchSessionCounter;

  global.logger.log("debug", "<" + sess.id + ">: Started search session... ");
  global.logger.log(
    "debug",
    "<" + sess.id + ">: \t searchSessionIndex = " + sess.ranker.searchSession.id
  );
  global.logger.log("debug", "<" + sess.id + ">: <= startSearchSession()");
};

exports.pushAction = function (sess, action, operand, score) {
  global.logger.log("debug", "<" + sess.id + ">: => pushAction()");
  global.logger.log(
    "debug",
    "<" +
      sess.id +
      ">: \t searchSessionIndex =  " +
      sess.ranker.searchSession.id
  );

  // Create object for this action
  const newAction = {
    action: Number(action),
    operand: Number(operand),
    score: Number(score),
  };

  // Store it in session
  sess.ranker.searchSession.actionsArray.push(newAction);

  global.logger.log("debug", "<" + sess.id + ">: Added new action...");
  global.logger.log(
    "debug",
    "<" +
      sess.id +
      ">: \t newAction: " +
      JSON.stringify(newAction, undefined, 4)
  );

  global.logger.log("debug", "<" + sess.id + ">: Q1:");
  global.logger.log(
    "debug",
    "<" + sess.id + ">: \t " + JSON.stringify(sess.ranker.query, undefined, 4)
  );
  global.logger.log(
    "debug",
    "<" +
      sess.id +
      ">: \t " +
      JSON.stringify(sess.ranker.queryWords, undefined, 4)
  );

  global.logger.log("debug", "<" + sess.id + ">: Q2:");
  global.logger.log(
    "debug",
    "<" + sess.id + ">: \t " + JSON.stringify(sess.ranker.query2, undefined, 4)
  );
  global.logger.log(
    "debug",
    "<" +
      sess.id +
      ">: \t " +
      JSON.stringify(sess.ranker.queryWords2, undefined, 4)
  );

  global.logger.log("debug", "<" + sess.id + ">: <= pushAction()");
};
