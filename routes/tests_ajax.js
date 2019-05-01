
const util = require('util')

var RunModelTest = function (aggFn, modelType, dataSource, settingsArray) 
{
  // Run test in native code
  result = global.imageRanker.RunModelTest(aggFn, modelType, dataSource, settingsArray);

  return result;
}

var RunGridTestWrapper = function (aggFn, modelType, dataSource, settingsArray) 
{
  // Run grid test in native library
  result = global.imageRanker.RunGridTest(aggFn, modelType, dataSource, settingsArray);

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

  for (var i = 0; i <formDataArray.length; ++i)
  {
    const aggFn = Number(formDataArray[i].aggregation);
    const modelType = Number(formDataArray[i].modelType);
    const dataSource = Number(formDataArray[i].dataSource);

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

    // Run model test
    const chartData = RunModelTest(aggFn, modelType, dataSource, settingsArray);

    // Insert this result data to array
    responseData.chartDataArray.push(chartData);
  }

  


  

  // Send response
  res.jsonp(responseData);
};



exports.RunGridTest = function(req, res) 
{
  // Construct response Object
  let  responseData = new Object();
  
  responseData.chartDataArray = new Array();  

  const formDataArray = req.query.submitData.formData;
  const formId = req.query.submitData.formId;
  responseData.formId = formId;

  for (var i = 0; i <formDataArray.length; ++i)
  {
    const aggFn = Number(formDataArray[i].aggregation);
    const modelType = Number(formDataArray[i].modelType);
    const dataSource = Number(formDataArray[i].dataSource);

    // Variable with all settings
    const settingsArray = new Array();

    // Settings
    // Boolean custom
    const probTreshold = formDataArray[i].trueTreshold;
    settingsArray.push(probTreshold);


    // Viret base
    const probTreshold4 = formDataArray[i].trueTreshold4;
    const queryOperations = formDataArray[i].queryOperations;
    settingsArray.push(probTreshold4);
    settingsArray.push(queryOperations);

    // 3: bucket sorting
    const inBucketRanking = formDataArray[i].inBucketRanking;
    settingsArray.push(inBucketRanking);

    

    const chartData = RunGridTestWrapper(aggFn, modelType, dataSource, settingsArray);

    


    // Insert this result data to array
    responseData.chartDataArray.push(chartData);
  }

  


  // const chartData = [
  //   { index: 0, value: 10 },
  //   { index: 1, value: 20 },
  //   { index: 2, value: 30 },
  //   { index: 3, value: 40 },
  //   { index: 4, value: 40.32 },
  //   { index: 5, value: 50.3 },
  //   { index: 6, value: 60.4 }
  // ];

  

  // Send response
  res.jsonp(responseData);
};
