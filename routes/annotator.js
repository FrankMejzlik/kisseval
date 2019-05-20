var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();

// GET page
router.get('/', function(req, res, next) 
{
  // Get current page slug
  const currentPage = "query_annotator";

  let phonyQuery = "false";

  // Get session object
  const sess = req.session;
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
    sess.gameImage = global.imageRanker.GetRandomImage();
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
  var data = { 
    currentPage,
    userLevel,
    isDev,
    phonyQuery,
    newImage,
    gameProgress
  };



  res.render('annotator', data);
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

    let queryType = 10;

    // Parameters: SessionID, ImageID, string query

    const userImageResult = global.imageRanker.SubmitUserQueriesWithResults(sessionId, imageId, finalString, queryType);
    
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
