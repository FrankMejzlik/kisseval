var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();

var idSrcData;
var numImages


const imageRanker = require('../build/Release/image_ranker.node');
console.log('addon',imageRanker);

const a = "C:\\Users\\devwe\\source\\repos\\blog-addons-example\\data\\images\\";
const b = "C:\\Users\\devwe\\source\\repos\\blog-addons-example\\data\\VBS2019_classification_NasNetLarge_20000.softmax";
const c = "C:\\Users\\devwe\\source\\repos\\blog-addons-example\\data\\VBS2019_classification_NasNetMobile_20000.deep-features";
const d = "C:\\Users\\devwe\\source\\repos\\blog-addons-example\\data\\keyword_classes.txt";

const prevInstance = new imageRanker.ImageRankerWrapper(a,b,c,d);

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
  for (var j = 0; j < 10000; ++j) 
  {
    var arrayIds = prevInstance.GetNearKeywords("do");
  
    for (var i = 0; i < arrayIds.length; ++i) 
    {
        console.log(arrayIds[i]);
    }
  }

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

  res.render('collector', data);
});
   
router.post('/', function(req, res, next) 
{
  console.log(req.body.games);

  var finalString = req.body.games;
  
  // If more than one keyword provided
  if (finalString instanceof Array) 
  {
    finalString = finalString.join(";");
  }

  fs.writeFileSync(path.join(__dirname, "../data/userInput.txt"), finalString + '\n', {encoding: "ascii", flag: "a"} );

  res.redirect(301, "/collector/");

});


module.exports = router;
