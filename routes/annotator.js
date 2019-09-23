var express = require('express');
var router = express.Router();

var path = require('path');
var fs = require('fs');

var utils = require("./utils/utils");

const routeSettings = {
  "slug": "annotator"
}

function PreProcessReq(req, viewData)
{
  const sess = req.session;

  // Do general request preprocess
  utils.PreProcessReq(req, viewData, routeSettings);

  // Get current page slug
  viewData.currentPage = routeSettings.slug;
}

function ProcessReq(req, viewData)
{
  let sess = req.session;

}

function PostProcessReq(req, viewData)
{
  let sess = req.session;

  utils.PostProcessReq(req, viewData, routeSettings);
}

/*!
 * GET "/" request
 */
router.get('/', function(req, res, next) 
{
  let sess = req.session;
  let viewData = new Object();

  PreProcessReq(req, viewData)
  ProcessReq(req, viewData);
  

  const isDev = req.session.isDeveloperSession;

  // Get user level
  let userLevel = 1;
  if (req.session.isDeveloperSession)
  {
    userLevel = 10;
  }



  // If this session has not initialized game yet
  if (typeof sess.gameProgress === 'undefined' || req.query.startGame == "true") 
  {
    sess.gameProgress = 1;
    
    // Initialize array of this session's images
    sess.gameWalkthrough = new Array();

    res.redirect('/annotator')
  } 

  const totalGameLength = global.gConfig.gameLength + global.gConfig.tutorialLength;

  global.logger.log('verbose', "SessionId: " + sess.id + " PROGRESS : " + sess.gameProgress + "/" + totalGameLength);

  

  // If dev, skip tutorial
  if (isDev == true && sess.gameProgress < 3 && sess.gameProgress >= 1) 
  {
    sess.gameProgress= 3;
  }

  const gameProgress = new Object();
  gameProgress.curr = sess.gameProgress;
  gameProgress.total = totalGameLength;

  // If finished game
  if (sess.gameProgress > totalGameLength) 
  {
    res.redirect(301, "/scoreboard/");
    return;
  }


  // If still on same progress, show same image
  if (typeof sess.gameImage === 'undefined')
  {
    // xoxo: If we're coupling data
    const couplingImageData = global.imageRanker.GetCouplingImage();

    sess.gameImage = new Object();
    sess.gameImage.imageId = couplingImageData.imageId;
    sess.gameImage.filename = couplingImageData.filename;

    // Set correctly if example images should be shown
    utils.setAnnotatorShowExamples(sess, couplingImageData.withExamples);

    sess.numNotCoupled = couplingImageData.numNotCoupled;

    //sess.gameImage = global.imageRanker.GetRandomImage();
  } 

  const newImage = sess.gameImage;

  if (global.gConfig.log_all == true)
  {
    console.log("Serving image " + newImage);
  }

  
  // Final data instance being send to front end
  viewData.isDev = isDev;
  viewData.newImage = newImage;
  viewData.gameProgress = gameProgress;
    

  // Finish this request
  PostProcessReq(req, viewData);

  res.render(routeSettings.slug, viewData);
  return;
});
   
// Process POST from autocomplete form
router.post('/', function(req, res, next) 
{
  // Get keywords user provided
  var keywords = req.body.keyword;

  // Get this session 
  const sess = req.session;
  
  // Initialize final string
  let finalString = "";

  // If at least one keyword provided
  if (typeof keywords !== 'undefined' && keywords.length > 0) 
  {
    // If more than one
    if (keywords instanceof Array) 
    {
      // Concatenate them
      finalString = keywords.join('&');
    }
    else {
      finalString = keywords;
    }

    let sessionId = sess.id;
    let imageId = sess.gameImage.imageId;

    const isDev = req.session.isDeveloperSession;
    let queryType = 0;
    if (isDev)
    {
      queryType = 1;
    }

    let wasWithExampleImages = false;
    if (req.session.annotatorSettings.autocompleteWithExamples)
    {
      wasWithExampleImages = true;
    }

    if (wasWithExampleImages)
    {
      queryType += 10;
    }
    

    // Parameters: SessionID, ImageID, string query
    const kwScDataType = new Object();
    kwScDataType.keywordsDataType = req.session.keywordsSettings.kwDataType;
    kwScDataType.scoringDataType = req.session.rankingSettings.scoringDataType;

    const userImageResult = global.imageRanker.SubmitUserQueriesWithResults(kwScDataType, sessionId, imageId, finalString, queryType);
    
    // Mark it into session
    sess.gameWalkthrough.push(userImageResult);

    // Increment game progress counter
    ++sess.gameProgress;
    
    
    console.log("Incrementing game progress for session " + sess.id + " to " + sess.gameProgress );    
  }

  // Reset image
  sess.gameImage = undefined;

  
  // Redirect user back to game page
  res.redirect(301, "/annotator/");
});


module.exports = router;
