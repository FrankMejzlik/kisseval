
const util = require('util')

var foo = function (aggFn, modelType, dataSource, settingsArray) 
{
  // Run test in native code
  result = global.imageRanker.RunModelTest(aggFn, modelType, dataSource, settingsArray);

  return result;
}

exports.RunBooleanCustomModelTest = function(req, res) 
{
  // PARAMS: 
  //    ImageRanker::QueryOrigin::cDeveloper | ImageRanker::QueryOrigin::cPublic  Source data
  //    Treshold for probability if is in the picture
  //  

  // var word = req.query.imageId;

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

    

    const chartData = foo(aggFn, modelType, dataSource, settingsArray);

    


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
