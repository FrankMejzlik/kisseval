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

/* GET home page. */
router.get('/', function(req, res, next) {
  const sess = req.session;

  // This structure will be send to view template
  let viewData = new Object();

  // Do valid state checks
  validStateCheckGeneral(req, viewData);
  validStateCheckSpecific(req, viewData);

  res.render('index', viewData);
});


module.exports = router;

router.post('/', function(req, res, next) {

});