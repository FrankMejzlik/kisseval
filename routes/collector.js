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

function GetRandomImageSrcPair() 
{
  // Get random ID
  var randImgId = getRandomInt(numImages - 1);
  var record = idSrcData.idSrcPairs[randImgId];
  return record;
}

// GET request on '/'
router.get('/', function(req, res, next) 
{
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
  console.log(req.body.query);

  var finalString = req.body.query;
  
  // If more than one keyword provided
  if (finalString instanceof Array) 
  {
    finalString = finalString.join("&");
  }

  fs.writeFileSync(path.join(__dirname, "../data/userInput.txt"), finalString + '\n', {encoding: "ascii", flag: "a"} );

  res.redirect(301, "/collector/");

});


module.exports = router;
