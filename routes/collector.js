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
   
router.post('/', function(req, res, next) 
{
  console.log(req.body.keyword);

  var keywords = req.body.keyword;

  const sess = req.session;
  

  let finalString = "";

  if (keywords instanceof Array) 
  {
    finalString = keywords.join('&');
  }
  

  if (typeof keywords !== 'undefined' && keywords.length > 0) 
  {
    // Process in backend
    // PushQueryWithResults();
    
    if (sess.gameProgress > 2)
    {
      const doneImageStruct = new Object();
      
      doneImageStruct.image = sess.gameImage;
      doneImageStruct.userKeywords = keywords;

      // Mark it into session.
      sess.gameWalkthrough.push(doneImageStruct);
    }

    ++sess.gameProgress;
    
    // Reset image
    sess.gameImage = undefined;

    console.log("Incrementing game progress for session " + sess.id + " to " + sess.gameProgress );    
  }


  if (req.body.phonyQuery !== "true") {
    fs.writeFileSync(path.join(__dirname, "../data/userInput.txt"), finalString + '\n', {encoding: "ascii", flag: "a"} );
  }
  
  
  res.redirect(301, "/collector/");
});


module.exports = router;
