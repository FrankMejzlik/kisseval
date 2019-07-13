const fs = require('fs');

const rankerUtils = require("./ranker_utils");

exports.initOrResumeTrecvidTaskSession = function(sess, viewData) 
{
  global.logger.log('debug', "=> initOrResumeTrecvidTaskSession");

  // If no search session runnig
  if (typeof sess.ranker.trecvidSession === "undefined")
  {
    global.logger.log('debug', "Session " + sess.id + " has no active TRECVID task session.");

    // Fill dummy view data
    viewData.ranker = new Object();
    viewData.ranker.settings = sess.ranker.settings;
    
    viewData.ui = new Object();
    viewData.ui.queryInputUnlocked = true; 

  }
  // Search session running
  else 
  {
    global.logger.log('debug', "Session " + sess.id + " has active TRECVID task session: " + JSON.stringify(sess.trecvidSession, undefined, 4));
    global.logger.log('debug', "with model settings: " + JSON.stringify(sess.ranker.settings, undefined, 4));

    // Fill vew data
    viewData.ranker = new Object()
    viewData.ranker.settings = sess.ranker.settings;

    viewData.trecvidSession = new Object()
    viewData.trecvidSession = sess.trecvidSession;
    
    // Unlock input
    viewData.ui = new Object();
    viewData.ui.queryInputUnlocked = true;
  }

  viewData.ranker.settings.aggregationModelSimple = rankerUtils.getModelNumberNameFromSession(sess);

  global.logger.log('debug', "<= initOrResumeTrecvidTaskSession");
}

exports.startTrecvidTaskSession = function(sess)
{
  global.logger.log('debug', "=> startTrecvidTaskSession()");

  // Start new
  if (typeof sess.trecvidSession === "undefined")
  {
    sess.trecvidSession = new Object();
    sess.trecvidSession.currTaskIdx = 0;
  }
 

  var date = new Date();
  var timestamp = date.getTime();
  sess.trecvidSession.startTimestamp = timestamp;

  global.logger.log('debug', "Starting TRECVID task for session id " + sess.id + " with ID " + sess.trecvidSession.currTaskIdx + ".");

  global.logger.log('debug', "<= startTrecvidTaskSession()");
}


exports.startTrecvidRun = function(sess, tasksFilepath, runType)
{
  global.logger.log('debug', "=> startTrecvidRun()");

  // Parse tasks from file
  let fileArray = fs.readFileSync(tasksFilepath, 'utf8').toString().split("\n");

  // Extract tasks from file
  let tasks = new Array();
  for (i in fileArray)
  {
    const splitLine = fileArray[i].split(" ");

    const taskId = splitLine[0];
    splitLine.shift();
    const taskString = splitLine.join(" ");

    let task = new Object();
    task.id = taskId;
    task.string = taskString;

    // Add this task
    tasks.push(task);
  }

  // Start new
  sess.trecvidRun = new Object();

  var date = new Date();
  var timestamp = date.getTime();
  sess.trecvidRun.outputFilepath = global.gConfig.outputPath + String(timestamp) + "_" + String(runType) + ".xml";

  sess.trecvidRun.runType = runType;
  sess.trecvidRun.tasks = tasks;

  // ============================
  // Print XML header
  this.printXmlHeader(sess);
  // ============================

  global.logger.log('debug', "Starting TRECVID run for session id " + sess.id + ".");

  global.logger.log('debug', "<= startTrecvidRun()");
}

exports.terminateTrecvidRun = function(sess)
{
  global.logger.log('debug', "=> terminateTrecvidRun()");

  

  // ============================
  // Print XML footer
  this.printXmlFooter(sess);
  // ============================


  // Just reset this trecvid run
  sess.trecvidRun = undefined;

  global.logger.log('debug', "Terminated TRECVID run for session id " + sess.id + ".");

  global.logger.log('debug', "<= terminateTrecvidRun()");
}

exports.printXmlHeader = function(sess)
{
  let headerString = 
    '<videoAdhocSearchResults>\n\
    \t<videoAdhocSearchRunResult trType="A" class="M" task="'+ sess.trecvidRun.runType + '" novelty="C" pid="SIRET" priority="1" desc="">\n';

  // Append to file
  fs.appendFileSync(sess.trecvidRun.outputFilepath, headerString);
}

exports.printXmlFooter = function(sess)
{
  let footerString = 
  '\t</videoAdhocSearchRunResult>\n\
  </videoAdhocSearchResults>\n';

  // Append to file
  fs.appendFileSync(sess.trecvidRun.outputFilepath, footerString);
}

exports.printXmlShots = function(sess, elapsedTime, shots)
{
  const taskId = sess.trecvidRun.tasks[sess.trecvidSession.currTaskIdx].id;

  let totalString = '\t\t <videoAdhocSearchTopicResult tNum="' + taskId + '" elapsedTime="' + elapsedTime + '">\n';
  let i = 0;
  for (i in shots)
  {
    ++i;

    // Add enough zeros
    const shotIdPadded = String(shots[i].videoId).padStart(5, '0');

    totalString = 
    '\t\t\t <item seqNum="'+ i + '" shotId="shot' + shotIdPadded + '_' + shots[i].shotId + '"/> \n';
  
    // Append to file
    fs.appendFileSync(sess.trecvidRun.outputFilepath, footerString);
  }

  totalString += '\t\t</videoAdhocSearchTopicResult>';
  
}