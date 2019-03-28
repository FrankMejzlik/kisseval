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

/* GET home page. */
router.get('/', function(req, res, next) 
{
  // for (var j = 0; j < 100; ++j) 
  // {
  //   var arrayIds = GLOBAL.imageRanker.GetNearKeywords("do");
  
  //   for (var i = 0; i < arrayIds.length; ++i) 
  //   {
  //       console.log("wordnetId = " + arrayIds[i][0]);
  //       console.log("word = " + arrayIds[i][1]);
  //       console.log("description = " + arrayIds[i][2]);
  //   }
  // }

  // Load data about ID => src 
  idSrcData = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/images.in"), 'ascii'));
  // Get their number

  numImages = idSrcData.idSrcPairs.length;
  console.log("numImages = " + numImages);

  // Load data about vecIndex => description
  indexDescData = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/vecIndexToDescription.in"), 'ascii'));


  // Get random image
  var newImageObj = GetRandomImageSrcPair();
  console.log(newImageObj.id);
  console.log(newImageObj.src);

  // Final data instance being send to front end
  var data = { 
    title: 'ImageRankingCollector' ,
    pathToImages: "../images/",
    newImageObj,
    indexDescData
  };

  console.log(global.gConfig);

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

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
      console.log('Closed out remaining connections');
      process.exit(0);
  });

  setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
  }, 10000);

  connections.forEach(curr => curr.end());
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}

module.exports = router;
