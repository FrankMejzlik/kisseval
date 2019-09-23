var express = require('express');

var path = require('path');
var fs = require('fs');

var utils = require("./utils/utils");

var router = express.Router();


const routeSettings = {
  "slug": "scoreboard",
  "redirect": "/annotator"
}

function PreProcessReq(req, viewData)
{  
  const sess = req.session;
  
  // Do general request preprocess
  utils.PreProcessReq(req, viewData, routeSettings);
  
  viewData.currentPage = routeSettings.slug;

  
  viewData.isDev = sess.isDeveloperSession;
  viewData.gameWalkthrough = req.session.gameWalkthrough;
}

function ProcessReq(req, res, viewData)
{
  let sess = req.session;

  if (typeof sess.gameProgress === 'undefined') 
  {
    res.redirect(routeSettings.redirect);
  }
}

function PostProcessReq(req, viewData)
{
  let sess = req.session;

  utils.PostProcessReq(req, viewData, routeSettings);

}

/*!
 * GET "/" request
 */
router.get('/', function(req, res, next) 
{
  let sess = req.session;
  let viewData = new Object();

  PreProcessReq(req, viewData)
  ProcessReq(req, res, viewData);
  PostProcessReq(req, viewData);

  res.render(routeSettings.slug, viewData);
});

// Process POST request
router.post('/', function(req, res, next) 
{

});


module.exports = router;
