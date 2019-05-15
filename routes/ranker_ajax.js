

const util = require('util')

const utils = require("../routes/utils/utils");
const rankerUtils = require("../routes/utils/ranker_utils");


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

exports.submitImage = function(req, res)
{
  global.logger.log('debug', "=> submitImage()");
  const sess = req.session;

  const imageId = req.query.imageId;
  global.logger.log('debug', "imageId = " + imageId);


  let response = new Object();
  
  // Is this correct image?
  response.correct = (imageId == sess.ranker.searchSession.imageId);

  const userId = 0;
  const sessionId = sess.id;
  const searchSessionId = sess.ranker.searchSession.id;
  const targetImageId = sess.ranker.searchSession.imageId;
  const actionsArray = sess.ranker.searchSession.actionsArray;

  const nativeSettings = utils.convertSettingsObjectToNativeFormat(sess.ranker.settings);

  // NATIVE SUBMIT PROGRESS DATA!!!
  // global.imageRanker.SubmitInteractiveSearchSubmit(
  // nativeSettings.rankingModel, nativeSettings.aggregation, 
  // nativeSettings.rankingModelSettings, 
  // nativeSettings.aggregationSettings, 
  // userId, sessionId, searchSessionId, targetImageId, 
  // );
  //


  // If correct answer, just end search session
  if (response.correct)
  {
    rankerUtils.terminateSearchSession(sess);
  }


  global.logger.log('debug', "response: " + JSON.stringify(response, undefined, 4));


  global.logger.log('debug', "<= submitImage()");
  res.jsonp(response);
}

exports.getRandomImageAndStartSearchSession = function(req, res) 
{
  global.logger.log('debug', "=> getRandomImageAndStartSearchSession()");

  const sess = req.session;

  // Terminate old session if any
  rankerUtils.terminateSearchSession(sess);

  // Get random image
  const image = global.imageRanker.GetRandomImage();

  // Start new session with this image
  rankerUtils.startSearchSession(sess, image.imageId, image.filename);

  let response = new Object();
  response.imageId = image.imageId;
  response.imageFilename = image.filename;

  global.logger.log('debug', "response: " + JSON.stringify(response, undefined, 4));  

  global.logger.log('debug', "<= getRandomImageAndStartSearchSession()");
  res.jsonp(response);
}

exports.getSelectedImageAndStartSearchSession = function(req, res) 
{
  global.logger.log('debug', "=> getSelectedImageAndStartSearchSession()");
  const sess = req.session;

   // Terminate old session if any
   rankerUtils.terminateSearchSession(sess);

   // Get random image
   const image = global.imageRanker.GetImageDataById(Number(req.query.imageId));
 
   // Start new session with this image
   rankerUtils.startSearchSession(sess, image.imageId, image.filename);
 
   let response = new Object();
   response.imageId = image.imageId;
   response.imageFilename = image.filename;
 
   if (global.gConfig.log_all) 
   { 
     console.log("response = " + JSON.stringify(response)); 
   }

  global.logger.log('debug', "<= getSelectedImageAndStartSearchSession()");
  res.jsonp(response);
}


exports.processAction = function(req, res) 
{
  global.logger.log('debug', "=> processAction()");
  const sess = req.session;

  const action = req.query.action;
  const operand = req.query.operand;

  global.logger.log('debug', "action = " + action + ", operand = " + operand);

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

  const queryPlain = sess.ranker.query.join("&");

  let response = new Object();
  
  if (sess.ranker.query.length > 0)
  {
    response.relevantImagesArray = global.imageRanker.GetRelevantImagesPlainQuery(
      queryPlain, 
      1000, 
      settingsForNative.aggregation, 
      settingsForNative.rankingModel, 
      settingsForNative.rankingModelSettings, 
      settingsForNative.aggregationSettings,
      sess.ranker.searchSession.imageId
    );

    rankerUtils.pushAction(sess, action, operand, response.relevantImagesArray.targetImageRank);
  }
  else 
  {
    rankerUtils.pushAction(sess, action, operand, 0);
  }

  // If not dev, hide target image position
  if (sess.userLevel < 10)
  {
    response.relevantImagesArray.targetImageRank = undefined;
  }

  const actionsArray = sess.ranker.searchSession.actionsArray;
  response.chartData = new Array();
  
  // Construct chart data
  for (let i = 0; i < actionsArray.length; ++i)
  {
    const pair = new Object();
    pair.index = i;
    pair.value = actionsArray[i].score;

    response.chartData.push(pair);
  }


  global.logger.log('debug', "<= processAction()");
  res.jsonp(response);
}



exports.getImageKeywordsForInteractiveSearch = function(req, res) 
{
  global.logger.log('debug', "=> processAction()");
  const sess = req.session;

  const imageId = req.query.imageId;

  //global.logger.log('debug', "action = " + action + ", operand = " + operand);

  const response = global.imageRanker.GetImageKeywordsForInteractiveSearch(Number(imageId), 30);

  global.logger.log('debug', "<= processAction()");
  res.jsonp(response);
}