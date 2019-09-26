
const util = require('util')

var RunModelTest = function (kwScDataType, aggFn, modelType, dataSource, settingsArray, aggSettingsArray) 
{
  // Run test in native code
  result = global.imageRanker.RunModelTest(kwScDataType, aggFn, modelType, dataSource, settingsArray, aggSettingsArray);

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


exports.ExportFile = function(req, res) 
{ 
  let responseData = {
    result: false,
    filename: "Something went wrong!"
  };

  
  // Send response
  res.jsonp(responseData);
};
