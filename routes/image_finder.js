var express = require("express");

var path = require("path");
var fs = require("fs");

var utils = require("./utils/utils");

var router = express.Router();

// GET request on '/'
router.get("/", function (req, res, next) {
  let phonyQuery = "false";

  // Get session object
  const sess = req.session;

  var targetImageId = sess.targetImageId;
  if (typeof targetImageId === "undefined") {
    targetImageId = 0;
  }

  // If still on same progress, show same image
  if (typeof sess.gameImage === "undefined") {
    sess.gameImage = global.imageRanker.GetRandomImage();
  }

  const newImage = sess.gameImage;
  const isDev = sess.isDev;

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
  };

  utils.checkGlobalViewState(sess, data);

  data.targetImageId = targetImageId;

  const selectedSettings = new Object();
  selectedSettings.numResults = 500;
  selectedSettings.aggregation = 2;
  selectedSettings.rankingModel = 1;

  selectedSettings.probTreshold = 0.0;
  selectedSettings.inBucketRanking = 1;
  selectedSettings.probTreshold4 = 0.0;
  selectedSettings.queryOperations = 0;

  data.selectedSettings = selectedSettings;

  res.render("image_finder", data);
});

// Process POST from autocomplete form
router.post("/", function (req, res, next) {
  var data = new Object();

  utils.checkGlobalViewState(sess, data);

  // Get session object
  const sess = req.session;
  const isDev = sess.isDev;
  data.isDev = isDev;

  const numResults = Number(req.body.numResults);
  const aggregation = Number(req.body.aggregation);
  const aggregationParam = String(req.body.aggregationParam);
  const rankingModel = Number(req.body.modelType);

  const probTreshold = req.body.trueTreshold;
  const inBucketRanking = req.body.inBucketRanking;
  const probTreshold4 = req.body.trueTreshold4;
  const queryOperations = req.body.queryOperations;

  // Variable with all settings
  const settingsArray = new Array();

  // Construct settings array based on model
  switch (rankingModel) {
    /*!
     * FORMAT:
     *  0: Boolean:
     *  1: BooleanBucket:
     *    0 => trueTreshold
     *    1 => inBucketSorting
     *  2: BooleanExtended:
     *  3: ViretBase:
     *    0 => ignoreTreshold
     *    1 => rankCalcMethod
     *      0: Multiply & (Add |)
     *      1: Add only
     *  4: FuzzyLogic:
     */

    // Boolean
    case 0:
      // Nothing just yet
      break;

    // BooleanBucket
    case 1:
      {
        // 0 =>

        settingsArray.push(probTreshold);

        // 1 =>

        settingsArray.push(inBucketRanking);
      }
      break;

    // BooleanExtended
    case 2:
      break;

    // ViretBase
    case 3:
      {
        // 0 =>

        settingsArray.push(probTreshold4);

        // 1 =>

        settingsArray.push(queryOperations);
      }
      break;

    // FuzzyLogic
    case 4:
      break;

    default:
      throw "Unknown model type.";
  }

  // Variable with all settings
  const aggSettingsArray = new Array();
  aggSettingsArray.push(aggregationParam);

  // Get keywords user provided
  var keywords = req.body.keyword;
  const keywordsWords = req.body.keywordWord;
  var targetImageId = Number(req.body.targetImageId);
  sess.targetImageId = targetImageId;

  if (typeof targetImageId === "undefined") {
    targetImageId = 0;
  }

  // Initialize final string
  let finalString = "";
  let finalStringWords = "";

  // If at least one keyword provided
  if (typeof keywords !== "undefined" && keywords.length > 0) {
    // If more than one
    if (keywords instanceof Array) {
      // Concatenate them
      finalString = keywords.join("&");
      finalStringWords = keywordsWords.join("&");
    } else {
      finalString = keywords;
      finalStringWords = keywordsWords;
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
    const kwScDataType = new Object();
    kwScDataType.keywordsDataType = req.session.keywordsSettings.kwDataType;
    kwScDataType.scoringDataType = req.session.rankingSettings.scoringDataType;

    const relData = global.imageRanker.GetRelevantImages(
      kwScDataType,
      finalString,
      numResults,
      aggregation,
      rankingModel,
      settingsArray,
      aggSettingsArray,
      targetImageId
    );
    const relevantImagesArray = relData.images;
    const targetImageRank = relData.targetImageRank;

    const selectedSettings = new Object();
    selectedSettings.numResults = numResults;
    selectedSettings.aggregation = aggregation;
    selectedSettings.rankingModel = rankingModel;

    selectedSettings.probTreshold = probTreshold;
    selectedSettings.inBucketRanking = inBucketRanking;
    selectedSettings.probTreshold4 = probTreshold4;
    selectedSettings.queryOperations = queryOperations;

    data.selectedSettings = selectedSettings;

    data.query = finalStringWords;
    data.relevantImagesArray = relevantImagesArray;
    data.keywords = keywords;
    data.keywordsWords = keywordsWords;
    data.targetImageRank = targetImageRank;
    data.targetImageId = targetImageId;
  }

  res.render("image_finder", data);
});

module.exports = router;
