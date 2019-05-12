var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();


// GET request on '/'
router.get('/', function(req, res, next) 
{
  // Get current page slug
  const currentPage = "statistics";

  // Initialize data Object
  var data = new Object();

  // Get session object
  const sess = req.session;
  const isDev = sess.isDev;
  data.isDev = isDev;


  data.currentPage = currentPage;
  
  res.render('statistics', data);
});
   
// Process POST from autocomplete form
router.post('/', function(req, res, next) 
{
  // Initialize data Object
  var data = new Object();

  // Get session object
  const sess = req.session;
  const isDev = sess.isDev;
  data.isDev = isDev;

  // Get keywords user provided
  var keywords = req.body.keyword;
  
  // Initialize final string
  let finalString = "";


  res.render('image_finder', data);
});


module.exports = router;
