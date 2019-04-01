var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();


// GET request on '/'
router.get('/', function(req, res, next) 
{
  let phonyQuery = "false";

  // Get session object
  const sess = req.session;

  // If this session has not initialized game yet
  if (typeof sess.gameProgress === 'undefined' || req.query.startGame == "true") 
  {
    sess.gameProgress = 1;
    
    // Initialize array of this session's images
    sess.gameWalkthrough = new Array();

    res.redirect('/collector')
  } 


  const totalGameLength = global.gConfig.gameLength + global.gConfig.tutorialLength;

  console.log("SessionId: " + sess.id + " PROGRESS : " + sess.gameProgress + "/" + totalGameLength)

  // If in tutorial
  if (sess.gameProgress <= global.gConfig.tutorialLength) 
  {
    phonyQuery = "true";
    var data = { 
      phonyQuery
    };

    res.render('tutorials/example_pic' + sess.gameProgress, data);
    return;
  }

  // If finished game
  if (sess.gameProgress >= totalGameLength) 
  {

    // var gameWalkthrough = sess.gameWalkthrough;
    // var data = { 
    //   gameWalkthrough
    // };


    res.redirect(301, "/scoreboard/");
    return;
  }


  // If still on same progress, show same image
  if (typeof sess.gameImage === 'undefined')
  {
    sess.gameImage = global.imageRanker.GetRandomImage();

    console.log("aaa:" + JSON.stringify(sess.gameImage));

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
    phonyQuery,
    newImage
  };



  res.render('collector', data);
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

    // If player out of tutorial
    if (sess.gameProgress > 2)
    {

      let sessionId = sess.id;
      let imageId = sess.gameImage.imageId;

      // Parameters: SessionID, ImageID, string query
      const userImageResult = global.imageRanker.SubmitUserQueriesWithResults(sessionId, imageId, finalString);
      /* RETURN OBJECT:
        [
          {
            "sessionId": "332e3f4",
            "imageFilename": "file2.jpg",
            "keywords": [ "k1", "k2" ,... ]
            "netProbabilites": [
                {
                  "netKeyword": 1222,
                  "netProbability": 0.444,
                },
                ...
            ]

          }
          ...
        ]
      */


      // Mark it into session
      sess.gameWalkthrough.push(userImageResult);
    }

    // Increment game progress counter
    ++sess.gameProgress;
    
    // Reset image
    sess.gameImage = undefined;

    console.log("Incrementing game progress for session " + sess.id + " to " + sess.gameProgress );    
  }

  // If was not PHONY query (e.g. test or tutorial onw)
  if (req.body.phonyQuery !== "true") 
  {

  }
  
  // Redirect user back to game page
  res.redirect(301, "/collector/");
});


module.exports = router;
