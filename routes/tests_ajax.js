
const util = require('util')

var foo = function (req, res, next) 
{
  // Run test in native code
  result = global.imageRanker.RunModelTest(req, res, next);

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

  const formDataArray = req.query.formData;

  for (var i = 0; i <formDataArray.length; ++i)
  {
    const modelType = Number(formDataArray[i].modelType);
    const dataSource = Number(formDataArray[i].dataSource);
    const probTreshold = Number(formDataArray[i].probTreshold);
  
    const chartData = foo(modelType, dataSource, probTreshold);


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
