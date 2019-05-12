
const util = require('util')

var foo = function (req, res, next) 
{
  const id = Number(req);
  const result = global.imageRanker.GetImageDataById(id);

  for (var i = 0; i < result.probabilityVector.length; ++i) 
  {
    const keywordIndex = result.probabilityVector[i].index;

    result.probabilityVector[i].keyword = global.imageRanker.GetKeywordByVectorIndex(keywordIndex);
  }

  return result;
}

exports.find = function(req, res) 
{
  var word = req.query.imageId;

  var imageData = foo(word);



  


  // Send response
  res.jsonp(imageData);
};