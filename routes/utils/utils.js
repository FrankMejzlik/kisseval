
exports.getDefaultModelSettingsObject = function ()
{
  selectedSettings = new Object();

  selectedSettings.numResults = 500;
  selectedSettings.aggregation = 100;
  selectedSettings.aggregationParameter = 1;
  selectedSettings.rankingModel = 3;
  selectedSettings.keywordFrequency = 0;
  selectedSettings.dataSource = 0;
  
  selectedSettings.keywordFrequency = "0";

  selectedSettings.boolean_trueTreshold = "0.001";
  selectedSettings.boolean_inBucketRanking = "0";

  selectedSettings.viret_trueTreshold = "0.0";
  selectedSettings.viret_queryOperations = "1";

  return selectedSettings;
}

exports.initializeModelSettings = function(sessionObject)
{ 
  // If ranker session object not initialized yet
  if (typeof sessionObject.ranker === "undefined")
  {
    if (global.gConfig.log_all)
    {
      console.log("Initializing sess.ranker object for session " + sessionObject.id);
    }
    sessionObject.ranker = new Object();
  }
  if (typeof sessionObject.ranker.settings === "undefined")
  {
    sessionObject.ranker.settings = exports.getDefaultModelSettingsObject();
  }
};

exports.parseModelSettingsFromForm = function(formBbody)
{ 
  // Get default values
  let settings = exports.getDefaultModelSettingsObject();

  // If some are set, just overwrite them
  if (typeof formBbody.numResults !== "undefined")
  {
    settings.numResults = formBbody.numResults;
  }   
  if (typeof formBbody.aggregation !== "undefined")
  {
    settings.aggregation = formBbody.aggregation;
  }
  if (typeof formBbody.aggregationParameter !== "undefined")
  {
    settings.aggregationParameter = formBbody.aggregationParameter;
  }
  if (typeof formBbody.rankingModel !== "undefined")
  {
    settings.rankingModel = formBbody.rankingModel;
  }


  if (typeof formBbody.keywordFrequency !== "undefined")
  {
    settings.keywordFrequency = formBbody.keywordFrequency;
  }
  if (typeof formBbody.dataSource !== "undefined")
  {
    settings.dataSource = formBbody.dataSource;
  }

  if (typeof formBbody.keywordFrequency !== "undefined")
  {
    settings.keywordFrequency = formBbody.keywordFrequency;
  }
  

  // Boolean specific
  if (typeof formBbody.boolean_trueTreshold !== "undefined")
  {
    settings.boolean_trueTreshold = formBbody.boolean_trueTreshold;
  }
  if (typeof formBbody.boolean_inBucketRanking !== "undefined")
  {
    settings.boolean_inBucketRanking = formBbody.boolean_inBucketRanking;
  }

  // Viret specific
  if (typeof formBbody.viret_trueTreshold !== "undefined")
  {
    settings.viret_trueTreshold = formBbody.viret_trueTreshold;
  }
  if (typeof formBbody.viret_queryOperations !== "undefined")
  {
    settings.viret_queryOperations = formBbody.viret_queryOperations;
  }

  return settings;
};

exports.convertSettingsObjectToNativeFormat = function(settings)
{ 
  let result = new Object();
  
  result.numResults = Number(settings.numResults);
  result.keywordFrequency = Number(settings.keywordFrequency);
  result.dataSource = Number(settings.dataSource);
  result.rankingModel = Number(settings.rankingModel);
  result.rankingModelSettings = new Array();
  {
    switch (result.rankingModel)
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
  
      // BooleanBucket
      case 1:
      {
        // 0 => 
        result.rankingModelSettings.push(settings.keywordFrequency);
        // 1 ->
        result.rankingModelSettings.push(settings.boolean_trueTreshold);
  
        // 2 =>
        result.rankingModelSettings.push(settings.boolean_inBucketRanking);
      }
      break;
  
      // ViretBase
      case 3:
      {

        result.rankingModelSettings.push(settings.keywordFrequency);

        // 0 =>
        result.rankingModelSettings.push(settings.viret_trueTreshold);
  
        // 1 =>
        result.rankingModelSettings.push(settings.viret_queryOperations);
      }
      break;
  
      default:
        throw "Unknown model type.";
    }  
  }
  result.aggregation = Number(settings.aggregation);
  result.aggregationSettings = new Array();
  {
    // Variable with all settings
    result.aggregationSettings.push(settings.aggregationParameter);
  }
  return result;
};

exports.setUserLevel =  function(sessionObject, level)
{
  sess.userLevel = level;
}

exports.resolveUserLevel = function(sessionObject)
{
  if (typeof sessionObject.userLevel === "undefined")
  {
    // If loged as developer
    if (sessionObject.isDev)
    {
      sessionObject.userLevel = 10;
    }
    else 
    {
      sessionObject.userLevel = 1;
    }
  }
}
