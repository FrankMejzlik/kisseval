var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();


const utils = require("./utils/utils");

const dataCenterUtils = require("./data_center_ajax.js");

const routeSettings = {
  "slug": "data_center"
}

function PreProcessReq(req, viewData)
{
  // Get session object reference
  const sess = req.session;

  

  // Do general request preprocess
  utils.PreProcessReq(req, viewData, routeSettings);

  viewData.currentPage = routeSettings.slug;
}

function ProcessReq(req, viewData)
{
  let sess = req.session;


}

function PostProcessReq(req, viewData)
{
  let sess = req.session;

  utils.PostProcessReq(req, viewData, routeSettings);
}


// GET request on '/'
router.get('/', function(req, res, next) 
{
  let sess = req.session;
  let viewData = {
    "ui": {
      "ranker": {
        "queryInputUnlocked": false,
        "queryInput2Unlocked": false
      }
    },
  };

  PreProcessReq(req, viewData)
  ProcessReq(req, viewData);
  PostProcessReq(req, viewData);


  global.dbConnectionsPool.query('SELECT `id`, `query`, `keyword_data_type`, `scoring_data_type`, `image_id`, `type`, `created`, `sessionId`, `manuallyValidated` FROM ' + global.gConfig.db.dbName + '.queries;', 
  function (error, results, fields) 
  {
    if (error) 
    {
      throw error;
    }

    
    sess.annotatorRecords = results;

    if (typeof sess.annotatorDataSelected === "undefined")
    {
      sess.annotatorDataSelected = 0;
      sess.annotatorRecords[0].selected = true;
    }

    sess.annotatorRecords[sess.annotatorDataSelected].imageFilename = "generic/bg_neural.jpg";
    sess.annotatorRecords[sess.annotatorDataSelected].queryKewords = [
      {
        id: 1,
        word: "potato"
      },
      {
        id: 2,
        word: "leaf"
      },
    ];


    viewData.annotatorRecords = results;
    viewData.annotatorDataSelected = sess.annotatorDataSelected;

    res.render(routeSettings.slug, viewData);
  });
  
  
});
   

module.exports = router;
