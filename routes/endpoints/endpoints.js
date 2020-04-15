const util = require('util');
const fs = require("fs");
var path = require('path');

const sessState = require("../modules/SessionState");

exports.setActiveDataPack = function(req, res) 
{
  let sess = req.session;

  const newDataPackId = req.body.dataPackId;
  
  // Set new state
  sessState.setActieDataPack(sess.state, newDataPackId);

  global.logger.log('info', "Active data pack changed to  '" + newDataPackId + "'");
  res.jsonp(true);
};