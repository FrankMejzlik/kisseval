var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();


// Process GET request
router.get('/', function(req, res, next) 
{
  const sess = req.session;

  if (typeof sess.gameProgress === 'undefined') 
  {
    res.redirect('/collector');
  }

  const gameWalkthrough = sess.gameWalkthrough;
  const isDev = req.session.isDeveloperSession;
  
  // Final data instance being send to front end
  var data = { 
    isDev,
    gameWalkthrough
  };

  res.render('scoreboard', data);
  return;
});

// Process POST request
router.post('/', function(req, res, next) 
{

});


module.exports = router;
