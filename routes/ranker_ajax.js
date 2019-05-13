
const util = require('util')

const utils = require("../routes/utils/utils");

var eActions = { 
  "removeKeyword":0,
  "addKeyword":1 
};

// var foo = function (req, res, next) 
// {
//   const id = Number(req);
//   const result = global.imageRanker.GetImageDataById(id);

//   for (var i = 0; i < result.probabilityVector.length; ++i) 
//   {
//     const keywordIndex = result.probabilityVector[i].index;

//     result.probabilityVector[i].keyword = global.imageRanker.GetKeywordByVectorIndex(keywordIndex);
//   }

//   return result;
// }

exports.submitSettings = function(req, res) 
{
  const sess = req.session;

  // Save new settings into session
  if (typeof sess.ranker === "undefined")
  {
    sess.ranker = new Object();
  }
  sess.ranker.settings = utils.parseModelSettingsFromForm(req.query[0]);

  if (global.gConfig.log_all) 
  {
    console.log("Setting ranker settings to:");
    console.log(sess.ranker.settings);
    console.log("==============================");
  }
  
  res.redirect('/ranker');
};

function submitSearchSession(sess)
{
  if (global.gConfig.log_all) { console.log("=> submitSearchSession()"); }

  if (global.gConfig.log_all) 
  {
    console.log("Submitting search session for session id " + sess.id + " with ID " + sess.ranker.searchSession.id + ".");
  }


  if (global.gConfig.log_all) { console.log("<= submitSearchSession()"); }
}

function terminateSearchSession(sess) 
{
  if (global.gConfig.log_all) { console.log("=> terminateSearchSession()"); }
  
  // If not set at all
  if (typeof sess.ranker === "undefined")
  {
    // Nothing to do
    return;
  }
  if (typeof sess.ranker.searchSession === "undefined")
  {
    // Nothing to do
    return;
  }

  if (global.gConfig.log_all) 
  {
    console.log("Terminating search session for session id " + sess.id + " with ID " + sess.ranker.searchSession.id + ".");
  }

  // Reset it
  sess.ranker.searchSession = undefined;

  if (global.gConfig.log_all) { console.log("<= terminateSearchSession()"); }
}

function startSearchSession (sess, imageId, imageSrc)
{
  if (global.gConfig.log_all) { console.log("=> startSearchSession()"); }
  
  // End previous first
  terminateSearchSession(sess);

  if (typeof sess.ranker === "undefined")
  {
    sess.ranker = new Object();
  }

  // Start new
  sess.ranker.searchSession = new Object();
  // Git it unique ID
  sess.ranker.searchSession.id = sess.ranker.searchSessionCounter;
  sess.ranker.searchSession.imageId = imageId;
  sess.ranker.searchSession.imageSrc = imageSrc;
  sess.ranker.searchSession.query = new Array();
  sess.ranker.searchSession.actionsArray = new Array();

  if (global.gConfig.log_all) 
  {
    console.log("Starting search session for session id " + sess.id + " with ID " + sess.ranker.searchSession.id + ".");
  }

  // Increment counter
  ++sess.ranker.searchSessionCounter;

  if (global.gConfig.log_all) { console.log("<= startSearchSession()"); }
}

function pushAction(sess, action, operand, score)
{
  if (global.gConfig.log_all) { console.log("=> pushAction()"); }

  if (global.gConfig.log_all) 
  {
    console.log("Pushing action, session ID = " + sess.id + ", search session ID =  " + sess.ranker.searchSession.id);
    console.log("action = " + action);
    console.log("operand = " + operand);
    console.log("score = " + score);
  }

  // Create object for this action
  const newAction = new Object();
  newAction.action = action;
  newAction.operand = operand;
  newAction.score = score;

  // Store it in session
  sess.ranker.searchSession.actionsArray.push(newAction);

  if (global.gConfig.log_all) { console.log("<= pushAction()"); }
}

exports.submitImage = function(req, res)
{
  if (global.gConfig.log_all) { console.log("=> submitImage()"); }
  const sess = req.session;


  let response = "data";

  if (global.gConfig.log_all) { console.log("<= submitImage()"); }
  res.jsonp(response);
}

exports.getRandomImageAndStartSearchSession = function(req, res) 
{
  if (global.gConfig.log_all) { console.log("=> getRandomImageAndStartSearchSession()"); }
  const sess = req.session;

  // Terminate old session if any
  terminateSearchSession(sess);

  // Get random image
  const image = global.imageRanker.GetRandomImage();

  // Start new session with this image
  startSearchSession(sess, image.imageId, image.filename);

  let response = new Object();
  response.imageId = image.imageId;
  response.imageFilename = image.filename;

  if (global.gConfig.log_all) 
  { 
    console.log("response = " + JSON.stringify(response)); 
  }

  if (global.gConfig.log_all) { console.log("<= getRandomImageAndStartSearchSession()"); }
  res.jsonp(response);
}

exports.getSelectedImageAndStartSearchSession = function(req, res) 
{
  if (global.gConfig.log_all) { console.log("=> getSelectedImageAndStartSearchSession()"); }
  const sess = req.session;

   // Terminate old session if any
   terminateSearchSession(sess);

   // Get random image
   const image = global.imageRanker.GetImageDataById(Number(req.query.imageId));
 
   // Start new session with this image
   startSearchSession(sess, image.imageId, image.filename);
 
   let response = new Object();
   response.imageId = image.imageId;
   response.imageFilename = image.filename;
 
   if (global.gConfig.log_all) 
   { 
     console.log("response = " + JSON.stringify(response)); 
   }

  if (global.gConfig.log_all) { console.log("<= getSelectedImageAndStartSearchSession()"); }
  res.jsonp(response);
}


exports.processAction = function(req, res) 
{
  if (global.gConfig.log_all) { console.log("=> processAction()"); }
  const sess = req.session;

  const action = req.query.action;
  const operand = req.query.operand;

  // Get all needed things for calling native method
  const settingsForNative = utils.convertSettingsObjectToNativeFormat(sess.ranker.settings); 


  if (typeof sess.ranker.query === "undefined")
  {
    sess.ranker.query = new Array();

  }

  if (action == 0)
  {
    const index = sess.ranker.query.indexOf(operand);

    // Cut out this kw
    sess.ranker.query.splice(index, 1);
  }
  else if (action == 1)
  {
    // Add keyword
    sess.ranker.query.push(operand);
  }

  if (sess.ranker.query.length <= 0)
  {
    //return;
  }

  const queryPlain = sess.ranker.query.join("&");

  let response = new Object();
  response.targetImageRank;
  response.relevantImagesArray = global.imageRanker.GetRelevantImagesPlainQuery(
    queryPlain, 
    settingsForNative.numResults, 
    settingsForNative.aggregation, 
    settingsForNative.rankingModel, 
    settingsForNative.rankingModelSettings, 
    settingsForNative.aggregationSettings,
    sess.ranker.searchSession.imageId
  );



  pushAction(sess, action, operand, response.relevantImagesArray.targetImageRank);

  if (global.gConfig.log_all) { console.log("<= processAction()"); }
  res.jsonp(response);
}