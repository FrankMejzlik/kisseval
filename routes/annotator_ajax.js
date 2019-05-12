
const util = require('util')

var foo = function (req, res, next) {
  return global.imageRanker.GetNearKeywords(req);
}

exports.find = function(req, res) 
{
  var word = req.query.queryValue;

  var itemss = foo(word);

  // Send response
  res.jsonp(itemss);
};