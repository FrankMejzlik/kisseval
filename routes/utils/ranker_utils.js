

var eActions = { 
  "removeKeyword":0,
  "addKeyword":1 
};



exports.submitSearchSession = function(sess)
{
  global.logger.log('debug', "<= submitSearchSession()");


  global.logger.log('debug', "Submitting search session for session id " + sess.id + " with ID " + sess.ranker.searchSession.id + ".");


  global.logger.log('debug', "<= submitSearchSession()");
}

exports.terminateSearchSession = function(sess)
{
  global.logger.log('debug', "=> terminateSearchSession()");
  
  // If not set at all
  if (typeof sess.ranker === "undefined")
  {
    // Nothing to do
    global.logger.log('debug', "<= terminateSearchSession()");
    return;
  }
  if (typeof sess.ranker.searchSession === "undefined")
  {
    // Nothing to do
    global.logger.log('debug', "<= terminateSearchSession()");
    return;
  }

  sess.ranker.query = undefined;

  global.logger.log('debug', "Terminating search session for session id " + sess.id + " with ID " + sess.ranker.searchSession.id + ".");  

  // Reset it
  sess.ranker.searchSession = undefined;

  global.logger.log('debug', "<= terminateSearchSession()");
}

exports.startSearchSession = function(sess, imageId, imageSrc)
{
  global.logger.log('debug', "=> startSearchSession()");

  if (typeof sess.ranker === "undefined")
  {
    sess.ranker = new Object();
  }

  // Start new
  sess.ranker.searchSession = new Object();
  // Git it unique ID
  sess.ranker.searchSession.id = sess.ranker.searchSessionCounter;
  sess.ranker.searchSession.imageId = imageId;
  sess.ranker.searchSession.imageSrc = imageSrc;
  sess.ranker.searchSession.query = new Array();
  sess.ranker.searchSession.actionsArray = new Array();

  global.logger.log('debug', "Starting search session for session id " + sess.id + " with ID " + sess.ranker.searchSession.id + ".");

  // Increment counter
  ++sess.ranker.searchSessionCounter;

  global.logger.log('debug', "<= startSearchSession()");
}

exports.pushAction = function(sess, action, operand, score)
{
  global.logger.log('debug', "=> pushAction()");

  // Create object for this action
  const newAction = new Object();
  newAction.action = action;
  newAction.operand = operand;
  newAction.score = score;

  global.logger.log('debug', "Pushing action, session ID = " + sess.id + ", search session ID =  " + sess.ranker.searchSession.id);
  global.logger.log('debug', "newAction:"+ JSON.stringify(newAction, undefined, 4));

  // Store it in session
  sess.ranker.searchSession.actionsArray.push(newAction);

  global.logger.log('debug', "<= pushAction()");
}
