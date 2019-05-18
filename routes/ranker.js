
var express = require('express');
var router = express.Router();

const utils = require("../routes/utils/utils");

const rankerUtils = require("../routes/utils/ranker_utils");

function validStateCheckGeneral(req, viewData)
{
  // Get session object reference
  const sess = req.session;

  // Resolve user level
  utils.resolveUserLevel(sess);

  // Get current page slug
  viewData.currentPage = "ranker";
  viewData.ocRankerSettingsLeft_ranker = true;
  viewData.ocRankerSettingsLeft_ranker_formActionAddress = "/ranker_ajax_submit_settings";
  viewData.userLevel = sess.userLevel;
}

function validStateCheckSpecific(req, viewData)
{
  // Get session object reference
  const sess = req.session;

  // Make sure ranker object exists
  if (typeof sess.ranker === "undefined")
  {
    sess.ranker = new Object();
    sess.ranker.settings = new Object();
  }

  

  // Make sure that settings stored in session are initialized
  rankerUtils.initOrResumeInteractiveSearchSession(sess, viewData);

}

// GET request
router.get('/', function(req, res, next) 
{
  const sess = req.session;

  // This structure will be send to view template
  let viewData = new Object();

  // Do valid state checks
  validStateCheckGeneral(req, viewData);
  validStateCheckSpecific(req, viewData);
  
  //rankerUtils.terminateSearchSession(sess);


  global.logger.log('debug', "sess.ranker:"+ JSON.stringify(sess.ranker, undefined, 4));

  global.logger.log('debug', "viewData:"+ JSON.stringify(viewData, undefined, 4));

  // Rener ranker view
  res.render('ranker', viewData);
});


module.exports = router;
