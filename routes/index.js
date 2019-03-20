var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  var textData = fs.readFileSync(path.join(__dirname, "../data/data.csv"), {encoding: "ascii"});

  var data = { 
    title: 'ImageRankingCollector' ,
    keywords: textData.split(";") 
  };

  res.render('index', data);
});


module.exports = router;

router.post('/', function(req, res, next) {

});