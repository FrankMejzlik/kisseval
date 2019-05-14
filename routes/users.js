var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('USERS HERE');
});


router.post('/', function(req, res, next) 
{
  var pass = req.body.pass;

  // If correct pass
  if (pass == "ndbi045") 
  {
    // Switch to dev session
    req.session.isDeveloperSession = !req.session.isDeveloperSession;
    req.session.userLevel = 10;
  }
  
  // Redirect user back home page
  res.redirect(301, "/");
});

module.exports = router;
