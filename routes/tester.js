"use strict";

const express = require("express");
const router = express.Router();
const path = require("path");

const SessionState = require("./classes/SessionState");
const stateCheck = require("./common/state_checkers");
const modelOptions = require(path.join(global.rootDir, global.gConfig.modelOptsInfoFpth));

/** Specific route settings. */
const routeSettings = {
  slug: "tester",
};

function preProcessReq(req, viewData) {
  stateCheck.genericPreProcessReq(req, viewData, routeSettings);
}

function processReq(req, viewData) {
  stateCheck.genericProcessReq(req, viewData, routeSettings);
}

function postProcessReq(req, viewData) {
  stateCheck.genericPostProcessReq(req, viewData, routeSettings);
}

/**
 * GET request handler
 */
router.get("/", function (req, res, next) {
  const viewData = stateCheck.initRequest(req);

  global.logger.log("debug", "Route: " + routeSettings.slug);

  // Main request cycle
  preProcessReq(req, viewData);

  if (SessionState.getUserLevel(req.session.state) < 10) {
    res.redirect(307, "/404");
  }

  processReq(req, viewData);
  postProcessReq(req, viewData);

  // Add options info
  const pack_type = SessionState.getActiveDataPackType(req.session.state);
  viewData.modelOptions = modelOptions[pack_type].options;

  //console.log(JSON.stringify(viewData, null, 4));

  // Resolve and render dedicated template
  res.render(routeSettings.slug, viewData);
});

module.exports = router;
