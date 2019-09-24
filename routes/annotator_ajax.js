
const util = require('util');
const fs = require("fs");
var path = require('path');

let prefixCache = new Array();

function writePrefixCache(kwDataType)
{
  let origArr = prefixCache;
  prefixCache = new Array();

  var today = new Date();
  let todayString = String(today.getDate()) + "-" + String(today.getMonth()) + "-" + String(today.getFullYear());

  const filepath = path.join(global.rootDir, global.gConfig.outputDir + '/autocomplete/' + todayString + "." + kwDataType +  ".log");

  let file = fs.createWriteStream(filepath, {flags: 'a'});
  file.on('error', function(err) 
  { 
    return;
  });
  origArr.forEach(function(v) { file.write(v + '\n'); });
  file.end();

  
}

exports.GetNearKeywords = function(req, res) 
{
  const sess = req.session;

  const prefix = req.query.queryValue;
  const kwDataType = req.session.keywordsSettings.kwDataType;
  const scoringDataType = req.session.rankingSettings.scoringDataType;
  const withExamples = sess.annotatorSettings.autocompleteWithExamples;

  var nearKeywords = global.imageRanker.GetNearKeywords(kwDataType, scoringDataType, prefix, sess.annotatorSettings.numSuggestions, withExamples);

  prefixCache.push("<" + String(sess.id) + ">:" +  prefix);
  if (prefixCache.length > 100)
  {
    writePrefixCache(kwDataType);
  }

  // Send response
  res.jsonp(nearKeywords);
};

exports.GetNearKeywordsWithExamples = function(req, res) 
{
  const sess = req.session;

  const prefix = req.query.queryValue;
  const kwDataType = req.session.keywordsSettings.kwDataType;
  const scoringDataType = req.session.rankingSettings.scoringDataType;

  var nearKeywords = global.imageRanker.GetNearKeywords(kwDataType, scoringDataType, prefix, sess.annotatorSettings.numSuggestions, true);

  prefixCache.push("<" + String(sess.id) + ">:" +  prefix);
  if (prefixCache.length > 100)
  {
    writePrefixCache(kwDataType);
  }

  // Send response
  res.jsonp(nearKeywords);
};