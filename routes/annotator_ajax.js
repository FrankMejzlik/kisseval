
const util = require('util')

exports.GetNearKeywords = function(req, res) 
{
  const sess = req.session;

  const prefix = req.query.queryValue;
  const kwDataType = req.session.keywordsSettings.kwDataType;
  const scoringDataType = req.session.rankingSettings.scoringDataType;
  const withExamples = sess.annotatorSettings.autocompleteWithExamples;

  var nearKeywords = global.imageRanker.GetNearKeywords(kwDataType, scoringDataType, prefix, sess.annotatorSettings.numSuggestions, withExamples);

  // Send response
  res.jsonp(nearKeywords);
};