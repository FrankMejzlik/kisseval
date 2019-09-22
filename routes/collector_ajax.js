const util = require('util')

var foo = function (kwDataType, prefix, withExamples) {
  return global.imageRanker.GetNearKeywords(kwDataType, prefix, withExamples);
}

exports.find = function(req, res) 
{
  const prefix = req.query.queryValue;
  const kwDataType = req.session.keywordsSettings.kwDataType;
  const withExamples = req.session.keywordsSettings.withExamples;

  var itemss = foo(kwDataType, prefix, withExamples);

  // Send response
  res.jsonp(itemss);
};

