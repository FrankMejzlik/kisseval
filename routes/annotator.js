var express = require('express');

var path = require('path');
var fs = require('fs');

var utils = require("./utils/utils");

var router = express.Router();


function validStateCheckGeneral(req, viewData)
{
  // Get session object reference
  const sess = req.session;

  utils.checkGlobalSessionState(sess);  
  utils.checkGlobalViewState(sess, viewData);

  // Resolve user level
  utils.resolveUserLevel(sess);

  // Get current page slug
  viewData.currentPage = "query_annotator";
  viewData.userLevel = sess.userLevel;
}

// GET page
router.get('/', function(req, res, next) 
{
  let sess = req.session;

  let viewData = new Object();

  validStateCheckGeneral(req, viewData);
  
  // Get current page slug
  const currentPage = "query_annotator";

  let phonyQuery = "false";


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

    res.redirect('/query_annotator')
  } 

  const totalGameLength = global.gConfig.gameLength + global.gConfig.tutorialLength;

  console.log("SessionId: " + sess.id + " PROGRESS : " + sess.gameProgress + "/" + totalGameLength)


  

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

  /* Get next image
    {
      "imageId": 123,
      "filename": "aaaa"
    }  */
  if (global.gConfig.log_all == true)
  {
    console.log("Serving image " + newImage);
  }

  
  // Final data instance being send to front end
  viewData.currentPage = currentPage;
  viewData.userLevel = userLevel;
  viewData.isDev = isDev;
  viewData.phonyQuery = phonyQuery;
  viewData.newImage = newImage;
  viewData.gameProgress = gameProgress;
    

  res.render('annotator', viewData);
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
      querryType += 10;
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
  res.redirect(301, "/query_annotator/");
});


module.exports = router;
