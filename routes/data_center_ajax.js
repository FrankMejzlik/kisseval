
const util = require('util');
const path = require('path');

exports.GetAnnotatorUserData = function(req, res) 
{ 
  let sess = req.session;
  global.logger.log('debug', "<"+ sess.id + ">: => GetAnnotatorUserData()");
  
  const recordId = req.body.recordId;

  for(let i = 0; i < sess.annotatorRecords.length; ++i)
  {
    if (sess.annotatorRecords[i].id == recordId)
      res.jsonp(sess.annotatorRecords[i]);

  }
  

  global.dbConnectionsPool.query('SELECT `id`, `query`, `keyword_data_type`, `scoring_data_type`, `image_id`, `type`, `created`, `sessionId`, `manuallyValidated` FROM ' + global.db.dbName + ';', 
  function (error, results, fields) 
  {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);

    res.jsonp(responseData);
  });

  global.logger.log('debug', "<"+ sess.id + ">: <= GetAnnotatorUserData()");
  
};


exports.ValidateUserDataRecord = function(req, res) 
{ 
  let sess = req.session;
  global.logger.log('debug', "<"+ sess.id + ">: => ValidateUserDataRecord()");

  // Validate => 1 OR delete => 0
  const action = req.body.action;

  responseData = [
    [123, "aa", true],
    [343, "b", true],
    [523, "ccc", false],
  ];

  

  global.logger.log('debug', "<"+ sess.id + ">: <= ValidateUserDataRecord()");
  res.jsonp(responseData);
};
