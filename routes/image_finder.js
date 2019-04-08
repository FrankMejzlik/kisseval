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



  res.render('image_finder', data);
  return;
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
    const relevantImagesArray = global.imageRanker.GetRelevantImages(finalString);


    data.query = finalString;
    data.relevantImagesArray = relevantImagesArray;


  }

    res.render('image_finder', data);
});


module.exports = router;
