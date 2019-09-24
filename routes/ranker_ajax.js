

const util = require('util')

const utils = require("../routes/utils/utils");
const rankerUtils = require("../routes/utils/ranker_utils");


exports.submitSettings = function(req, res) 
{
  global.logger.log('debug', "=> submitSettings()");
  const sess = req.session;

  // Save new settings into session
  if (typeof sess.ranker === "undefined")
  {
    sess.ranker = new Object();
  }

  // Parse provided settings from submitted form
  utils.parseModelSettingsFromForm(sess, req.query[0]);

  global.logger.log('debug', "Setting ranker settings to: sess.ranker.settings" + JSON.stringify(sess.ranker.settings, undefined, 4));
  global.logger.log('debug', "<= submitSettings()");
  res.redirect('/ranker');
};

exports.submitImage = function(req, res)
{
  global.logger.log('debug', "=> submitImage()");
  const sess = req.session;

  const imageId = req.query.imageId;
  global.logger.log('debug', "imageId = " + imageId);


  let response = new Object();

  // If give up submit
  if (imageId < 0)
  {
    response.giveUp = true;
  } 
  else 
  {
    response.giveUp = false;
  }

  // Is this correct image?
  response.correct = false;
  
  // Check submited image against sequence of images
  for (let i = 0; i < sess.ranker.searchSession.targetImages.length; ++i)
  {
    if (sess.ranker.searchSession.targetImages[i].imageId == imageId)
    {
      response.correct = true;
      break;
    }
  }

  // Get all needed things for calling native method
  const settingsForNative = utils.convertSettingsObjectToNativeFormat(sess.ranker.settings); 




  if (typeof sess.ranker.query !== "undefined")
  {
    if (sess.ranker.query.length > 0)
    {
      let queries = new Array();
      const queryPlain = sess.ranker.query.join("&");
      queries.push(queryPlain);
      if (typeof sess.ranker.query2 !== "undefined" && sess.ranker.query2.length > 0) 
      {
        const queryPlain2 = sess.ranker.query2.join("&");
        queries.push(queryPlain2);
      }

      const kwScDataType = new Object();
      kwScDataType.keywordsDataType = req.session.keywordsSettings.kwDataType;
      kwScDataType.scoringDataType = req.session.rankingSettings.scoringDataType;

      response.relevantImagesArray = global.imageRanker.GetRelevantImagesPlainQuery(
        kwScDataType,
        queries, 
        0, 
        settingsForNative.aggregation, 
        settingsForNative.rankingModel, 
        settingsForNative.rankingModelSettings, 
        settingsForNative.aggregationSettings,
        sess.ranker.searchSession.targetImages[0].imageId,
        false
      );
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
  
  }

  const actionsArray = sess.ranker.searchSession.actionsArray;

  const userId = 0;
  const originType = sess.userLevel < 10 ? 0 : 10;
  const sessionId = sess.id;
  const searchSessionId = sess.ranker.searchSession.id;
  const targetImageId = sess.ranker.searchSession.targetImages[0].imageId;
  const endStatus = response.giveUp ? 0 : 1;


  let sessionDuration = 0;
  // If this session should be terminated
  if (response.correct || response.giveUp)
  {
    sessionDuration = rankerUtils.terminateSearchSession(sess);
    response.sessionDuration = sessionDuration;
  }
  

  // +++++++++++++++++++++++++++++++++++++++++++
  // +++++++++++++++++++++++++++++++++++++++++++
  // void ImageRanker::SubmitInteractiveSearchSubmit(
  // InteractiveSearchOrigin originType, size_t imageId, RankingModelId modelId, InputDataTransformId transformId,
  // std::vector<std::string> modelSettings, std::vector<std::string> transformSettings,
  // std::string sessionId, size_t searchSessionIndex, int endStatus, size_t sessionDuration,
  // std::vector<InteractiveSearchAction> actions,
  // size_t userId
  
  if (actionsArray.length > 0)
  {
    global.imageRanker.SubmitInteractiveSearchSubmit(
      originType, targetImageId, settingsForNative.rankingModel, settingsForNative.aggregation,
      settingsForNative.rankingModelSettings, settingsForNative.aggregationSettings,
      sessionId, searchSessionId, endStatus, sessionDuration,
      actionsArray,
      userId
    );
  }
  
  // +++++++++++++++++++++++++++++++++++++++++++
  // +++++++++++++++++++++++++++++++++++++++++++

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

  // Get single random image
  //const image = global.imageRanker.GetRandomImage();

  // Get sequence of images from single video
  const images = global.imageRanker.GetRandomImageSequence(global.gConfig.rankerConfig.previewSequenceLength);

  // Start new session with this image
  rankerUtils.startSearchSession(sess, images);

  let responseArray = new Array();

  for (let i = 0; i < images.length; ++i)
  {
    let response = new Object();
    response.imageId = images[i].imageId;
    response.imageFilename = images[i].filename;

    responseArray.push(response);
  }

  global.logger.log('debug', "response: " + JSON.stringify(responseArray, undefined, 4));  

  global.logger.log('debug', "<= getRandomImageAndStartSearchSession()");
  res.jsonp(responseArray);
}

exports.getSelectedImageAndStartSearchSession = function(req, res) 
{
  // \todo Implement with image sequences
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
   response.modelName = sess.ranker.settings.modelName;
 
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
  const operandWord = req.query.operandWord;

  global.logger.log('debug', "action = " + action + ", operand = " + operand);

  // Get all needed things for calling native method
  const settingsForNative = utils.convertSettingsObjectToNativeFormat(sess.ranker.settings); 

  //
  // Query 1
  //

  if (typeof sess.ranker.query === "undefined")
  {
    sess.ranker.query = new Array();
    sess.ranker.queryWords = new Array();
  }

  // Remove keyword
  if (action == 0)
  {
    const index = sess.ranker.query.indexOf(operand);

    // Cut out this kw
    sess.ranker.query.splice(index, 1);
    sess.ranker.queryWords.splice(index, 1);
  }
  // Add keyword from autocomplete
  else if (action == 1)
  {
    // Add keyword
    sess.ranker.query.push(operand);
    sess.ranker.queryWords.push(operandWord);
  }
  // Add keyword from detail
  else if (action == 2)
  {
    // Add keyword
    sess.ranker.query.push(operand);
    sess.ranker.queryWords.push(operandWord);
  }

  //
  // Query 2
  //
  if (typeof sess.ranker.query2 === "undefined")
  {
    sess.ranker.query2 = new Array();
    sess.ranker.queryWords2 = new Array();
  }

  // Remove keyword
  if (action == 10)
  {
    const index = sess.ranker.query2.indexOf(operand);

    // Cut out this kw
    sess.ranker.query2.splice(index, 1);
    sess.ranker.queryWords2.splice(index, 1);
  }
  // Add keyword from autocomplete
  else if (action == 11)
  {
    // Add keyword
    sess.ranker.query2.push(operand);
    sess.ranker.queryWords2.push(operandWord);
  }
  // Add keyword from detail
  else if (action == 12)
  {
    // Add keyword
    sess.ranker.query2.push(operand);
    sess.ranker.queryWords2.push(operandWord);
  }

  // Join queries with ampersand
  const queryPlain = sess.ranker.query.join("&");
  const queryPlain2 = sess.ranker.query2.join("&");

  let queriesPlain = new Array();
  
  queriesPlain.push(queryPlain);
  if (queryPlain2 != "")
  {
    queriesPlain.push(queryPlain2);
  }

  let response = new Object();
  
  if (sess.ranker.query.length > -1)
  {
    const withOccuranceValue = false;
    const kwScDataType = new Object();
    kwScDataType.keywordsDataType = req.session.keywordsSettings.kwDataType;
    kwScDataType.scoringDataType = req.session.rankingSettings.scoringDataType;

    response.relevantImagesArray = global.imageRanker.GetRelevantImagesPlainQuery(
      kwScDataType,
      queriesPlain, 
      1000, 
      settingsForNative.aggregation, 
      settingsForNative.rankingModel, 
      settingsForNative.rankingModelSettings, 
      settingsForNative.aggregationSettings,
      sess.ranker.searchSession.targetImages[0].imageId,
      withOccuranceValue
    );

    rankerUtils.pushAction(sess, action, operand, response.relevantImagesArray.targetImageRank);
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
  global.logger.log('debug', "=> getImageKeywordsForInteractiveSearch()");
  const sess = req.session;

  const imageId = req.query.imageId;

  //global.logger.log('debug', "action = " + action + ", operand = " + operand);

  const kwScDataType = new Object();
  kwScDataType.keywordsDataType = req.session.keywordsSettings.kwDataType;
  kwScDataType.scoringDataType = req.session.rankingSettings.scoringDataType;

  const response = global.imageRanker.GetImageKeywordsForInteractiveSearch(Number(imageId), 30, kwScDataType, true);

  

  global.logger.log('debug', "<= processAction()");
  res.jsonp(response);
}