var express = require('express');

var path = require('path');
var fs = require('fs');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) 
{

  var textData = fs.readFileSync(path.join(__dirname, "../data/data.csv"), {encoding: "ascii"});

  var data = { 
    title: 'ImageRankingCollector' ,
    keywords: textData.split(";") 
  };

  res.render('collector', data);
});
   
router.post('/', function(req, res, next) 
{
  console.log(req.body.games);

  var finalString = req.body.games;
  
  // If more than one keyword provided
  if (finalString instanceof Array) 
  {
    finalString = finalString.join(";");
  }

  fs.writeFileSync(path.join(__dirname, "../data/userInput.txt"), finalString + '\n', {encoding: "ascii", flag: "a"} );

  res.redirect(301, "/collector/");

});


module.exports = router;
