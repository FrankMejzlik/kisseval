var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();

var idSrcData;
var numImages


var idMultiplier = 50;

function getRandomInt(max) 
{
  return Math.floor(Math.random() * Math.floor(max));
}


// GET request on '/'
router.get('/', function(req, res, next) 
{
  const sess = req.session;

  if (typeof sess.gameProgress === 'undefined') {
    sess.gameProgress = 0;
  } else {

  }
  console.log("SessionId: " + sess.id + " PROGRESS : " + sess.gameProgress + "/10")


if (sess.gameProgress >= 10) {
  res.render('collector_done', data);
  return;
}

  // Get next image
  /*{
      "imageId": 123,
      "filename": "aaaa"
    }  */
  const newImage = global.imageRanker.GetRandomImage();

  if (global.gConfig.log_all == true)
  {
    console.log("Serving image " + newImage);
  }

  // Final data instance being send to front end
  var data = { 
    newImage
  };



  res.render('collector', data);
});
   
router.post('/', function(req, res, next) 
{
  console.log(req.body.keyword);

  var keywords = req.body.keyword;

  const sess = req.session;
  if (typeof keywords !== 'undefined' && keywords.length > 0) 
  {
    ++sess.gameProgress;

    console.log("Incrementing game progress for session " + sess.id + " to " + sess.gameProgress );    
  }

  let finalString = "";

  if (finalString instanceof Array) 
  {
    finalString = keywords.join('&');
  }
  
  fs.writeFileSync(path.join(__dirname, "../data/userInput.txt"), finalString + '\n', {encoding: "ascii", flag: "a"} );

  res.redirect(301, "/collector/");

});


module.exports = router;
