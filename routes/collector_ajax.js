const util = require('util')

var foo = function (kwDataType, scoringDataType, prefix, withExamples) {
  return global.imageRanker.GetNearKeywords(kwDataType, scoringDataType, prefix, withExamples);
}

exports.find = function(req, res) 
{
  const prefix = req.query.queryValue;
  const kwDataType = req.session.keywordsSettings.kwDataType;
  const scoringDataType = req.session.rankingSettings.scoringDataType;
  
  const withExamples = req.session.annotatorSettings.autocompleteWithExamples;

  var itemss = foo(kwDataType, scoringDataType, prefix, withExamples);

  // Send response
  res.jsonp(itemss);
};


