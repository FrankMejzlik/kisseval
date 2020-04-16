const util = require("util");

var foo = function (req, res, next) {
  const id = Number(req);
  const result = global.imageRanker.GetImageDataById(id);

  for (var i = 0; i < result.probabilityVector.length; ++i) {
    const keywordIndex = result.probabilityVector[i].index;

    const kwScDataType = new Object();
    kwScDataType.keywordsDataType = req.session.keywordsSettings.kwDataType;
    kwScDataType.scoringDataType = req.session.rankingSettings.scoringDataType;

    result.probabilityVector[
      i
    ].keyword = global.imageRanker.GetKeywordByVectorIndex(
      kwScDataType,
      keywordIndex
    );
  }

  return result;
};

exports.find = function (req, res) {
  var word = req.query.imageId;

  var imageData = foo(word);

  // Send response
  res.jsonp(imageData);
};
