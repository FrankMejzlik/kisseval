
const util = require('util');
const utils = require("../routes/utils/utils");

var RunModelTest = function (aggFn, modelType, dataSource, simulatedUserSettings, settingsArray, aggSettingsArray) 
{
  // Run test in native code
  result = global.imageRanker.RunModelTest(aggFn, modelType, dataSource, simulatedUserSettings, settingsArray, aggSettingsArray);

  return result;
}

var RunGridTestWrapper = function (testSettings) 
{
  // Run grid test in native library
  result = global.imageRanker.RunGridTest(testSettings);

  return result;
}

var GetGridProgressWrapper = function () 
{
  // Run grid test in native library
  result = global.imageRanker.GetGridTestProgress();

  return result;
}


exports.RunModelTest = function(req, res) 
{
  // Construct response Object
  let  responseData = new Object();
  
  responseData.chartDataArray = new Array();  

  const formDataArray = req.query.submitData.formData;
  const formId = req.query.submitData.formId;
  responseData.formId = formId;

  for (var i = 0; i < formDataArray.length; ++i)
  {
    const nativeModelSettings = utils.convertSettingsObjectToNativeFormat(utils.parseModelSettingsFromForm(formDataArray[i]));

    // Run model test
    const chartData = RunModelTest(
      nativeModelSettings.aggregation,
      nativeModelSettings.rankingModel, 
      nativeModelSettings.dataSource, 
      nativeModelSettings.simulatedUserSettings, 
      nativeModelSettings.rankingModelSettings, 
      nativeModelSettings.aggregationSettings
      );

    // Insert this result data to array
    responseData.chartDataArray.push(chartData);
  }

  // Send response
  res.jsonp(responseData);
};



exports.GetGridTestProgress = function(req, res) 
{

  const gridTestResults = GetGridProgressWrapper();

  // Send response
  res.jsonp(gridTestResults);
}

exports.RunGridTest = function(req, res) 
{
  // Construct response Object
  let  responseData = new Object();

  const formDataArray = req.query.submitData.formData;

  const formId = req.query.submitData.formId;
  responseData.formId = formId;
  
  responseData.gridTestResults = new Array();

  let  testSettingsArray = new Array();

  if (typeof formDataArray !== 'undefined' ) {
    for (var i = 0; i < formDataArray.length; ++i)
    {
      const oneTestArray = new Array();

      const aggFn = Number(formDataArray[i].aggregation);
      oneTestArray.push(aggFn);
      const modelType = Number(formDataArray[i].modelType);
      oneTestArray.push(modelType);
      const dataSource = Number(formDataArray[i].dataSource);
      oneTestArray.push(dataSource);

      const aggregationParam = String(req.body.aggregationParam);

      // Variable with all settings
      const settingsArray = new Array();

      // Construct settings array based on model
      switch (modelType)
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
          const probTreshold = formDataArray[i].trueTreshold;
          settingsArray.push(probTreshold);

          // 1 =>
          const inBucketRanking = formDataArray[i].inBucketRanking;
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
          const probTreshold4 = formDataArray[i].trueTreshold4;
          settingsArray.push(probTreshold4);

          // 1 =>
          const queryOperations = formDataArray[i].queryOperations;
          settingsArray.push(queryOperations);
        }
        break;

        // FuzzyLogic
        case 4:

        break;

        default:
          throw "Unknown model type.";
      }

      oneTestArray.push(settingsArray);


      // Variable with all settings
      const aggSettingsArray = new Array();
      aggSettingsArray.push(aggregationParam);

      oneTestArray.push(aggSettingsArray);

      testSettingsArray.push(oneTestArray);
    }
  } 
  else 
  {
    
  }
  
    // Run model test
    const gridTestResults = RunGridTestWrapper(testSettingsArray);

    // Insert this result data to array
    responseData.gridTestResults = gridTestResults;

  

  // Send response
  res.jsonp(responseData);
};
