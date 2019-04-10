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

  var targetImageId = sess.targetImageId;
  if (typeof targetImageId === 'undefined') 
  {
    targetImageId = 0;
  }
  

  // If still on same progress, show same image
  if (typeof sess.gameImage === 'undefined')
  {
    sess.gameImage = global.imageRanker.GetRandomImage();
  } 

  const newImage = sess.gameImage;
  const isDev = sess.isDev;

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
    isDev
  };

  data.targetImageId = targetImageId;



  res.render('image_finder', data);
});
   
// Process POST from autocomplete form
router.post('/', function(req, res, next) 
{
  var data = new Object();

  // Get session object
  const sess = req.session;
  const isDev = sess.isDev;
  data.isDev = isDev;

  // Get keywords user provided
  var keywords = req.body.keyword;
  var targetImageId = Number(req.body.targetImageId);
  sess.targetImageId = targetImageId;


  if (typeof targetImageId === 'undefined') 
  {
    targetImageId = 0;
  }
  
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

    // GetRelevantImages
    console.log("Getting relevant images!!!");

    // Get relevant images array for this query
    /* RETURN:
    [
      {
        "imageId" : 1234,
        "filename": fefef.jpg
      },
      {
        "imageId" : 1233314,
        "filename": fefefaf.jpg
      }
      ...
    ] */

    /*
    enum RankingModel 
      {
        cBoolean,
        cBooleanCustom,
        cBooleanExtended,
        cViretBase,
        cFuzzyLogic
      };  
    */


    const relData = global.imageRanker.GetRelevantImages(finalString, 500, 1, targetImageId);
    const relevantImagesArray = relData.images;
    const targetImageRank = relData.targetImageRank;


    data.query = finalString;
    data.relevantImagesArray = relevantImagesArray;
    data.keywords = keywords;
    data.targetImageRank = targetImageRank;
    data.targetImageId = targetImageId;


  }

    res.render('image_finder', data);
});


module.exports = router;
