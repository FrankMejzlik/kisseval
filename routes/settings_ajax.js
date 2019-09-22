
const util = require('util')

exports.SetKeywordScoringDataType = function(req, res) 
{
  let sess = req.session;

  sess.keywordsSettings.kwDataType = Number(req.body.kwDataType);
  sess.rankingSettings.scoringDataType = Number(req.body.scoringDataType);

  res.jsonp(true);
};