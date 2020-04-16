var express = require("express");

var path = require("path");
var fs = require("fs");

var router = express.Router();

// GET request on '/'
router.get("/", function (req, res, next) {
  // Get session object
  const sess = req.session;
  const isDev = req.session.isDeveloperSession;
  const newImage = global.imageRanker.GetRandomImage();

  sess.devImage = newImage.imageId;

  /* Get next image
    {
      "imageId": 123,
      "filename": "aaaa"
    }  */
  if (global.gConfig.log_all == true) {
    console.log("Serving image " + newImage);
  }

  // Final data instance being send to front end
  var data = {
    isDev,
    newImage,
  };

  res.render("collector_dev", data);
});

// Process POST from autocomplete form
router.post("/", function (req, res, next) {
  // Get keywords user provided
  var keywords = req.body.keyword;

  // Get this session
  const sess = req.session;

  // Initialize final string
  let finalString = "";

  // If at least one keyword provided
  if (typeof keywords !== "undefined" && keywords.length > 0) {
    // If more than one
    if (keywords instanceof Array) {
      // Concatenate them
      finalString = keywords.join("&");
    } else {
      finalString = keywords;
    }

    let sessionId = sess.id;
    let imageId = sess.devImage;

    // Parameters: SessionID, ImageID, string query
    // ONLY DEV QUERIES here
    const userImageResult = global.imageRanker.SubmitUserQueriesWithResults(
      sessionId,
      imageId,
      finalString,
      0
    );

    const a = userImageResult;
  }
  // Redirect user back to game page
  res.redirect(301, "/collector_dev/");
});

module.exports = router;
