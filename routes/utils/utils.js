

const rankerUtils = require("./ranker_utils");

exports.parseModelSettingsFromForm = function(sess, formBbody)
{ 
  rankerUtils.checkOrInitSessionRankerObject(sess);

  // Get reference to current values
  const settings = sess.ranker.settings;
  
  //
  // If some are set, just overwrite them
  //

  // Number of results
  if (typeof formBbody.numResults !== "undefined")
  {
    settings.numResults = Number(formBbody.numResults);
  }   
  // Keyword frequency settings
  if (typeof formBbody.keywordFrequency !== "undefined")
  {
    settings.keywordFrequency = Number(formBbody.keywordFrequency);
  }

  // Transformation
  {
    // Transformation ID
    if (typeof formBbody.aggregation !== "undefined")
    {
      settings.transformation.id = Number(formBbody.aggregation);
    }
    // Transformation parameter
    if (typeof formBbody.aggregationParameter !== "undefined")
    {
      settings.transformation.parameter = Number(formBbody.aggregationParameter);
    }
  }

  // Aggregation model
  {
    // Aggregation model ID
    if (typeof formBbody.rankingModel !== "undefined")
    {
      settings.aggregationModel.id = Number(formBbody.rankingModel);
    }

    // Boolean specific
    if (typeof formBbody.boolean_trueTreshold !== "undefined")
    {
      settings.aggregationModel.boolean.trueTreshold = Number(formBbody.boolean_trueTreshold);
    }
    if (typeof formBbody.boolean_inBucketRanking !== "undefined")
    {
      settings.aggregationModel.boolean.inBucketRanking = Number(formBbody.boolean_inBucketRanking);
    }

    // Viret specific
    if (typeof formBbody.viret_trueTreshold !== "undefined")
    {
      settings.aggregationModel.viret.trueTreshold = Number(formBbody.viret_trueTreshold);
    }
    if (typeof formBbody.viret_queryOperations !== "undefined")
    {
      settings.aggregationModel.viret.queryOperations = Number(formBbody.viret_queryOperations);
    }
   
  }

  // Model tests
  {
    if (typeof formBbody.dataSource !== "undefined")
    {
      settings.modelTests.dataSource = Number(formBbody.dataSource);
    }
    
  }

  // Simulated user
  {
    if (typeof formBbody.simulatedUser_exponent !== "undefined")
    {
      settings.simulatedUser.exponent = Number(formBbody.simulatedUser_exponent);
    }
  }

  return settings;
};

exports.convertSettingsObjectToNativeFormat = function(settings)
{ 
  let result = new Object();
  
  result.numResults = Number(settings.numResults);
  result.keywordFrequency = Number(settings.keywordFrequency);

  result.dataSource = Number(settings.modelTests.dataSource);


  // =========================================
  // Simulated user settings

  result.simulatedUserSettings = new Array();

  // 0 => Simulated user exponent
  result.simulatedUserSettings.push(String(settings.simulatedUser.exponent));



  //===========================================
  // Ranking model settings

  result.rankingModel = Number(settings.aggregationModel.id);
  result.rankingModelSettings = new Array();
  {
    switch (result.rankingModel)
    {
      // Boolean
      case 1:
      {
        // 0 => 
        result.rankingModelSettings.push(String(settings.keywordFrequency));
        
        // 1 ->
        result.rankingModelSettings.push(String(settings.aggregationModel.boolean.trueTreshold));
  
        // 2 =>
        result.rankingModelSettings.push(String(settings.aggregationModel.boolean.inBucketRanking));
      }
      break;
  
      // ViretBase
      case 3:
      {

        result.rankingModelSettings.push(String(settings.keywordFrequency));

        // 0 =>
        result.rankingModelSettings.push(String(settings.aggregationModel.viret.trueTreshold));
  
        // 1 =>
        result.rankingModelSettings.push(String(settings.aggregationModel.viret.queryOperations));
      }
      break;
  
      default:
        throw "Unknown model type.";
    }  
  }

  //
  // Temporal queries setup
  //
  // Setup inner and outter temporal query operations
  if (
    settings.aggregationModel.viret.queryOperations == "2" || settings.aggregationModel.viret.queryOperations == 2 ||
    settings.aggregationModel.viret.queryOperations == "3" || settings.aggregationModel.viret.queryOperations == 3 ||
    settings.aggregationModel.id == "1" || settings.aggregationModel.id == 1 // For Boolean
  ) 
  {
    // Outter set to SUM
    result.rankingModelSettings.push(String("0"));
  }
  else 
  {
    // Outter set to PRODUCT
    result.rankingModelSettings.push(String("1"));
  }
  
  // Inner always set to MAX
  result.rankingModelSettings.push(String("2"));



  result.aggregation = Number(settings.transformation.id);
  result.aggregationSettings = new Array();
  {
    // Variable with all settings
    result.aggregationSettings.push(String(settings.transformation.parameter));


    // If MAX inner operation
    if (
      settings.aggregationModel.viret.queryOperations == 1 ||
      settings.aggregationModel.viret.queryOperations == 3 ||
      settings.aggregationModel.viret.queryOperations == 4 ||
      settings.aggregationModel.boolean.inBucketRanking == 2
    )
    {
      result.aggregationSettings.push(String("1"));
    } 
    else 
    {
      result.aggregationSettings.push(String("0"));
    }

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
