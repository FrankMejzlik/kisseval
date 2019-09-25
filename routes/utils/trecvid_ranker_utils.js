const fs = require('fs');

const rankerUtils = require("./ranker_utils");

/**
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 * @type {Date}
 */

function timeStamp() {
  // Create a date object with the current time
    var now = new Date();
  
  // Create an array with the current month, day and time
    var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
  
  // Create an array with the current hour, minute and second
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
  
  // Determine AM or PM suffix based on the hour
    var suffix = ( time[0] < 12 ) ? "AM" : "PM";
  
  // Convert hour from military time
    time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
  
  // If hour is 0, set it to 12
    time[0] = time[0] || 12;
  
  // If seconds and minutes are less than 10, add a zero
    for ( var i = 1; i < 3; i++ ) {
      if ( time[i] < 10 ) {
        time[i] = "0" + time[i];
      }
    }
  
  // Return the formatted string
    return date.join("-") + "_" + time.join("-");
  }

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
    viewData.ui.ranker.queryInputUnlocked = true;
    viewData.ui.ranker.queryInput2Unlocked = true;
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

  //var date = new Date();
  //var timestamp = date.getTime();
  var dateString = timeStamp();

  sess.trecvidRun.outputFilepath = global.gConfig.outputPath + String(dateString) + "_" + String(runType) + ".xml";

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
  let descString = "";

  if (sess.ranker.settings.transformation.id == 100)
  {
    descString += "transformation: Softmax, ";
  }
  else if (sess.ranker.settings.transformation.id == 200)
  {
    descString += "transformation: Linear, ";
  }

  if (sess.ranker.settings.aggregationModel.id == 3)
  {
    descString += "model: Viret, ";
    if (sess.ranker.settings.aggregationModel.viret.queryOperations == 0)
    {
      descString += "Product + Sum";
    }
    else if (sess.ranker.settings.aggregationModel.viret.queryOperations == 1)
    {
      descString += "Product + Max";
    }
    else if (sess.ranker.settings.aggregationModel.viret.queryOperations == 2)
    {
      descString += "Sum + Sum";
    }
    else if (sess.ranker.settings.aggregationModel.viret.queryOperations == 3)
    {
      descString += "Sum + Max";
    }
  }
  else if (sess.ranker.settings.aggregationModel.id == 1)
  {
    descString += "model: Boolean, ";
  }


  let headerString = 
    '<!DOCTYPE videoAdhocSearchResults SYSTEM "https://www-nlpir.nist.gov/projects/tv2019/dtds/videoAdhocSearchResults.dtd">\n\n\
    <videoAdhocSearchResults>\n\
    \t<videoAdhocSearchRunResult trType="A" class="M" task="'+ sess.trecvidRun.runType + '" novelty="C" pid="SIRET" priority="1" desc="' + descString + '">\n';

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

  const elapsedTimeRounded = Math.round(elapsedTime * 10) / 10;

  let totalString = '\t\t <videoAdhocSearchTopicResult tNum="' + taskId + '" elapsedTime="' + elapsedTimeRounded + '">\n';

  for (i in shots)
  {
    const iNum = Number(i) + 1;
    // Add enough zeros
    const videoIdPadded = String(shots[i].videoId).padStart(5, '0');

    totalString += 
    '\t\t\t <item seqNum="'+ iNum + '" shotId="shot' + videoIdPadded + '_' + shots[i].shotId + '"/> \n';
  }

  totalString += '\t\t</videoAdhocSearchTopicResult>\n';

  // Append to file
  fs.appendFileSync(sess.trecvidRun.outputFilepath, totalString);
}