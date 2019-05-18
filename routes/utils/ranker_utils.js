

var eActions = { 
  "removeKeyword":0,
  "addKeyword":1 
};

exports.initOrResumeInteractiveSearchSession = function(sess, viewData) 
{
  global.logger.log('debug', "=> initOrResumeInteractiveSearchSession");

  // If no search session runnig
  if (typeof sess.ranker.searchSession === "undefined")
  {
    global.logger.log('debug', "Session " + sess.id + " has no active search session.");

    // Fill dummy view data
    viewData.ranker = new Object();
    viewData.ranker.settings = new Object();
    viewData.ranker.searchSession = new Object();

    viewData.ui = new Object();
    viewData.ui.queryInputUnlocked = true;
    

  }
  // Search session running
  else 
  {
    global.logger.log('debug', "Session " + sess.id + " has active search session: " + JSON.stringify(sess.ranker.searchSession, undefined, 4));
    global.logger.log('debug', "with model settings: " + JSON.stringify(sess.ranker.settings, undefined, 4));

    // Fill vew data
    viewData.ranker = new Object()
    viewData.ranker.settings = sess.ranker.settings;
    viewData.ranker.searchSession = sess.ranker.searchSession;
    
    // Asign query and its word representations
    viewData.ranker.query = sess.ranker.query;
    viewData.ranker.queryWords = sess.ranker.queryWords;

    // Unlock input
    viewData.ui = new Object();
    viewData.ui.queryInputUnlocked = true;

    // If not dev
    if (sess.userLevel < 10)
    {
      // Hide info about used model
      viewData.ranker.settings.modelName = undefined;
    }
  }

  global.logger.log('debug', "<= initOrResumeInteractiveSearchSession");
}

exports.initializeRankerModelSettings = function(sess)
{ 
  global.logger.log('debug', "=> initializeRankerModelSettings");



  // If ranker session object not initialized yet
  if (typeof sess.ranker === "undefined")
  {
    if (global.gConfig.log_all)
    {
      console.log("Initializing sess.ranker object for session " + sess.id);
    }
    sess.ranker = new Object();
  }
  if (typeof sess.ranker.settings === "undefined")
  {
    sess.ranker.settings = new Object();
  }
  if (typeof sess.ranker.settings.rankingModel === "undefined")
  {
    // Get ranodom number
    const to  = global.ranker.selectedModels.length;

    // [0, 1) * (N + 1) floored gives number from 0 to N
    const randIndex = Math.floor(Math.random() * to);

    sess.ranker.settings = global.ranker.selectedModels[randIndex];
    sess.ranker.settings.modelName = exports.getModelNameFromSession(sess);

    global.logger.log('debug', "Initializing new session with predefined model index " + randIndex);
  }

  global.logger.log('debug', "<= initOrResumeInteractiveSearchSession");
};

exports.getModelNameFromSession = function(sess)
{
  let first = "";
  let second = "";
  switch (sess.ranker.settings.rankingModel)
  {
    // Viret
    case 3:
      switch (sess.ranker.settings.viret_queryOperations)
      {
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
}


exports.submitSearchSession = function(sess)
{
  global.logger.log('debug', "<= submitSearchSession()");


  global.logger.log('debug', "Submitting search session for session id " + sess.id + " with ID " + sess.ranker.searchSession.id + ".");


  global.logger.log('debug', "<= submitSearchSession()");
}

exports.terminateSearchSession = function(sess)
{
  global.logger.log('debug', "=> terminateSearchSession()");
  
  // If not set at all
  if (typeof sess.ranker === "undefined")
  {
    // Nothing to do
    global.logger.log('debug', "<= terminateSearchSession()");
    return;
  }
  if (typeof sess.ranker.searchSession === "undefined")
  {
    // Nothing to do
    global.logger.log('debug', "<= terminateSearchSession()");
    return;
  }

  sess.ranker.query = undefined;
  sess.ranker.queryWords = undefined;
  sess.ranker.settings = undefined;

  global.logger.log('debug', "Terminating search session for session id " + sess.id + " with ID " + sess.ranker.searchSession.id + ".");  

  //xoxo get duration
  var date = new Date();
  var timestamp = date.getTime();

  const microSecondsDiff = Math.abs(sess.ranker.searchSession.startTimestamp - timestamp);
  const sessionDurationInSeconds = Math.floor(microSecondsDiff/(1000));

  // Reset it
  sess.ranker.searchSession = undefined;

  global.logger.log('debug', "<= terminateSearchSession()");

  return sessionDurationInSeconds;
}

exports.startSearchSession = function(sess, imageId, imageSrc)
{
  global.logger.log('debug', "=> startSearchSession()");

  if (typeof sess.ranker === "undefined")
  {
    sess.ranker = new Object();
  }

  exports.initializeRankerModelSettings(sess);

  // Initialize session counter if needed
  if (typeof sess.ranker.searchSessionCounter == "undefined")
  {
    sess.ranker.searchSessionCounter = 0;
  }

  // Start new
  sess.ranker.searchSession = new Object();
  // Git it unique ID
  sess.ranker.searchSession.id = sess.ranker.searchSessionCounter;
  sess.ranker.searchSession.imageId = imageId;
  sess.ranker.searchSession.imageSrc = imageSrc;
  sess.ranker.searchSession.query = new Array();
  sess.ranker.searchSession.actionsArray = new Array();

  var date = new Date();
  var timestamp = date.getTime();
  sess.ranker.searchSession.startTimestamp = timestamp;

  global.logger.log('debug', "Starting search session for session id " + sess.id + " with ID " + sess.ranker.searchSession.id + ".");

  // Increment counter
  ++sess.ranker.searchSessionCounter;

  global.logger.log('debug', "<= startSearchSession()");
}

exports.pushAction = function(sess, action, operand, score)
{
  global.logger.log('debug', "=> pushAction()");

  // Create object for this action
  const newAction = new Object();
  newAction.action = action;
  newAction.operand = operand;
  newAction.score = score;

  global.logger.log('debug', "Pushing action, session ID = " + sess.id + ", search session ID =  " + sess.ranker.searchSession.id);
  global.logger.log('debug', "newAction:"+ JSON.stringify(newAction, undefined, 4));

  // Store it in session
  sess.ranker.searchSession.actionsArray.push(newAction);

  global.logger.log('debug', "<= pushAction()");
}
