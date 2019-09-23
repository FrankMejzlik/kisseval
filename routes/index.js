var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();
const utils = require("../routes/utils/utils");

const routeSettings = {
  "slug": "index"
}

function PreProcessReq(req, viewData)
{
  const sess = req.session;

  // Do general request preprocess
  utils.PreProcessReq(req, viewData, routeSettings);

  // Get current page slug
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

/*!
 * GET "/" request
 */
router.get('/', function(req, res, next) 
{
  let sess = req.session;
  let viewData = new Object();

  PreProcessReq(req, viewData)
  ProcessReq(req, viewData);
  PostProcessReq(req, viewData);

  res.render(routeSettings.slug, viewData);
});

router.post('/', function(req, res, next) {

});

module.exports = router;