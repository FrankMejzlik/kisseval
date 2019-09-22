var express = require('express');

var path = require('path');
var fs = require('fs');


exports.getRelevantImagesFromPlainQuery = function(req, res) 
{
  const numResults = Number(req.query.num_results);
  const rankingModel = Number(req.query.ranking_model);
  const aggregation = Number(req.query.aggregation);

  let finalString = "";

  const kwIds = new Array();
  // If more than one
  if (typeof req.query.settings_array !== 'undefined') 
  {
      
    const kwIds = req.query.query.split(" ");

    for (var i = 0; i < kwIds.length; ++i)
    {
      finalString += kwIds[i] + "&";
    }

    finalString = finalString.slice(0, -1);
  }

  const settings = new Array();
  // If more than one
  if (typeof req.query.settings_array !== 'undefined') 
  {
      
    const arrToks = req.query.settings_array.split(" ");

    for (var i = 0; i < arrToks.length; ++i)
    {
      settings.push(arrToks[i]);
    }
  }

  const kwScDataType = new Object();
  kwScDataType.keywordsDataType = req.session.keywordsSettings.kwDataType;
  kwScDataType.scoringDataType = req.session.rankingSettings.scoringDataType;

  const relData = global.imageRanker.GetRelevantImages(kwScDataType, finalString, numResults, aggregation, rankingModel, settings, 0);
  const relevantImagesArray = relData.images;

  // Send response
  res.jsonp(relevantImagesArray);
};