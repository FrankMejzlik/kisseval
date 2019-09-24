
var express = require('express');
var router = express.Router();

const utils = require("../routes/utils/utils");
const rankerUtils = require("../routes/utils/ranker_utils");

const routeSettings = {
  "slug": "ranker"
}

function PreProcessReq(req, viewData)
{
  const sess = req.session;


  // Do general request preprocess
  utils.PreProcessReq(req, viewData, routeSettings);

  rankerUtils.checkOrInitSessionRankerObject(sess);

  // Make sure that settings stored in session are initialized
  rankerUtils.initOrResumeInteractiveSearchSession(sess, viewData);

  // Get current page slug
  viewData.currentPage = routeSettings.slug;
  viewData.ocRankerSettingsLeft_ranker = true;
  viewData.ocRankerSettingsLeft_ranker_formActionAddress = "/ranker_ajax_submit_settings";
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
  
  global.logger.log('debug', "sess.ranker.searchSession: " + JSON.stringify(sess.ranker.searchSession, undefined, 4));
  

  // Rener ranker view
  res.render(viewData.currentPage, viewData);
});


module.exports = router;
