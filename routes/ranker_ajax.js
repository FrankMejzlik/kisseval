
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

exports.submitSettings = function(req, res) 
{
  const sess = req.session;

  const numResults = Number(req.query.numResults);
  const aggregation = Number(req.query.aggregation);
  const aggregationParam = String(req.query.aggregationParam);
  const rankingModel = Number(req.query.modelType);
  
  const probTreshold = req.query.trueTreshold;
  const inBucketRanking = req.query.inBucketRanking;
  const probTreshold4 = req.query.trueTreshold4;
  const queryOperations = req.query.queryOperations;
  

  // Variable with all settings
  const settingsArray = new Array();

  // Construct settings array based on model
  switch (rankingModel)
  {
    /*!
    * FORMAT:
    *  0: Boolean:
    *  1: BooleanBucket:
    *    0 => trueTreshold
    *    1 => inBucketSorting
    *  2: BooleanExtended:
    *  3: ViretBase:
    *    0 => ignoreTreshold
    *    1 => rankCalcMethod
    *      0: Multiply & (Add |)
    *      1: Add only
    *  4: FuzzyLogic:
    */

    // Boolean
    case 0:
    // Nothing just yet
    break;

    // BooleanBucket
    case 1:
    {
      // 0 => 
      
      settingsArray.push(probTreshold);

      // 1 =>
      
      settingsArray.push(inBucketRanking);
    }
    break;

    // BooleanExtended
    case 2:

    break;

    // ViretBase
    case 3:
    {
      // 0 =>
      
      settingsArray.push(probTreshold4);

      // 1 =>
      
      settingsArray.push(queryOperations);
    }
    break;

    // FuzzyLogic
    case 4:

    break;

    default:
      throw "Unknown model type.";
  }

  // Variable with all settings
  const aggSettingsArray = new Array();
  aggSettingsArray.push(aggregationParam);

  const rankerSettings = new Object();
  rankerSettings.numResults = numResults;
  rankerSettings.aggregation = aggregation;
  rankerSettings.aggregationSettingArray = aggSettingsArray;
  rankerSettings.rankingModel = rankingModel;
  rankerSettings.rankingModelSettingsArray = settingsArray;

  sess.ranker = new Object();

  sess.ranker.settings = rankerSettings;

  console.log("Setting ranker settings to:");
  console.log(sess.ranker.settings);
  console.log("==============================");


  res.redirect('/ranker');
};