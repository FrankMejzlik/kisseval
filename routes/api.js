var express = require('express');

var path = require('path');
var fs = require('fs');


exports.getRelevantImagesFromPlainQuery = function(req, res) 
{
  // const rankingModel = 1;
  // const aggregation = 2;
  // const settings = ["0.869999", "1"];


  // const relData = global.imageRanker.GetRelevantImagesPlainQuery(finalString, 500, aggregation, rankingModel, settings, targetImageId);
  // const relevantImagesArray = relData.images;
  // const targetImageRank = relData.targetImageRank;


  // data.query = finalString;
  // data.relevantImagesArray = relevantImagesArray;
  // data.keywords = keywordsWords;
  // data.targetImageRank = targetImageRank;
  // data.targetImageId = targetImageId;

  const testResponse = new Object();
  testResponse.a = "aaa";
  testResponse.b = [1,3,4,5,6];
  testResponse.c = 29;

  // Send response
  res.jsonp(testResponse);
};