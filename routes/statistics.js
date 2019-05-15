var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();


const utils = require("../routes/utils/utils");

function validStateCheckGeneral(req, viewData)
{
  // Get session object reference
  const sess = req.session;

  // Resolve user level
  utils.resolveUserLevel(sess);

  // Get current page slug
  viewData.currentPage = "statistics";
  viewData.userLevel = sess.userLevel;
}

function validStateCheckSpecific(req, viewData)
{
  // Get session object reference
  const sess = req.session;

}


// GET request on '/'
router.get('/', function(req, res, next) 
{
  const sess = req.session;

  // This structure will be send to view template
  let viewData = new Object();

  // Do valid state checks
  validStateCheckGeneral(req, viewData);
  validStateCheckSpecific(req, viewData);

  global.logger.log('debug', "sess.ranker:"+ JSON.stringify(sess.ranker, undefined, 4));


  data.currentPage = currentPage;
  
  res.render('statistics', data);
});
   

module.exports = router;
