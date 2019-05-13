
const util = require('util')

const utils = require("../routes/utils/utils");

// var foo = function (req, res, next) 
// {
//   const id = Number(req);
//   const result = global.imageRanker.GetImageDataById(id);

//   for (var i = 0; i < result.probabilityVector.length; ++i) 
//   {
//     const keywordIndex = result.probabilityVector[i].index;

//     result.probabilityVector[i].keyword = global.imageRanker.GetKeywordByVectorIndex(keywordIndex);
//   }

//   return result;
// }

exports.submitSettings = function(req, res) 
{
  const sess = req.session;

  // Save new settings into session
  if (typeof sess.ranker === "undefined")
  {
    sess.ranker = new Object();
  }
  sess.ranker.settings = utils.parseModelSettingsFromForm(req.query[0]);

  if (global.gConfig.log_all) 
  {
    console.log("Setting ranker settings to:");
    console.log(sess.ranker.settings);
    console.log("==============================");
  }
  
  res.redirect('/ranker');
};