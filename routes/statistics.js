"use strict";

const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();

const stateCheck = require("./common/state_checkers");
const SessionState = require("./classes/SessionState");

/** Specific route settings. */
const routeSettings = {
  slug: "statistics",
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
  const sess = req.session;
  const viewData = stateCheck.initRequest(req);

  global.logger.log("debug", "Route: " + routeSettings.slug);

  // Main request cycle
  preProcessReq(req, viewData);
  processReq(req, viewData);
  postProcessReq(req, viewData);

  const dataPackId = SessionState.ranker_getDataPackId(sess.state);

  console.log("");
  console.log(JSON.stringify(viewData, null, 4));

  // Resolve and render dedicated template
  res.render(routeSettings.slug, viewData);
});

module.exports = router;
