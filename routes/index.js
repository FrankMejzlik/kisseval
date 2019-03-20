var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  var data = { 
    title: 'ImageRankingCollector'
  };

  res.render('index', data);
});


module.exports = router;

router.post('/', function(req, res, next) {

});