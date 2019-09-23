const util = require('util')

var foo = function (kwDataType,scoringDataType, prefix, numSuggestions, withExamples) {
  return global.imageRanker.GetNearKeywords(kwDataType, scoringDataType, prefix, numSuggestions, withExamples);
}

exports.find = function(req, res) 
{
  const prefix = req.query.queryValue;
  const kwDataType = req.session.keywordsSettings.kwDataType;
  const scoringDataType = req.session.rankingSettings.scoringDataType;

  const sess = req.session;

  const withExamples = req.session.annotatorSettings.autocompleteWithExamples;

  var itemss = foo(kwDataType, scoringDataType, prefix, sess.annotatorSettings.numSuggestions, withExamples);

  // Send response
  res.jsonp(itemss);
};

