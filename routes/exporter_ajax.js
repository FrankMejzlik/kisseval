
const util = require('util');
const path = require('path');

exports.ExportFile = function(req, res) 
{ 
  let sess = req.session;
  global.logger.log('debug', "<"+ sess.id + ">: => ExportFile()");
  
  global.logger.log('debug', "newAction: " + JSON.stringify(req.query, undefined, 4));
  
  const kwScDataType = {
    keywordsDataType: req.body.kwTypeId,
    scoringDataType: req.body.scTypeId
  }

  const fileTypeId = req.body.fileType;
  
  let filename;
  let kkk = "";

  switch(fileTypeId)
  {
    case 0:
        filename = "user_annotator_queries";
        kkk = "eUserAnnotatorQueries";
    break;

    case 1:
        filename = "net_normalized_scores";
        kkk = "eNetNormalizedScores";
    break;

    case 2:
        filename = "query_num_hits";
        kkk = "eQueryNumHits";
    break;
  }

  

  filename = filename + "." + String(kwScDataType.keywordsDataType) + "." + String(kwScDataType.scoringDataType) + ".txt";
  global.logger.log('debug', "<"+ sess.id + ">: => b");
  const outputFilepath = path.join(global.rootDir, "/public/", global.gConfig.exportDir, filename);

  global.logger.log('debug', "<"+ sess.id + ">: Exporting file...");
  global.logger.log('debug', "<"+ sess.id + ">: kwScDataType = " + JSON.stringify(kwScDataType, undefined, 4));
  global.logger.log('debug', "<"+ sess.id + ">: fileTypeId = " + String(fileTypeId));
  global.logger.log('debug', "<"+ sess.id + ">: outputFilepath = " + String(outputFilepath));


  let responseData = {
    result: false,
    filename: "Something went wrong!"
  };

  
  let resultFilename;
  
  try 
  {
    // ======================================================
    // ======================================================
    resultFilename = global.imageRanker.ExportDataFile(kwScDataType, fileTypeId, outputFilepath);
    // ======================================================
    // ======================================================
  } 
  catch(err)
  {
    global.logger.log('error', "<"+ sess.id + ">: Exporting data file failed! (imageRanker.ExportDataFile())");

    res.jsonp(responseData);
    return;
  }

  responseData.result = true;
  responseData.filename = global.gConfig.exportDir + filename;

  const iii = String(req.body.kwTypeId);
  const jjj =  String(req.body.scTypeId);

  global.logger.log('debug', "<"+ sess.id + ">: => c");

  // Save to app context
  global.exportedFiles['id' + iii]['id' + jjj][kkk] = global.gConfig.exportDir + filename;

  global.logger.log('debug', "<"+ sess.id + ">: Exported file '" + outputFilepath +"'");


  global.logger.log('debug', "<"+ sess.id + ">: <= ExportFile()");
  res.jsonp(responseData);
};



