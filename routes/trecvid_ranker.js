
var express = require('express');
var router = express.Router();

const utils = require("./utils/utils");
const rankerUtils = require("./utils/ranker_utils");
const trecvidRankerUtils = require("./utils/trecvid_ranker_utils");

function validStateCheckGeneral(req, viewData)
{
  // Get session object reference
  const sess = req.session;

  // Resolve user level
  utils.resolveUserLevel(sess);

  utils.checkGlobalViewState(sess, viewData);

  // Get current page slug
  viewData.currentPage = "trecvid_ranker";
  viewData.ocRankerSettingsLeft_ranker = true;
  viewData.ocRankerSettingsLeft_ranker_formActionAddress = "/ranker_ajax_submit_settings";
  viewData.userLevel = sess.userLevel;
}

function validStateCheckSpecific(req, viewData)
{
  // Get session object reference
  const sess = req.session;

  rankerUtils.checkOrInitSessionRankerObject(sess);

  // Make sure that settings stored in session are initialized
  trecvidRankerUtils.initOrResumeTrecvidTaskSession(sess, viewData);

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
  
  global.logger.log('debug', "sess.ranker:" + JSON.stringify(sess.ranker, undefined, 4));

  global.logger.log('debug', "viewData:" + JSON.stringify(viewData, undefined, 4));

  // Rener ranker view
  res.render('trecvid_ranker', viewData);
});


module.exports = router;
