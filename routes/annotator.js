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


  const isDev = req.session.isDeveloperSession;

  // If dev, skip tutorial
  if (isDev == true && sess.gameProgress < 3 && sess.gameProgress >= 1) 
  {
    sess.gameProgress= 3;
  }

  const gameProgress = new Object();
  gameProgress.curr = sess.gameProgress;
  gameProgress.total = totalGameLength;

  // If in tutorial
  if (sess.gameProgress <= global.gConfig.tutorialLength) 
  {
    // Send example data to views
    let exampleItems;
    if (sess.gameProgress == 1) {
      exampleItems ='<li class="slected-keyword-checkbox"><input type="checkbox" name="keyword" value="boat" checked="">                <span>boat</span> <a class="remove-keyword button alert" onclick="removeKeyword(event, this);"> X</a></li><li class="slected-keyword-checkbox"><input type="checkbox" name="keyword" value="ocean" checked="">                <span>ocean</span> <a class="remove-keyword button alert" onclick="removeKeyword(event, this);"> X</a></li><li class="slected-keyword-checkbox"><input type="checkbox" name="keyword" value="pier" checked="">                <span>pier</span> <a class="remove-keyword button alert" onclick="removeKeyword(event, this);"> X</a></li><li class="slected-keyword-checkbox"><input type="checkbox" name="keyword" value="forest" checked="">                <span>forest</span> <a class="remove-keyword button alert" onclick="removeKeyword(event, this);"> X</a></li><li class="slected-keyword-checkbox"><input type="checkbox" name="keyword" value="coast" checked="">                <span>coast</span> <a class="remove-keyword button alert" onclick="removeKeyword(event, this);"> X</a></li>';
    } 
    else if (sess.gameProgress == 2) {
      exampleItems ='<li class="slected-keyword-checkbox"><input type="checkbox" name="keyword" value="sky" checked="">                <span>sky</span> <a class="remove-keyword button alert" onclick="removeKeyword(event, this);"> X</a></li><li class="slected-keyword-checkbox"><input type="checkbox" name="keyword" value="dirt" checked="">                <span>dirt</span> <a class="remove-keyword button alert" onclick="removeKeyword(event, this);"> X</a></li><li class="slected-keyword-checkbox"><input type="checkbox" name="keyword" value="ground" checked="">                <span>ground</span> <a class="remove-keyword button alert" onclick="removeKeyword(event, this);"> X</a></li>';
    }

    
    
    // Final data instance being send to front end
    var data = { 
      isDev,
      exampleItems,
      gameProgress
    };

    res.render('tutorials/example_pic' + sess.gameProgress, data);
    return;
  }

  // If finished game
  if (sess.gameProgress > totalGameLength) 
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
    isDev,
    phonyQuery,
    newImage,
    gameProgress
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

      let queryType = 1;
      if (sess.isDeveloperSession == true) 
      {
        // Set to developer query
        queryType = 0;
      }

      // Parameters: SessionID, ImageID, string query
      const userImageResult = global.imageRanker.SubmitUserQueriesWithResults(sessionId, imageId, finalString, queryType);
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

  
  // Redirect user back to game page
  res.redirect(301, "/collector/");
});


module.exports = router;
